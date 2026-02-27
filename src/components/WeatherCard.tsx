import { Cloud, CloudRain, Sun, Wind, Droplets, Eye } from 'lucide-react';
import type { Language } from '../lib/translations';

interface WeatherCardProps {
  language: Language;
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
    clouds: number;
  };
  loading?: boolean;
}

const translations = {
  en: {
    currentWeather: 'Current Weather',
    feelsLike: 'Feels like',
    humidity: 'Humidity',
    wind: 'Wind',
    cloudCover: 'Cloud Cover',
    loading: 'Loading weather...',
  },
  hi: {
    currentWeather: 'वर्तमान मौसम',
    feelsLike: 'महसूस होता है',
    humidity: 'नमी',
    wind: 'हवा',
    cloudCover: 'बादल',
    loading: 'मौसम लोड हो रहा है...',
  },
};

function getWeatherIcon(main: string) {
  switch (main.toLowerCase()) {
    case 'clear':
      return <Sun className="w-12 h-12 text-yellow-500" />;
    case 'rain':
    case 'drizzle':
      return <CloudRain className="w-12 h-12 text-blue-500" />;
    case 'clouds':
      return <Cloud className="w-12 h-12 text-gray-500" />;
    default:
      return <Cloud className="w-12 h-12 text-gray-400" />;
  }
}

export function WeatherCard({ language, current, loading }: WeatherCardProps) {
  const t = translations[language];

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-16 bg-gray-200 rounded w-full mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-lg p-6 border border-blue-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Eye className="w-5 h-5 text-blue-600" />
        {t.currentWeather}
      </h3>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {getWeatherIcon(current.weather.main)}
          <div>
            <div className="text-4xl font-bold text-gray-900">{current.temp}°</div>
            <div className="text-sm text-gray-600 capitalize">{current.weather.description}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-gray-700">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
            <Sun className="w-4 h-4 text-orange-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">{t.feelsLike}</div>
            <div className="font-semibold">{current.feels_like}°</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">{t.humidity}</div>
            <div className="font-semibold">{current.humidity}%</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
            <Wind className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">{t.wind}</div>
            <div className="font-semibold">{current.wind_speed} km/h</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-700">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <Cloud className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <div className="text-xs text-gray-500">{t.cloudCover}</div>
            <div className="font-semibold">{current.clouds}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
