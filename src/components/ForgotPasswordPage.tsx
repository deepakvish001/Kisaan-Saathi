import { useState, FormEvent } from 'react';
import { Sprout, Mail, AlertCircle, CheckCircle, Languages } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { translate, Language } from '../lib/translations';

interface ForgotPasswordPageProps {
  onNavigate: (page: 'welcome' | 'login') => void;
}

export default function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const [language, setLanguage] = useState<Language>('en');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const t = (key: keyof typeof import('../lib/translations').translations.en) =>
    translate(key, language);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError(t('requiredField'));
      return;
    }

    if (!validateEmail(email)) {
      setError(t('invalidEmail'));
      return;
    }

    setLoading(true);

    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
    } else {
      setSuccess(true);
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

          {success ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('passwordResetSent')}
              </h2>
              <p className="text-gray-600 mb-8">
                Check your email for a link to reset your password.
              </p>
              <button
                onClick={() => onNavigate('login')}
                className="w-full py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transform hover:scale-[1.02] transition-all duration-300 shadow-lg"
              >
                {t('signIn')}
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
                {t('resetPassword')}
              </h1>
              <p className="text-gray-600 text-center mb-8">
                Enter your email to receive a password reset link
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? t('loading') : t('resetPassword')}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => onNavigate('login')}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ← {t('signIn')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
