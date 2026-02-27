import { Cloud, CloudRain, Sun, Droplets } from 'lucide-react';
import type { Language } from '../lib/translations';

interface ForecastDay {
  date: string;
  temp_max: number;
  temp_min: number;
  humidity: number;
  wind_speed: number;
  pop: number;
  weather: {
    main: string;
    description: string;
    icon: string;
  };
}

interface WeatherForecastProps {
  language: Language;
  forecast: ForecastDay[];
  loading?: boolean;
}

const translations = {
  en: {
    forecast: '7-Day Forecast',
    chanceOfRain: 'Rain',
    loading: 'Loading forecast...',
  },
  hi: {
    forecast: '7-दिन का पूर्वानुमान',
    chanceOfRain: 'बारिश',
    loading: 'पूर्वानुमान लोड हो रहा है...',
  },
};

function getWeatherIcon(main: string, size: 'sm' | 'md' = 'md') {
  const className = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';

  switch (main.toLowerCase()) {
    case 'clear':
      return <Sun className={`${className} text-yellow-500`} />;
    case 'rain':
    case 'drizzle':
      return <CloudRain className={`${className} text-blue-500`} />;
    case 'clouds':
      return <Cloud className={`${className} text-gray-500`} />;
    default:
      return <Cloud className={`${className} text-gray-400`} />;
  }
}

function formatDate(dateStr: string, language: Language): string {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return language === 'hi' ? 'आज' : 'Today';
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return language === 'hi' ? 'कल' : 'Tomorrow';
  }

  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  const locale = language === 'hi' ? 'hi-IN' : 'en-US';
  return date.toLocaleDateString(locale, options);
}

export function WeatherForecast({ language, forecast, loading }: WeatherForecastProps) {
  const t = translations[language];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {t.forecast}
      </h3>

      <div className="space-y-3">
        {forecast.map((day, index) => (
          <div
            key={day.date}
            className={`flex items-center justify-between p-4 rounded-lg transition-all ${
              index === 0
                ? 'bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-20 text-sm font-medium text-gray-700">
                {formatDate(day.date, language)}
              </div>

              <div className="flex items-center gap-2">
                {getWeatherIcon(day.weather.main, 'sm')}
              </div>

              <div className="flex items-center gap-2 flex-1">
                <span className="font-semibold text-gray-900">{day.temp_max}°</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">{day.temp_min}°</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {day.pop > 0 && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Droplets className="w-4 h-4" />
                  <span className="text-sm font-medium">{day.pop}%</span>
                </div>
              )}

              <div className="w-24 text-xs text-gray-500 text-right capitalize">
                {day.weather.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
