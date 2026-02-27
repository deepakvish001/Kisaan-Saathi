import { useState } from 'react';
import { Sprout, MessageSquare, Languages, History, CheckCircle } from 'lucide-react';
import { translate, Language } from '../lib/translations';

interface WelcomePageProps {
  onNavigate: (page: 'login' | 'signup') => void;
}

export default function WelcomePage({ onNavigate }: WelcomePageProps) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: keyof typeof import('../lib/translations').translations.en) =>
    translate(key, language);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
        >
          <Languages className="w-4 h-4 text-teal-600" />
          <span className="text-sm font-medium">{language === 'en' ? 'हिंदी' : 'English'}</span>
        </button>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-teal-600 rounded-2xl shadow-lg">
              <Sprout className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {t('appName')}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('welcomeDescription')}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => onNavigate('signup')}
              className="px-8 py-4 bg-teal-600 text-white rounded-lg font-semibold text-lg hover:bg-teal-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {t('getStarted')}
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="px-8 py-4 bg-white text-teal-600 rounded-lg font-semibold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-teal-600"
            >
              {t('signIn')}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            { icon: MessageSquare, text: t('featureOne'), color: 'from-emerald-500 to-teal-600' },
            { icon: Languages, text: t('featureTwo'), color: 'from-teal-500 to-cyan-600' },
            { icon: CheckCircle, text: t('featureThree'), color: 'from-cyan-500 to-blue-600' },
            { icon: History, text: t('featureFour'), color: 'from-blue-500 to-indigo-600' },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-700 font-medium">{feature.text}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('howItWorksTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', text: t('stepOne') },
              { step: '2', text: t('stepTwo') },
              { step: '3', text: t('stepThree') },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {item.step}
                </div>
                <p className="text-gray-700 font-medium text-lg">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12 text-gray-600">
          <p className="text-sm">{t('farmersNote')}</p>
        </div>
      </div>
    </div>
  );
}
