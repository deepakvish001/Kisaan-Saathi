import { useState, FormEvent } from 'react';
import { Sprout, Mail, Lock, AlertCircle, Languages } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { translate, Language } from '../lib/translations';

interface LoginPageProps {
  onNavigate: (page: 'welcome' | 'signup' | 'forgot-password') => void;
}

export default function LoginPage({ onNavigate }: LoginPageProps) {
  const [language, setLanguage] = useState<Language>('en');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const t = (key: keyof typeof import('../lib/translations').translations.en) =>
    translate(key, language);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t('requiredField'));
      return;
    }

    if (!validateEmail(email)) {
      setError(t('invalidEmail'));
      return;
    }

    setLoading(true);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(t('invalidCredentials'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
        >
          <Languages className="w-4 h-4 text-teal-600" />
          <span className="text-sm font-medium">{language === 'en' ? 'हिंदी' : 'English'}</span>
        </button>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-teal-600 rounded-xl shadow-lg">
              <Sprout className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
            {t('welcomeBack')}
          </h1>
          <p className="text-gray-600 text-center mb-8">
            {t('signInToContinue')}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
              >
                {t('forgotPassword')}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? t('loading') : t('signIn')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('dontHaveAccount')}{' '}
              <button
                onClick={() => onNavigate('signup')}
                className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
              >
                {t('signUp')}
              </button>
            </p>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => onNavigate('welcome')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← {t('welcome')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
