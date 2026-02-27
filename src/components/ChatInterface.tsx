import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2, Image as ImageIcon, Volume2, VolumeX } from 'lucide-react';
import { sendMessage, type Message, supabase } from '../lib/supabase';
import { translate, type Language } from '../lib/translations';
import { useAuth } from '../contexts/AuthContext';
import { AssistantAvatar, type AssistantState } from './AssistantAvatar';
import { DiagnosticProgress } from './DiagnosticProgress';
import { ConnectivityStatus } from './ConnectivityStatus';
import { ImageUpload } from './ImageUpload';
import { AudioOutput } from './AudioOutput';

interface ChatInterfaceProps {
  language: Language;
  sessionId: string;
  cropId: string;
  cropName: string;
  growthStage: string;
  location: string;
  farmProfileId?: string;
  fieldProfileId?: string;
  onReadyForAdvisory: (conversationId: string) => void;
}

export function ChatInterface({
  language,
  sessionId,
  cropId,
  growthStage,
  location,
  cropName,
  farmProfileId,
  fieldProfileId,
  onReadyForAdvisory,
}: ChatInterfaceProps) {
  const { user, session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [detectedSymptoms, setDetectedSymptoms] = useState<string[]>([]);
  const [probabilities, setProbabilities] = useState<Record<string, number>>({});
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [autoPlayAudio, setAutoPlayAudio] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    console.log('ChatInterface - Auth state:', {
      hasUser: !!user,
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      userId: user?.id
    });
  }, [user, session]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (conversationId && Object.keys(probabilities).length > 0) {
      const maxProb = Math.max(...Object.values(probabilities));
      if (maxProb >= 0.5) {
      }
    }
  }, [probabilities, conversationId]);

  function toggleVoiceInput() {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setAssistantState('idle');
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setAssistantState('listening');
    }
  }

  async function handleSend() {
    if ((!input.trim() && uploadedImages.length === 0) || loading) return;

    let messageContent = input;
    if (uploadedImages.length > 0) {
      messageContent += `\n\n${language === 'hi' ? '📷 छवियां संलग्न: ' : '📷 Images attached: '}${uploadedImages.length}`;
    }

    const userMessage: Message = {
      role: 'user',
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setAssistantState('thinking');
    setShowImageUpload(false);

    try {
      console.log('Attempting to send message. Auth check:', {
        hasUser: !!user,
        hasSession: !!session,
        hasAccessToken: !!session?.access_token
      });

      if (!user || !session?.access_token) {
        console.error('Auth check failed - no user or session token');
        throw new Error('Unauthorized - Please log in to continue');
      }

      let contextMessage = input;
      if (uploadedImages.length > 0) {
        contextMessage += `\n[User has uploaded ${uploadedImages.length} image(s) of the crop. Visual symptoms are present.]`;
      }

      console.log('Sending message to edge function...');
      const response = await sendMessage(
        sessionId,
        contextMessage,
        language,
        cropId,
        growthStage,
        location,
        farmProfileId,
        fieldProfileId
      );
      console.log('Message sent successfully:', response);

      setAssistantState('suggesting');

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setDetectedSymptoms(response.detectedSymptoms || []);
      setProbabilities(response.probabilities || {});
      setUploadedImages([]);

      if (response.conversationId) {
        setConversationId(response.conversationId);
      }

      setTimeout(() => setAssistantState('idle'), 2000);
    } catch (error: any) {
      console.error('Error sending message:', {
        error,
        message: error?.message,
        stack: error?.stack,
        response: error?.response
      });

      let errorContent = language === 'hi'
        ? 'क्षमा करें, एक त्रुटि हुई। कृपया पुनः प्रयास करें।'
        : 'Sorry, an error occurred. Please try again.';

      if (error?.message?.includes('Unauthorized') || error?.message?.includes('401')) {
        console.error('Unauthorized error detected. Current auth state:', {
          hasUser: !!user,
          hasSession: !!session,
          hasAccessToken: !!session?.access_token,
          errorMessage: error?.message
        });
        errorContent = language === 'hi'
          ? 'कृपया पहले लॉगिन करें या अपना खाता बनाएं।'
          : 'Please log in or create an account first.';
      }

      const errorMessage: Message = {
        role: 'assistant',
        content: errorContent,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setAssistantState('idle');
    } finally {
      setLoading(false);
    }
  }

  function handleImagesUploaded(imageUrls: string[]) {
    setUploadedImages(prev => [...prev, ...imageUrls]);
  }

  function handleAnalysisComplete(symptoms: string[], imageId: string) {
    if (symptoms.length > 0) {
      const symptomMessage = language === 'hi'
        ? `छवि विश्लेषण से पता चला: ${symptoms.join(', ')}`
        : `Image analysis detected: ${symptoms.join(', ')}`;

      const analysisMessage: Message = {
        role: 'assistant',
        content: symptomMessage,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, analysisMessage]);
      setDetectedSymptoms(prev => [...new Set([...prev, ...symptoms])]);
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const canGetRecommendation = conversationId && detectedSymptoms.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-lime-50 animate-gradient flex flex-col relative overflow-hidden">
      <div className="gradient-mesh absolute inset-0 opacity-30"></div>
      <div className="glass-strong shadow-2xl border-b border-white/20 sticky top-0 z-10 backdrop-blur-xl animate-slide-up">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <AssistantAvatar state={assistantState} size="sm" />
              <div>
                <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 bg-clip-text text-transparent">
                  {translate('appName', language)}
                </h2>
                <p className="text-base font-bold text-gray-700">
                  {cropName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!user && (
                <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-semibold">
                  {language === 'hi' ? 'लॉग इन नहीं है' : 'Not logged in'}
                </div>
              )}
              <button
                onClick={() => setAutoPlayAudio(!autoPlayAudio)}
                className={`p-3 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-110 ${
                  autoPlayAudio
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                }`}
                title={autoPlayAudio
                  ? (language === 'hi' ? 'ऑटो ऑडियो बंद करें' : 'Disable auto audio')
                  : (language === 'hi' ? 'ऑटो ऑडियो चालू करें' : 'Enable auto audio')
                }
              >
                {autoPlayAudio ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </button>
              <ConnectivityStatus language={language} />
              {canGetRecommendation && (
                <button
                  onClick={() => {
                    onReadyForAdvisory(conversationId!);
                  }}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl font-black hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform animate-pulse"
                >
                  {translate('getRecommendation', language)}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl overflow-y-auto relative z-10">
        {messages.length === 0 && (
          <div className="text-center py-16 space-y-8 animate-fade-in">
            <AssistantAvatar state={assistantState} size="lg" />
            <p className="text-gray-900 text-2xl font-black mb-6">
              {language === 'hi'
                ? 'अपनी फसल की समस्या का वर्णन करके शुरू करें'
                : 'Start by describing your crop problem'}
            </p>
            <div className="glass rounded-2xl p-8 max-w-md mx-auto border border-emerald-200 shadow-2xl hover:shadow-emerald-200 transition-shadow duration-300 transform hover:scale-105">
              <p className="text-lg font-bold text-gray-900">
                {language === 'hi'
                  ? 'उदाहरण: "पत्तियों पर भूरे धब्बे दिख रहे हैं"'
                  : 'Example: "I see brown spots on the leaves"'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-5">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-scale-in`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl px-6 py-5 shadow-xl transform hover:scale-105 transition-all duration-300 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-300'
                      : 'glass border border-gray-200 text-gray-900 shadow-gray-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap font-semibold text-lg leading-relaxed">{message.content}</p>
                  <div className={`flex items-center justify-between gap-3 mt-3`}>
                    <p
                      className={`text-sm font-bold ${
                        message.role === 'user' ? 'text-emerald-100' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {message.role === 'assistant' && (
                      <AudioOutput
                        text={message.content}
                        language={language}
                        autoPlay={autoPlayAudio && index === messages.length - 1}
                        showControls={true}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start animate-scale-in">
                <div className="glass border border-gray-200 rounded-3xl px-6 py-5 shadow-xl">
                  <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                </div>
              </div>
            )}
          </div>

          {messages.length > 0 && (
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <DiagnosticProgress
                  language={language}
                  symptomsCount={detectedSymptoms.length}
                  confidence={Object.keys(probabilities).length > 0 ? Math.max(...Object.values(probabilities)) : 0}
                  estimatedQuestions={5}
                  answeredQuestions={messages.filter(m => m.role === 'user').length}
                />
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <div className="glass-strong border-t border-white/20 sticky bottom-0 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="container mx-auto px-4 py-5 max-w-4xl">
          {showImageUpload && conversationId && (
            <div className="mb-4 p-4 glass rounded-2xl border border-emerald-200 animate-scale-in">
              <ImageUpload
                conversationId={conversationId}
                language={language}
                cropType={cropName}
                onImagesUploaded={handleImagesUploaded}
                onAnalysisComplete={handleAnalysisComplete}
              />
            </div>
          )}

          {uploadedImages.length > 0 && (
            <div className="mb-4 p-4 glass rounded-2xl border border-emerald-200">
              <p className="text-sm font-bold text-gray-700 mb-2">
                {language === 'hi' ? `${uploadedImages.length} छवियां अपलोड की गईं` : `${uploadedImages.length} image(s) uploaded`}
              </p>
            </div>
          )}

          <div className="flex gap-4 items-end">
            <button
              onClick={() => {
                if (!conversationId) {
                  alert(language === 'hi' ? 'पहले अपनी समस्या का वर्णन करें' : 'Please describe your problem first');
                  return;
                }
                setShowImageUpload(!showImageUpload);
              }}
              disabled={loading}
              className={`p-5 rounded-2xl font-black transition-all duration-300 transform hover:scale-110 shadow-xl ${
                showImageUpload
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
              }`}
              title={language === 'hi' ? 'छवि अपलोड करें' : 'Upload image'}
            >
              <ImageIcon className="w-7 h-7" />
            </button>

            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={translate('typeProblem', language)}
                rows={1}
                className="w-full px-6 py-5 pr-16 border-2 border-gray-200 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none resize-none transition-all text-gray-900 font-semibold text-lg shadow-xl hover:shadow-2xl bg-white"
                disabled={loading}
              />
              {recognitionRef.current && (
                <button
                  onClick={toggleVoiceInput}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-110 ${
                    isListening
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                  }`}
                  title={translate('voiceInput', language)}
                >
                  {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
              )}
            </div>
            <button
              onClick={handleSend}
              disabled={(!input.trim() && uploadedImages.length === 0) || loading}
              className={`px-8 py-5 rounded-2xl font-black transition-all duration-300 transform hover:scale-110 shadow-xl ${
                (input.trim() || uploadedImages.length > 0) && !loading
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-emerald-300 hover:shadow-2xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <Send className="w-7 h-7" />
              )}
            </button>
          </div>
          {isListening && (
            <p className="text-lg font-black text-red-600 mt-4 text-center flex items-center justify-center gap-3 animate-pulse">
              <div className="relative">
                <Mic className="w-6 h-6" />
                <div className="absolute inset-0 animate-ping">
                  <Mic className="w-6 h-6" />
                </div>
              </div>
              {translate('listening', language)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
