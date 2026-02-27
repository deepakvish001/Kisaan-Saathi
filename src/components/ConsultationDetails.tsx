import { useState, useEffect } from 'react';
import { ArrowLeft, Leaf, MapPin, Clock, TrendingUp, MessageCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { type Language } from '../lib/translations';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ConsultationDetailsProps {
  conversationId: string;
  language: Language;
  onBack: () => void;
}

export function ConsultationDetails({ conversationId, language, onBack }: ConsultationDetailsProps) {
  const [conversation, setConversation] = useState<any>(null);
  const [advisory, setAdvisory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConsultationDetails();
  }, [conversationId]);

  async function loadConsultationDetails() {
    try {
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          crops:crop_id (name_en, name_hi)
        `)
        .eq('id', conversationId)
        .maybeSingle();

      if (convError) throw convError;

      const { data: adv, error: advError } = await supabase
        .from('advisories')
        .select(`
          *,
          diseases:disease_id (name_en, name_hi, description_en, description_hi, treatment_en, treatment_hi)
        `)
        .eq('conversation_id', conversationId)
        .maybeSingle();

      if (advError) throw advError;

      setConversation(conv);
      setAdvisory(adv);
    } catch (error) {
      console.error('Error loading consultation details:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-semibold">
            {language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600 text-xl font-bold">
            {language === 'hi' ? 'परामर्श नहीं मिला' : 'Consultation not found'}
          </p>
          <button
            onClick={onBack}
            className="mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg"
          >
            {language === 'hi' ? 'वापस जाएं' : 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  const messages: Message[] = conversation.conversation_history || [];
  const cropName = language === 'hi' ? conversation.crops?.name_hi : conversation.crops?.name_en;
  const diseaseName = language === 'hi' ? advisory?.diseases?.name_hi : advisory?.diseases?.name_en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-lime-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-bold mb-6 transition-all transform hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
          {language === 'hi' ? 'वापस जाएं' : 'Back to History'}
        </button>

        <div className="glass rounded-2xl p-8 border border-gray-200 shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Leaf className="w-8 h-8 text-emerald-600" />
                <h1 className="text-3xl font-black text-gray-900">{cropName}</h1>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                  conversation.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : conversation.status === 'active'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {conversation.status === 'completed'
                    ? (language === 'hi' ? 'पूर्ण' : 'Completed')
                    : conversation.status === 'active'
                    ? (language === 'hi' ? 'सक्रिय' : 'Active')
                    : (language === 'hi' ? 'बढ़ाया गया' : 'Escalated')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700 font-semibold">
                {conversation.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <span>{conversation.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <span>
                    {new Date(conversation.created_at).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {conversation.growth_stage && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <span>{conversation.growth_stage}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {diseaseName && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h2 className="text-xl font-black text-red-900">
                  {language === 'hi' ? 'निदान' : 'Diagnosis'}
                </h2>
              </div>
              <p className="text-lg font-bold text-red-800 mb-2">{diseaseName}</p>
              {advisory?.confidence_score && (
                <p className="text-gray-700 font-semibold">
                  {language === 'hi' ? 'विश्वास स्तर: ' : 'Confidence Level: '}
                  <span className="font-black">{(advisory.confidence_score * 100).toFixed(0)}%</span>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-6 border border-gray-200 shadow-xl mb-8">
              <div className="flex items-center gap-3 mb-6">
                <MessageCircle className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-black text-gray-900">
                  {language === 'hi' ? 'बातचीत का इतिहास' : 'Conversation History'}
                </h2>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-lg ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap font-semibold leading-relaxed">{message.content}</p>
                      <p
                        className={`text-sm mt-2 font-bold ${
                          message.role === 'user' ? 'text-emerald-100' : 'text-gray-500'
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString(language === 'hi' ? 'hi-IN' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {advisory && (
              <div className="glass rounded-2xl p-6 border border-gray-200 shadow-xl sticky top-8">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h2 className="text-xl font-black text-gray-900">
                    {language === 'hi' ? 'सिफारिशें' : 'Recommendations'}
                  </h2>
                </div>

                {advisory.action_steps && advisory.action_steps.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-black text-gray-800 mb-3">
                      {language === 'hi' ? 'कार्य चरण' : 'Action Steps'}
                    </h3>
                    <ul className="space-y-3">
                      {advisory.action_steps.map((step: any, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 font-semibold leading-relaxed">
                            {typeof step === 'string' ? step : step.description || step.step}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {advisory.recommendation_text && (
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                    <p className="text-gray-800 font-semibold leading-relaxed">
                      {advisory.recommendation_text}
                    </p>
                  </div>
                )}

                {advisory.feedback_rating && (
                  <div className="mt-6 pt-6 border-t-2 border-gray-200">
                    <h3 className="text-lg font-black text-gray-800 mb-3">
                      {language === 'hi' ? 'आपकी प्रतिक्रिया' : 'Your Feedback'}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={`text-2xl ${
                            star <= advisory.feedback_rating ? 'text-yellow-500' : 'text-gray-300'
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    {advisory.farmer_feedback && (
                      <p className="text-gray-700 font-semibold italic">
                        "{advisory.farmer_feedback}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
