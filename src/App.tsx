import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { ChatInterface } from './components/ChatInterface';
import { AdvisoryDisplay } from './components/AdvisoryDisplay';
import { HistoryDashboard } from './components/HistoryDashboard';
import { ConsultationDetails } from './components/ConsultationDetails';
import { ProfileSettings } from './components/ProfileSettings';
import { FarmProfileWizard, type CharacterisationData } from './components/FarmProfileWizard';
import { ProfileSelector } from './components/ProfileSelector';
import { Footer } from './components/Footer';
import WelcomePage from './components/WelcomePage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import NavHeader from './components/NavHeader';
import type { Language } from './lib/translations';
import {
  createFarmProfile,
  createFieldProfile,
  createSoilProfile,
  createIrrigationProfile,
} from './lib/supabase';

type AppState = 'landing' | 'characterisation' | 'chat' | 'advisory' | 'history' | 'consultation-details' | 'profile-settings';
type AuthPage = 'welcome' | 'login' | 'signup' | 'forgot-password';
type CharacterisationMode = 'selector' | 'wizard';

interface SessionConfig {
  language: Language;
  cropId: string;
  cropName: string;
  growthStage: string;
  location: string;
  farmProfileId?: string;
  fieldProfileId?: string;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [state, setState] = useState<AppState>('landing');
  const [authPage, setAuthPage] = useState<AuthPage>('welcome');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [viewingConsultationId, setViewingConsultationId] = useState<string | null>(null);
  const [characterisationMode, setCharacterisationMode] = useState<CharacterisationMode>('selector');

  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false);
    }
  }, [user, showAuthModal]);

  function handleStart(config: SessionConfig) {
    if (!user) {
      setShowAuthModal(true);
      setAuthPage('login');
      return;
    }
    setSessionConfig(config);
    setCharacterisationMode('selector');
    setState('characterisation');
  }

  async function handleCharacterisationComplete(data: CharacterisationData) {
    try {
      const farmResult = await createFarmProfile({
        farmName: data.farm.farmName,
        totalArea: data.farm.totalArea,
        location: data.farm.location,
        farmType: data.farm.farmType,
        isDefault: true,
      });

      const fieldResult = await createFieldProfile({
        farmId: farmResult.id,
        fieldName: data.field.fieldName,
        area: data.field.area,
        slope: data.field.slope,
        drainage: data.field.drainage,
        sunExposure: data.field.sunExposure,
      });

      await createSoilProfile({
        fieldId: fieldResult.id,
        soilType: data.soil.soilType,
        organicMatter: data.soil.organicMatter,
        phLevel: data.soil.phLevel,
        nitrogenLevel: data.soil.nitrogenLevel,
        phosphorusLevel: data.soil.phosphorusLevel,
        potassiumLevel: data.soil.potassiumLevel,
      });

      await createIrrigationProfile({
        fieldId: fieldResult.id,
        waterSource: data.irrigation.waterSource,
        irrigationMethod: data.irrigation.irrigationMethod,
        waterQuality: data.irrigation.waterQuality,
        waterAvailability: data.irrigation.waterAvailability,
      });

      if (sessionConfig) {
        setSessionConfig({
          ...sessionConfig,
          farmProfileId: farmResult.id,
          fieldProfileId: fieldResult.id,
        });
      }

      setState('chat');
    } catch (error) {
      console.error('Error creating farm profile:', error);
      alert('Failed to save farm profile. Please try again.');
    }
  }

  function handleSelectProfile(farmId: string, fieldId: string) {
    if (sessionConfig) {
      setSessionConfig({
        ...sessionConfig,
        farmProfileId: farmId,
        fieldProfileId: fieldId,
      });
    }
    setState('chat');
  }

  function handleSkipCharacterisation() {
    setState('chat');
  }

  function handleCreateNewProfile() {
    setCharacterisationMode('wizard');
  }

  function handleCloseCharacterisation() {
    setState('landing');
    setSessionConfig(null);
  }

  function handleReadyForAdvisory(convId: string) {
    setConversationId(convId);
    setState('advisory');
  }

  function handleNewDiagnosis() {
    setState('landing');
    setSessionConfig(null);
    setConversationId(null);
  }

  function handleViewHistory() {
    if (!user) {
      setShowAuthModal(true);
      setAuthPage('login');
      return;
    }
    setState('history');
  }

  function handleViewConsultationDetails(consultationId: string) {
    setViewingConsultationId(consultationId);
    setState('consultation-details');
  }

  function handleBackToHistory() {
    setState('history');
    setViewingConsultationId(null);
  }

  function handleViewProfileSettings() {
    if (!user) {
      setShowAuthModal(true);
      setAuthPage('login');
      return;
    }
    setState('profile-settings');
  }

  function handleBackToLanding() {
    setState('landing');
  }

  function handleShowAuth(page: AuthPage) {
    setAuthPage(page);
    setShowAuthModal(true);
  }

  function handleCloseAuth() {
    setShowAuthModal(false);
  }

  const authPages = {
    welcome: <WelcomePage onNavigate={setAuthPage} />,
    login: <LoginPage onNavigate={setAuthPage} />,
    signup: <SignupPage onNavigate={setAuthPage} />,
    'forgot-password': <ForgotPasswordPage onNavigate={setAuthPage} />,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col min-h-screen">
        {(state === 'landing' || state === 'history' || state === 'profile-settings') && (
          <NavHeader
            language={sessionConfig?.language || 'en'}
            onViewHistory={handleViewHistory}
            onViewSettings={handleViewProfileSettings}
            onBackToHome={handleBackToLanding}
            onShowAuth={handleShowAuth}
            currentPage={state}
          />
        )}

        <div className="flex-1">
          {state === 'landing' && <LandingPage onStart={handleStart} />}

          {state === 'characterisation' && sessionConfig && (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
              <div className="w-full max-w-4xl">
                {characterisationMode === 'selector' ? (
                  <div className="bg-white rounded-2xl shadow-xl p-8">
                    <ProfileSelector
                      language={sessionConfig.language}
                      onSelectProfile={handleSelectProfile}
                      onCreateNew={handleCreateNewProfile}
                    />
                  </div>
                ) : (
                  <FarmProfileWizard
                    language={sessionConfig.language}
                    onComplete={handleCharacterisationComplete}
                    onSkip={handleSkipCharacterisation}
                    onClose={handleCloseCharacterisation}
                  />
                )}
              </div>
            </div>
          )}

          {state === 'chat' && sessionConfig && (
            <ChatInterface
              language={sessionConfig.language}
              sessionId={sessionId}
              cropId={sessionConfig.cropId}
              cropName={sessionConfig.cropName}
              growthStage={sessionConfig.growthStage}
              location={sessionConfig.location}
              farmProfileId={sessionConfig.farmProfileId}
              fieldProfileId={sessionConfig.fieldProfileId}
              onReadyForAdvisory={handleReadyForAdvisory}
            />
          )}

          {state === 'advisory' && conversationId && sessionConfig && (
            <AdvisoryDisplay
              language={sessionConfig.language}
              conversationId={conversationId}
              onNewDiagnosis={handleNewDiagnosis}
            />
          )}

          {state === 'history' && user && (
            <HistoryDashboard
              language={sessionConfig?.language || 'en'}
              onViewDetails={handleViewConsultationDetails}
            />
          )}

          {state === 'consultation-details' && viewingConsultationId && user && (
            <ConsultationDetails
              conversationId={viewingConsultationId}
              language={sessionConfig?.language || 'en'}
              onBack={handleBackToHistory}
            />
          )}

          {state === 'profile-settings' && user && (
            <ProfileSettings language={sessionConfig?.language || 'en'} />
          )}
        </div>

        {(state === 'landing' || state === 'history' || state === 'consultation-details' || state === 'profile-settings') && (
          <Footer language={sessionConfig?.language || 'en'} />
        )}
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-md w-full">
            <button
              onClick={handleCloseAuth}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 hover:scale-110 transition-all z-10"
            >
              ✕
            </button>
            {authPages[authPage]}
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
