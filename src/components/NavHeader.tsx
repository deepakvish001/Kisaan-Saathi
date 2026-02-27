import { useState } from 'react';
import { Sprout, User as UserIcon, LogOut, Settings, History, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { translate, Language } from '../lib/translations';

interface NavHeaderProps {
  language: Language;
  onViewHistory?: () => void;
  onViewSettings?: () => void;
  onBackToHome?: () => void;
  onShowAuth?: (page: 'welcome' | 'login' | 'signup' | 'forgot-password') => void;
  currentPage?: string;
}

export default function NavHeader({ language, onViewHistory, onViewSettings, onBackToHome, onShowAuth, currentPage }: NavHeaderProps) {
  const { user, profile, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const t = (key: keyof typeof import('../lib/translations').translations.en) =>
    translate(key, language);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <nav className="bg-gradient-to-r from-white via-emerald-50 to-white shadow-lg sticky top-0 z-40 border-b-2 border-emerald-100">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex justify-between items-center h-16 sm:h-18">
            <div className="flex items-center gap-3 sm:gap-6">
              <button
                onClick={onBackToHome}
                className="flex items-center gap-2 sm:gap-3 hover:scale-105 transition-transform group py-2 sm:py-3"
              >
                <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg sm:rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                  <Sprout className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base sm:text-xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                    {t('appName')}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-gray-500 hidden sm:block">
                    {language === 'hi' ? 'स्मार्ट कृषि सहायक' : 'Smart Farming Assistant'}
                  </span>
                </div>
              </button>

              {user && (
                <div className="hidden lg:flex items-center gap-2">
                  {currentPage !== 'landing' && (
                    <button
                      onClick={onBackToHome}
                      className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-emerald-100 transition-all text-sm sm:text-base text-gray-700 font-bold hover:text-emerald-800 hover:scale-105 transform"
                    >
                      <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden md:inline">{language === 'hi' ? 'होम' : 'Home'}</span>
                    </button>
                  )}
                  <button
                    onClick={onViewHistory}
                    className={`flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all text-sm sm:text-base font-bold transform hover:scale-105 ${
                      currentPage === 'history'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                        : 'hover:bg-emerald-100 text-gray-700 hover:text-emerald-800'
                    }`}
                  >
                    <History className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden md:inline">{language === 'hi' ? 'इतिहास' : 'History'}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              {user ? (
                <>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-emerald-50 transition-all border-2 border-transparent hover:border-emerald-200 hover:scale-105 transform"
                  >
                    <div className="text-right hidden md:block">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[120px]">
                        {profile?.full_name || user?.email}
                      </p>
                      {profile?.location && (
                        <p className="text-[10px] sm:text-xs text-gray-600 font-semibold truncate">{profile.location}</p>
                      )}
                    </div>
                    <div className="w-8 h-8 sm:w-11 sm:h-11 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-emerald-200">
                      <span className="text-white font-black text-sm sm:text-lg">
                        {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </button>

                  {showDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                      />
                      <div className="absolute right-0 mt-2 sm:mt-3 w-56 sm:w-64 bg-white rounded-xl shadow-2xl border-2 border-emerald-100 py-2 z-20 animate-scale-in">
                        <div className="lg:hidden">
                          {currentPage !== 'landing' && (
                            <>
                              <button
                                onClick={() => {
                                  onBackToHome?.();
                                  setShowDropdown(false);
                                }}
                                className="w-full px-4 sm:px-5 py-2.5 sm:py-3 text-left hover:bg-emerald-50 transition-all flex items-center gap-3 text-sm sm:text-base font-bold text-gray-700 hover:text-emerald-700"
                              >
                                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>{language === 'hi' ? 'होम' : 'Home'}</span>
                              </button>
                              <div className="border-t border-emerald-100 my-2" />
                            </>
                          )}
                          <button
                            onClick={() => {
                              onViewHistory?.();
                              setShowDropdown(false);
                            }}
                            className="w-full px-4 sm:px-5 py-2.5 sm:py-3 text-left hover:bg-emerald-50 transition-all flex items-center gap-3 text-sm sm:text-base font-bold text-gray-700 hover:text-emerald-700"
                          >
                            <History className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>{language === 'hi' ? 'इतिहास' : 'History'}</span>
                          </button>
                          <div className="border-t border-emerald-100 my-2" />
                        </div>
                        <button
                          onClick={() => {
                            onViewSettings?.();
                            setShowDropdown(false);
                          }}
                          className="w-full px-4 sm:px-5 py-2.5 sm:py-3 text-left hover:bg-emerald-50 transition-all flex items-center gap-3 text-sm sm:text-base font-bold text-gray-700 hover:text-emerald-700"
                        >
                          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>{t('profile')}</span>
                        </button>
                        <div className="border-t border-emerald-100 my-2" />
                        <button
                          onClick={handleSignOut}
                          className="w-full px-4 sm:px-5 py-2.5 sm:py-3 text-left hover:bg-red-50 transition-all flex items-center gap-3 text-sm sm:text-base font-bold text-red-600 hover:text-red-700"
                        >
                          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span>{t('logout')}</span>
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => onShowAuth?.('login')}
                    className="px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold text-gray-700 hover:bg-emerald-50 transition-all hover:scale-105 transform"
                  >
                    {language === 'hi' ? 'लॉग इन' : 'Login'}
                  </button>
                  <button
                    onClick={() => onShowAuth?.('signup')}
                    className="px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all hover:scale-105 transform"
                  >
                    {language === 'hi' ? 'साइन अप' : 'Sign Up'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
