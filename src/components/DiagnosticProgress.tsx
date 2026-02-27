import { Activity, TrendingUp } from 'lucide-react';
import { translate, type Language } from '../lib/translations';

interface DiagnosticProgressProps {
  language: Language;
  symptomsCount: number;
  confidence: number;
  estimatedQuestions: number;
  answeredQuestions: number;
}

export function DiagnosticProgress({
  language,
  symptomsCount,
  confidence,
  estimatedQuestions,
  answeredQuestions,
}: DiagnosticProgressProps) {
  const progressPercentage = estimatedQuestions > 0
    ? Math.min((answeredQuestions / estimatedQuestions) * 100, 100)
    : 0;

  const confidencePercentage = confidence * 100;

  const confidenceColor =
    confidence >= 0.75
      ? 'bg-green-600'
      : confidence >= 0.5
      ? 'bg-yellow-600'
      : 'bg-orange-600';

  const confidenceTextColor =
    confidence >= 0.75
      ? 'text-green-700'
      : confidence >= 0.5
      ? 'text-yellow-700'
      : 'text-orange-700';

  return (
    <div className="glass-strong border border-white/20 rounded-3xl p-6 space-y-6 shadow-2xl animate-scale-in backdrop-blur-xl">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-emerald-600" />
            <span className="text-lg font-black text-gray-900">
              {translate('diagnosticProgress', language)}
            </span>
          </div>
          <span className="text-base font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="relative pt-1">
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 h-3 rounded-full transition-all duration-700 shadow-lg animate-gradient"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {symptomsCount > 0 && (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <span className="text-base font-bold text-gray-700">{translate('symptomsDetected', language)}:</span>
          <span className="font-black text-xl text-emerald-700 bg-white px-4 py-2 rounded-xl shadow-md">
            {symptomsCount}
          </span>
        </div>
      )}

      {confidence > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <span className="text-lg font-black text-gray-900">
                {translate('confidenceLevel', language)}
              </span>
            </div>
            <span className={`text-base font-black px-3 py-1 rounded-full ${
              confidence >= 0.75 ? 'text-emerald-700 bg-emerald-100' :
              confidence >= 0.5 ? 'text-yellow-700 bg-yellow-100' :
              'text-orange-700 bg-orange-100'
            }`}>
              {Math.round(confidencePercentage)}%
            </span>
          </div>
          <div className="relative pt-1">
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <div
                className={`${confidenceColor} h-3 rounded-full transition-all duration-700 shadow-lg`}
                style={{ width: `${confidencePercentage}%` }}
              />
            </div>
          </div>
          <div className={`p-4 rounded-2xl border-2 ${
            confidence >= 0.75 ? 'bg-emerald-50 border-emerald-200' :
            confidence >= 0.5 ? 'bg-yellow-50 border-yellow-200' :
            'bg-orange-50 border-orange-200'
          }`}>
            <p className="text-sm font-bold text-gray-900">
              {confidence >= 0.75
                ? language === 'hi'
                  ? 'उच्च निश्चितता - सिफारिश के लिए तैयार'
                  : 'High certainty - Ready for recommendation'
                : confidence >= 0.5
                ? language === 'hi'
                  ? 'मध्यम निश्चितता - कुछ और जानकारी में मदद मिलेगी'
                  : 'Moderate certainty - More information would help'
                : language === 'hi'
                ? 'अधिक लक्षणों की आवश्यकता है'
                : 'More symptoms needed'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
