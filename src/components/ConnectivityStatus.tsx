import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Signal } from 'lucide-react';
import { translate, type Language } from '../lib/translations';

type ConnectivityState = 'online' | 'low-bandwidth' | 'offline';

interface ConnectivityStatusProps {
  language: Language;
}

export function ConnectivityStatus({ language }: ConnectivityStatusProps) {
  const [status, setStatus] = useState<ConnectivityState>('online');

  useEffect(() => {
    function updateConnectivity() {
      if (!navigator.onLine) {
        setStatus('offline');
        return;
      }

      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

      if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
          setStatus('low-bandwidth');
        } else {
          setStatus('online');
        }
      } else {
        setStatus('online');
      }
    }

    updateConnectivity();

    window.addEventListener('online', updateConnectivity);
    window.addEventListener('offline', updateConnectivity);

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', updateConnectivity);
    }

    return () => {
      window.removeEventListener('online', updateConnectivity);
      window.removeEventListener('offline', updateConnectivity);
      if (connection) {
        connection.removeEventListener('change', updateConnectivity);
      }
    };
  }, []);

  const statusConfig = {
    online: {
      icon: Wifi,
      text: translate('connectivityOnline', language),
      color: 'text-emerald-700',
      bgColor: 'bg-gradient-to-r from-emerald-100 to-teal-100',
      borderColor: 'border-emerald-300',
      shadowColor: 'shadow-emerald-200',
    },
    'low-bandwidth': {
      icon: Signal,
      text: translate('connectivityLowBandwidth', language),
      color: 'text-yellow-700',
      bgColor: 'bg-gradient-to-r from-yellow-100 to-amber-100',
      borderColor: 'border-yellow-300',
      shadowColor: 'shadow-yellow-200',
    },
    offline: {
      icon: WifiOff,
      text: translate('connectivityOffline', language),
      color: 'text-red-700',
      bgColor: 'bg-gradient-to-r from-red-100 to-rose-100',
      borderColor: 'border-red-300',
      shadowColor: 'shadow-red-200',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border-2 ${config.bgColor} ${config.borderColor} shadow-lg ${config.shadowColor} transition-all duration-300 hover:scale-105 transform ${status !== 'online' ? 'animate-pulse' : ''}`}>
      <Icon className={`w-4 h-4 ${config.color} ${status === 'low-bandwidth' ? 'animate-pulse' : ''}`} />
      <span className={`text-sm font-black ${config.color}`}>
        {config.text}
      </span>
    </div>
  );
}
