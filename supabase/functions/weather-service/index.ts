import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface WeatherRequest {
  latitude: number;
  longitude: number;
  units?: 'celsius' | 'fahrenheit';
}

interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    weather: {
      main: string;
      description: string;
      icon: string;
    };
    uvi: number;
    clouds: number;
  };
  forecast: Array<{
    date: string;
    temp_max: number;
    temp_min: number;
    humidity: number;
    wind_speed: number;
    pop: number; // probability of precipitation
    weather: {
      main: string;
      description: string;
      icon: string;
    };
  }>;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader || '' },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const body: WeatherRequest = await req.json();
    const { latitude, longitude, units = 'celsius' } = body;

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ error: 'Latitude and longitude are required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const locationKey = `${latitude.toFixed(2)}_${longitude.toFixed(2)}`;

    // Check cache first
    const { data: cachedWeather } = await supabase
      .from('weather_cache')
      .select('*')
      .eq('location_key', locationKey)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (cachedWeather && cachedWeather.weather_data && cachedWeather.forecast_data) {
      return new Response(
        JSON.stringify({
          current: cachedWeather.weather_data,
          forecast: cachedWeather.forecast_data,
          cached: true,
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Fetch from OpenWeatherMap API
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'Weather API key not configured',
          message: 'Please add OPENWEATHER_API_KEY to your Supabase secrets'
        }),
        {
          status: 503,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const tempUnit = units === 'fahrenheit' ? 'imperial' : 'metric';

    // Fetch current weather and forecast
    const [currentResponse, forecastResponse] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${tempUnit}&appid=${apiKey}`
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${tempUnit}&appid=${apiKey}`
      ),
    ]);

    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('Failed to fetch weather data from OpenWeatherMap');
    }

    const currentData = await currentResponse.json();
    const forecastData = await forecastResponse.json();

    // Process current weather
    const current = {
      temp: Math.round(currentData.main.temp),
      feels_like: Math.round(currentData.main.feels_like),
      humidity: currentData.main.humidity,
      wind_speed: Math.round(currentData.wind.speed * 10) / 10,
      weather: {
        main: currentData.weather[0].main,
        description: currentData.weather[0].description,
        icon: currentData.weather[0].icon,
      },
      uvi: currentData.uvi || 0,
      clouds: currentData.clouds.all,
    };

    // Process 7-day forecast (take one reading per day at noon)
    const dailyForecasts = new Map();

    for (const item of forecastData.list) {
      const date = item.dt_txt.split(' ')[0];
      const hour = parseInt(item.dt_txt.split(' ')[1].split(':')[0]);

      // Take the noon reading (12:00) or closest to it
      if (hour === 12 || !dailyForecasts.has(date)) {
        dailyForecasts.set(date, {
          date,
          temp_max: Math.round(item.main.temp_max),
          temp_min: Math.round(item.main.temp_min),
          humidity: item.main.humidity,
          wind_speed: Math.round(item.wind.speed * 10) / 10,
          pop: Math.round(item.pop * 100),
          weather: {
            main: item.weather[0].main,
            description: item.weather[0].description,
            icon: item.weather[0].icon,
          },
        });
      }
    }

    const forecast = Array.from(dailyForecasts.values()).slice(0, 7);

    // Update cache
    await supabase
      .from('weather_cache')
      .upsert({
        location_key: locationKey,
        weather_data: current,
        forecast_data: forecast,
        cached_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      }, {
        onConflict: 'location_key',
      });

    // Analyze weather for treatment timing
    const treatmentTiming = analyzeTreatmentTiming(current, forecast);

    return new Response(
      JSON.stringify({
        current,
        forecast,
        treatmentTiming,
        cached: false,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in weather service:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

function analyzeTreatmentTiming(current: any, forecast: any[]): {
  recommendation: string;
  alertLevel: 'favorable' | 'warning' | 'critical';
  reason: string;
} {
  const alerts = [];

  // Check for rain in next 24-48 hours
  const rainInNext24h = forecast.slice(0, 2).some(day => day.pop > 50);
  const rainInNext48h = forecast.slice(0, 3).some(day => day.pop > 50);

  // Check wind speed
  const highWind = current.wind_speed > 15; // km/h or mph depending on units

  // Check if it's currently raining
  const currentlyRaining = current.weather.main === 'Rain';

  if (currentlyRaining) {
    return {
      recommendation: 'Wait until rain stops before applying treatment',
      alertLevel: 'critical',
      reason: 'Currently raining',
    };
  }

  if (rainInNext24h) {
    return {
      recommendation: 'Delay treatment - rain expected within 24 hours',
      alertLevel: 'critical',
      reason: `Rain expected within 24 hours (${forecast.find(d => d.pop > 50)?.pop}% chance)`,
    };
  }

  if (highWind) {
    return {
      recommendation: 'Delay treatment - wind speed too high for effective application',
      alertLevel: 'warning',
      reason: `High wind speed (${current.wind_speed} km/h)`,
    };
  }

  if (rainInNext48h) {
    return {
      recommendation: 'Apply treatment soon - rain expected in 48 hours',
      alertLevel: 'warning',
      reason: 'Rain forecasted in 48 hours',
    };
  }

  // Ideal conditions
  return {
    recommendation: 'Good conditions for treatment application',
    alertLevel: 'favorable',
    reason: 'No rain expected, moderate wind, and good weather conditions',
  };
}
