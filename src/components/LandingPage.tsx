import { useState, useEffect, useRef } from 'react';
import { Sprout, Languages, MapPin, Brain, Globe, BookOpen, Clock, Shield, Gift, ChevronDown, Zap, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchCrops, type Crop } from '../lib/supabase';
import { translate, type Language } from '../lib/translations';

interface LandingPageProps {
  onStart: (config: {
    language: Language;
    cropId: string;
    cropName: string;
    growthStage: string;
    location: string;
  }) => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const { profile } = useAuth();
  const [language, setLanguage] = useState<Language>('en');
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [growthStage, setGrowthStage] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const quickStartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCrops();
  }, []);

  async function loadCrops() {
    try {
      const data = await fetchCrops();
      setCrops(data);
    } catch (error) {
      console.error('Error loading crops:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleStart() {
    if (!selectedCrop || !growthStage) return;

    onStart({
      language,
      cropId: selectedCrop.id,
      cropName: language === 'hi' ? selectedCrop.name_hi : selectedCrop.name_en,
      growthStage,
      location,
    });
  }

  const scrollToQuickStart = () => {
    quickStartRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const canStart = selectedCrop && growthStage;
  const t = (key: keyof typeof import('../lib/translations').translations.en) => translate(key, language);

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 mb-6 animate-fade-in">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg flex items-center justify-center">
                <Sprout className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-black mb-6 animate-slide-up">
              {profile?.full_name
                ? (language === 'hi'
                    ? `नमस्ते ${profile.full_name.split(' ')[0]}!`
                    : `Welcome, ${profile.full_name.split(' ')[0]}!`)
                : t('heroWelcome')
              }
            </h1>

            <p className="text-xl md:text-2xl mb-4 font-semibold text-emerald-50 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {t('heroSubtitle')}
            </p>

            <p className="text-lg mb-10 text-emerald-100 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {t('heroDescription')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <button
                onClick={scrollToQuickStart}
                className="px-8 py-4 bg-white text-emerald-700 font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                {t('startNow')}
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {t('learnMore')}
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-6 text-emerald-100 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-lg transition-all ${language === 'en' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}
                >
                  English
                </button>
              </div>
              <div className="w-px h-6 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-3 py-1 rounded-lg transition-all ${language === 'hi' ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}
                >
                  हिंदी
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              {t('whyChooseUs')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('farmersNote')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('featureTitle1')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('featureDesc1')}</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('featureTitle2')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('featureDesc2')}</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('featureTitle3')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('featureDesc3')}</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('featureTitle4')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('featureDesc4')}</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('featureTitle5')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('featureDesc5')}</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('featureTitle6')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('featureDesc6')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              {t('howItWorksTitle')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('howItWorks')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-3xl font-black mx-auto shadow-xl">
                    1
                  </div>
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 -translate-x-1/2"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('stepOne')}</h3>
                <p className="text-gray-600">{language === 'hi' ? 'अपनी फसल की समस्या को विस्तार से बताएं' : 'Tell us about your crop problem in detail'}</p>
              </div>

              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-3xl font-black mx-auto shadow-xl">
                    2
                  </div>
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 -translate-x-1/2"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('stepTwo')}</h3>
                <p className="text-gray-600">{language === 'hi' ? 'एआई आपसे स्मार्ट प्रश्न पूछेगा' : 'AI will ask you smart questions'}</p>
              </div>

              <div className="text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-3xl font-black mx-auto shadow-xl">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t('stepThree')}</h3>
                <p className="text-gray-600">{language === 'hi' ? 'विस्तृत उपचार योजना प्राप्त करें' : 'Get detailed treatment plan'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={quickStartRef} className="py-20 bg-gradient-to-b from-gray-50 to-white scroll-mt-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              {t('quickStart')}
            </h2>
            <p className="text-xl text-gray-600">
              {language === 'hi'
                ? 'अपनी फसल और समस्या का चयन करें'
                : 'Select your crop and describe the issue'}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 space-y-8 border border-gray-100">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                <p className="text-lg font-semibold text-gray-900 leading-relaxed">
                  {t('howItWorks')}
                </p>
              </div>

              <div>
                <label className="flex items-center gap-3 text-xl font-black text-gray-900 mb-6">
                  <Sprout className="w-7 h-7 text-emerald-600" />
                  {t('selectCrop')}
                </label>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
                    <p className="mt-4 text-lg text-gray-700 font-semibold">{t('loading')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {crops.map((crop) => (
                      <button
                        key={crop.id}
                        onClick={() => {
                          setSelectedCrop(crop);
                          setGrowthStage('');
                        }}
                        className={`p-5 rounded-xl border-2 transition-all duration-300 text-left transform hover:scale-105 ${
                          selectedCrop?.id === crop.id
                            ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-xl'
                            : 'border-gray-200 hover:border-emerald-300 bg-white shadow-lg hover:shadow-xl'
                        }`}
                      >
                        <div className="font-bold text-lg text-gray-900">
                          {language === 'hi' ? crop.name_hi : crop.name_en}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedCrop && (
                <div className="animate-scale-in">
                  <label className="text-xl font-black text-gray-900 mb-6 block">
                    {t('selectGrowthStage')}
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedCrop.growth_stages.map((stage) => (
                      <button
                        key={stage.stage}
                        onClick={() => setGrowthStage(stage.stage)}
                        className={`p-5 rounded-xl border-2 transition-all duration-300 text-base font-bold transform hover:scale-105 ${
                          growthStage === stage.stage
                            ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 text-gray-900 shadow-xl'
                            : 'border-gray-200 hover:border-emerald-300 text-gray-800 bg-white shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {language === 'hi' ? stage.hi : stage.en}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="flex items-center gap-3 text-xl font-black text-gray-900 mb-6">
                  <MapPin className="w-7 h-7 text-emerald-600" />
                  {t('location')}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={language === 'hi' ? 'गाँव, जिला' : 'Village, District'}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none transition-all text-gray-900 font-medium text-lg shadow-lg hover:shadow-xl bg-white"
                />
              </div>

              <button
                onClick={handleStart}
                disabled={!canStart}
                className={`w-full py-5 rounded-xl font-black text-xl transition-all duration-300 transform ${
                  canStart
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-2xl hover:shadow-emerald-300 hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-lg'
                }`}
              >
                {t('startDiagnosis')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
