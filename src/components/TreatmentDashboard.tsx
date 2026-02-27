import { useState, useEffect } from 'react';
import { X, Calendar, Bell, Cloud } from 'lucide-react';
import { type Language } from '../lib/translations';
import { TreatmentHistory } from './TreatmentHistory';
import { RemindersList } from './RemindersList';
import { WeatherCard } from './WeatherCard';
import { WeatherForecast } from './WeatherForecast';
import { TreatmentTimingAdvisor } from './TreatmentTimingAdvisor';
import { supabase } from '../lib/supabase';

interface TreatmentDashboardProps {
  language: Language;
  userId: string;
  onClose: () => void;
}

export function TreatmentDashboard({ language, userId, onClose }: TreatmentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'plans' | 'reminders' | 'weather'>('plans');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    loadWeatherData();
  }, [userId]);

  async function loadWeatherData() {
    try {
      setWeatherLoading(true);
      setWeatherError(null);

      const { data: preferences } = await supabase
        .from('weather_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (preferences) {
        setUserLocation({ lat: preferences.latitude, lon: preferences.longitude });
        await fetchWeather(preferences.latitude, preferences.longitude);
      } else {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation({ lat: latitude, lon: longitude });
              await fetchWeather(latitude, longitude);

              await supabase.from('weather_preferences').insert({
                user_id: userId,
                latitude,
                longitude,
                location_name: 'Current Location',
                temperature_unit: 'celsius',
              });
            },
            () => {
              setWeatherError('weather_unavailable');
              setWeatherLoading(false);
            }
          );
        } else {
          setWeatherError('weather_unavailable');
          setWeatherLoading(false);
        }
      }
    } catch (error) {
      console.error('Error loading weather:', error);
      setWeatherError('weather_unavailable');
      setWeatherLoading(false);
    }
  }

  async function fetchWeather(latitude: number, longitude: number) {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weather-service`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ latitude, longitude, units: 'celsius' }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 503 || errorData.error?.includes('API key')) {
          setWeatherError('weather_unavailable');
        } else {
          throw new Error('Failed to fetch weather');
        }
        return;
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setWeatherError('weather_unavailable');
    } finally {
      setWeatherLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="glass-strong rounded-3xl shadow-2xl w-full max-w-6xl my-8 border border-white/20 backdrop-blur-xl animate-scale-in">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black">
              {language === 'hi' ? 'उपचार ट्रैकिंग' : 'Treatment Tracking'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-3 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('plans')}
              className={`flex items-center gap-2 px-6 py-3 font-black transition-all rounded-t-xl ${
                activeTab === 'plans'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-5 h-5" />
              {language === 'hi' ? 'उपचार योजनाएं' : 'Treatment Plans'}
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`flex items-center gap-2 px-6 py-3 font-black transition-all rounded-t-xl ${
                activeTab === 'reminders'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bell className="w-5 h-5" />
              {language === 'hi' ? 'रिमाइंडर' : 'Reminders'}
            </button>
            <button
              onClick={() => setActiveTab('weather')}
              className={`flex items-center gap-2 px-6 py-3 font-black transition-all rounded-t-xl ${
                activeTab === 'weather'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Cloud className="w-5 h-5" />
              {language === 'hi' ? 'मौसम' : 'Weather'}
            </button>
          </div>

          <div className="max-h-[600px] overflow-y-auto pr-2">
            {activeTab === 'plans' && (
              <TreatmentHistory language={language} userId={userId} />
            )}
            {activeTab === 'reminders' && (
              <RemindersList language={language} userId={userId} />
            )}
            {activeTab === 'weather' && (
              <div className="space-y-6">
                {weatherError && (
                  <div className={`rounded-xl p-6 ${
                    weatherError === 'weather_unavailable'
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className={`${weatherError === 'weather_unavailable' ? 'text-blue-800' : 'text-red-800'}`}>
                      {weatherError === 'weather_unavailable' ? (
                        <div className="space-y-2">
                          <p className="font-semibold">
                            {language === 'hi' ? 'मौसम सेवा अनुपलब्ध' : 'Weather Service Unavailable'}
                          </p>
                          <p className="text-sm">
                            {language === 'hi'
                              ? 'मौसम सुविधा वर्तमान में कॉन्फ़िगर नहीं है। यह सुविधा वैकल्पिक है और इसके बिना भी आप उपचार ट्रैकिंग का उपयोग कर सकते हैं।'
                              : 'Weather features are currently not configured. This feature is optional and you can still use treatment tracking without it.'}
                          </p>
                        </div>
                      ) : (
                        <p>{weatherError}</p>
                      )}
                    </div>
                  </div>
                )}

                {weatherLoading && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">
                      {language === 'hi' ? 'मौसम डेटा लोड हो रहा है...' : 'Loading weather data...'}
                    </p>
                  </div>
                )}

                {weatherData && !weatherLoading && (
                  <>
                    {weatherData.treatmentTiming && (
                      <TreatmentTimingAdvisor
                        language={language}
                        recommendation={weatherData.treatmentTiming.recommendation}
                        alertLevel={weatherData.treatmentTiming.alertLevel}
                        reason={weatherData.treatmentTiming.reason}
                      />
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      <WeatherCard
                        language={language}
                        current={weatherData.current}
                      />
                      <WeatherForecast
                        language={language}
                        forecast={weatherData.forecast}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
