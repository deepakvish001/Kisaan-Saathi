import { AlertCircle, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import type { Language } from '../lib/translations';

interface TreatmentTimingProps {
  language: Language;
  recommendation: string;
  alertLevel: 'favorable' | 'warning' | 'critical';
  reason: string;
}

const translations = {
  en: {
    treatmentTiming: 'Treatment Timing Advice',
    bestTime: 'Best Time to Apply',
    morning: 'Early morning (6-9 AM) or late evening (5-7 PM)',
    avoidMidday: 'Avoid midday application when sun is strongest',
  },
  hi: {
    treatmentTiming: 'उपचार समय सलाह',
    bestTime: 'लागू करने का सर्वोत्तम समय',
    morning: 'सुबह जल्दी (6-9 पूर्वाह्न) या देर शाम (5-7 अपराह्न)',
    avoidMidday: 'दोपहर में आवेदन से बचें जब सूरज सबसे मजबूत हो',
  },
};

function getAlertIcon(level: 'favorable' | 'warning' | 'critical') {
  switch (level) {
    case 'favorable':
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
    case 'critical':
      return <AlertCircle className="w-6 h-6 text-red-500" />;
  }
}

function getAlertColor(level: 'favorable' | 'warning' | 'critical') {
  switch (level) {
    case 'favorable':
      return 'from-green-50 to-emerald-50 border-green-200';
    case 'warning':
      return 'from-yellow-50 to-amber-50 border-yellow-200';
    case 'critical':
      return 'from-red-50 to-rose-50 border-red-200';
  }
}

function getTextColor(level: 'favorable' | 'warning' | 'critical') {
  switch (level) {
    case 'favorable':
      return 'text-green-800';
    case 'warning':
      return 'text-yellow-800';
    case 'critical':
      return 'text-red-800';
  }
}

export function TreatmentTimingAdvisor({
  language,
  recommendation,
  alertLevel,
  reason,
}: TreatmentTimingProps) {
  const t = translations[language];

  return (
    <div
      className={`bg-gradient-to-br ${getAlertColor(
        alertLevel
      )} rounded-xl shadow-lg p-6 border`}
    >
      <div className="flex items-start gap-4 mb-4">
        {getAlertIcon(alertLevel)}
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${getTextColor(alertLevel)} mb-1`}>
            {t.treatmentTiming}
          </h3>
          <p className={`text-sm ${getTextColor(alertLevel)} opacity-80`}>{reason}</p>
        </div>
      </div>

      <div className={`p-4 rounded-lg bg-white/50 backdrop-blur-sm mb-4`}>
        <p className={`font-semibold ${getTextColor(alertLevel)} text-base`}>
          {recommendation}
        </p>
      </div>

      {alertLevel === 'favorable' && (
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-green-900">{t.bestTime}</div>
              <div className="text-gray-600">{t.morning}</div>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-gray-600">{t.avoidMidday}</div>
          </div>
        </div>
      )}
    </div>
  );
}
