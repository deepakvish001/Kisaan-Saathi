import { useState } from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, RefreshCw, Volume2, Star, MessageSquare, Send, Calendar, Plus } from 'lucide-react';
import { generateAdvisory, supabase, type Advisory } from '../lib/supabase';
import { translate, type Language } from '../lib/translations';
import { useAuth } from '../contexts/AuthContext';

interface AdvisoryDisplayProps {
  language: Language;
  conversationId: string;
  onNewDiagnosis: () => void;
}

export function AdvisoryDisplay({
  language,
  conversationId,
  onNewDiagnosis,
}: AdvisoryDisplayProps) {
  const [advisory, setAdvisory] = useState<Advisory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [planCreated, setPlanCreated] = useState(false);
  const { user } = useAuth();

  useState(() => {
    loadAdvisory();
  });

  async function loadAdvisory() {
    setLoading(true);
    setError(null);

    try {
      const result = await generateAdvisory(conversationId, language);
      setAdvisory(result.advisory);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function speakAdvisory() {
    if (!advisory || !('speechSynthesis' in window)) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(advisory.recommendationText);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.9;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  }

  async function submitFeedback() {
    if (!rating || !advisory) return;

    setSubmittingFeedback(true);
    try {
      const { error } = await supabase
        .from('advisories')
        .update({
          feedback_rating: rating,
          farmer_feedback: feedback || null,
        })
        .eq('conversation_id', conversationId);

      if (error) throw error;

      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert(language === 'hi'
        ? 'प्रतिक्रिया सबमिट करते समय त्रुटि हुई।'
        : 'Error submitting feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  }

  async function createTreatmentPlan() {
    if (!advisory || !user) return;

    setCreatingPlan(true);
    try {
      const { data: advisoryData } = await supabase
        .from('advisories')
        .select('id')
        .eq('conversation_id', conversationId)
        .single();

      if (!advisoryData) throw new Error('Advisory not found');

      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data: planData, error: planError } = await supabase
        .from('treatment_plans')
        .insert({
          advisory_id: advisoryData.id,
          user_id: user.id,
          title: advisory.diseaseName,
          description: advisory.description,
          start_date: startDate,
          end_date: endDate,
          status: 'in_progress',
        })
        .select()
        .single();

      if (planError) throw planError;

      const steps = advisory.actionSteps.map((step, index) => {
        const stepDate = new Date(Date.now() + index * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        return {
          treatment_plan_id: planData.id,
          step_number: step.step,
          title: `Step ${step.step}`,
          description: step.action,
          scheduled_date: stepDate,
          scheduled_time: '09:00:00',
        };
      });

      const { error: stepsError } = await supabase
        .from('treatment_steps')
        .insert(steps);

      if (stepsError) throw stepsError;

      for (let i = 0; i < steps.length; i++) {
        const stepDate = new Date(steps[i].scheduled_date);
        const reminderTime = new Date(stepDate.getTime() - 24 * 60 * 60 * 1000).toISOString();

        const { data: stepData } = await supabase
          .from('treatment_steps')
          .select('id')
          .eq('treatment_plan_id', planData.id)
          .eq('step_number', steps[i].step_number)
          .single();

        if (stepData) {
          await supabase.from('treatment_reminders').insert({
            treatment_step_id: stepData.id,
            user_id: user.id,
            reminder_time: reminderTime,
            reminder_type: 'advance',
            message: language === 'hi'
              ? `याद दिलाना: कल ${steps[i].title}`
              : `Reminder: ${steps[i].title} tomorrow`,
          });
        }
      }

      setPlanCreated(true);
    } catch (error) {
      console.error('Error creating treatment plan:', error);
      alert(language === 'hi'
        ? 'उपचार योजना बनाते समय त्रुटि हुई।'
        : 'Error creating treatment plan.');
    } finally {
      setCreatingPlan(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-lime-50 animate-gradient flex items-center justify-center relative overflow-hidden">
        <div className="gradient-mesh absolute inset-0 opacity-50"></div>
        <div className="text-center relative z-10 animate-fade-in">
          <div className="inline-block animate-spin rounded-full h-20 w-20 border-4 border-emerald-600 border-t-transparent mb-6 shadow-2xl" />
          <p className="text-2xl font-black text-gray-900">
            {language === 'hi' ? 'सिफारिश तैयार की जा रही है...' : 'Preparing recommendation...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-lime-50 animate-gradient flex items-center justify-center p-4 relative overflow-hidden">
        <div className="gradient-mesh absolute inset-0 opacity-50"></div>
        <div className="glass-strong rounded-3xl shadow-2xl p-10 max-w-2xl relative z-10 border border-white/20 backdrop-blur-xl animate-scale-in">
          <div className="text-center">
            <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              {language === 'hi' ? 'त्रुटि' : 'Error'}
            </h2>
            <p className="text-lg text-gray-700 mb-8 font-semibold">{error}</p>
            <button
              onClick={onNewDiagnosis}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-2xl font-black hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              {translate('newDiagnosis', language)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!advisory) return null;

  const confidenceColor =
    advisory.confidenceScore >= 0.8
      ? 'text-green-800 bg-green-100 border-green-400'
      : advisory.confidenceScore >= 0.6
      ? 'text-yellow-800 bg-yellow-100 border-yellow-400'
      : 'text-red-800 bg-red-100 border-red-400';

  const ConfidenceIcon =
    advisory.confidenceScore >= 0.8
      ? CheckCircle
      : advisory.confidenceScore >= 0.6
      ? AlertCircle
      : AlertTriangle;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-lime-50 animate-gradient relative overflow-hidden">
      <div className="gradient-mesh absolute inset-0 opacity-50"></div>
      <div className="container mx-auto px-4 py-10 max-w-5xl relative z-10 animate-fade-in">
        <div className="glass-strong rounded-3xl shadow-2xl overflow-hidden border border-white/20 backdrop-blur-xl">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white p-10 relative overflow-hidden animate-gradient">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="flex items-center justify-between relative z-10 animate-slide-up">
              <div>
                <h1 className="text-5xl font-black mb-4 drop-shadow-lg">{translate('diagnosis', language)}</h1>
                <p className="text-3xl font-bold text-white drop-shadow-md">{advisory.diseaseName}</p>
              </div>
              {('speechSynthesis' in window) && (
                <button
                  onClick={speakAdvisory}
                  className={`p-5 rounded-2xl transition-all duration-300 shadow-2xl border-2 transform hover:scale-110 ${
                    speaking
                      ? 'bg-red-500 hover:bg-red-600 border-red-700 animate-pulse'
                      : 'bg-white/20 hover:bg-white/30 border-white/30 backdrop-blur-sm'
                  }`}
                >
                  <Volume2 className="w-8 h-8" />
                </button>
              )}
            </div>
          </div>

          <div className="p-10 space-y-8">
            <div className={`rounded-2xl border-2 p-8 shadow-2xl animate-scale-in hover:scale-105 transition-transform duration-300 ${confidenceColor}`}>
              <div className="flex items-center gap-6">
                <ConfidenceIcon className="w-12 h-12 animate-pulse" />
                <div className="flex-1">
                  <p className="font-black text-2xl mb-4">
                    {translate('confidenceLevel', language)}: {advisory.confidenceLevel}
                  </p>
                  <div className="w-full bg-white rounded-full h-4 border-2 border-current/30 shadow-inner">
                    <div
                      className="h-full rounded-full bg-current shadow-lg transition-all duration-700"
                      style={{ width: `${advisory.confidenceScore * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-4xl font-black">
                  {Math.round(advisory.confidenceScore * 100)}%
                </span>
              </div>
            </div>

            {advisory.escalated && (
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-400 rounded-2xl p-8 shadow-2xl animate-scale-in hover:shadow-amber-300 transition-shadow duration-300">
                <div className="flex gap-6">
                  <AlertTriangle className="w-12 h-12 text-amber-800 flex-shrink-0 mt-1 animate-pulse" />
                  <div>
                    <p className="font-black text-2xl text-amber-900 mb-4">
                      {language === 'hi' ? 'महत्वपूर्ण सिफारिश' : 'Important Recommendation'}
                    </p>
                    <p className="text-amber-900 text-lg font-bold leading-relaxed mb-6">
                      {translate('escalationWarning', language)}
                    </p>
                    <div className="bg-gradient-to-r from-amber-200 to-orange-200 px-6 py-4 rounded-2xl inline-block shadow-lg border-2 border-amber-400 transform hover:scale-105 transition-transform duration-300">
                      <p className="text-amber-900 text-xl font-black">
                        {language === 'hi'
                          ? 'किसान कॉल सेंटर: 1800-180-1551'
                          : 'Kisan Call Centre: 1800-180-1551'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="glass rounded-2xl p-8 border border-gray-200 shadow-2xl animate-slide-up hover:shadow-gray-300 transition-shadow duration-300" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-3xl font-black text-gray-900 mb-6">
                {translate('description', language)}
              </h3>
              <p className="text-gray-800 leading-loose text-xl font-semibold">{advisory.description}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100 rounded-2xl p-8 border-2 border-blue-400 shadow-2xl animate-slide-up hover:shadow-blue-300 transition-shadow duration-300" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-3xl font-black text-blue-900 mb-6">
                💊 {translate('treatment', language)}
              </h3>
              <div className="space-y-5">
                {advisory.actionSteps.map((step, index) => (
                  <div key={step.step} className="flex gap-5 glass border border-blue-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-scale-in" style={{ animationDelay: `${0.05 * index}s` }}>
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                      {step.step}
                    </div>
                    <p className="text-gray-900 pt-2 font-bold text-lg leading-relaxed">{step.action}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-100 via-teal-100 to-lime-100 rounded-2xl p-8 border-2 border-emerald-400 shadow-2xl animate-slide-up hover:shadow-emerald-300 transition-shadow duration-300" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-3xl font-black text-emerald-900 mb-6">
                🛡️ {translate('prevention', language)}
              </h3>
              <p className="text-gray-900 leading-loose text-xl font-bold">{advisory.prevention}</p>
            </div>

            <div className="glass rounded-2xl p-6 border border-gray-300 shadow-lg animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <p className="text-lg font-black text-gray-900">
                📋 {translate('disclaimer', language)}
              </p>
            </div>

            {!feedbackSubmitted ? (
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-2xl p-8 border-2 border-purple-300 shadow-2xl animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-8 h-8 text-purple-700" />
                  <h3 className="text-3xl font-black text-purple-900">
                    {language === 'hi' ? 'आपकी प्रतिक्रिया महत्वपूर्ण है' : 'Your Feedback Matters'}
                  </h3>
                </div>

                <p className="text-lg text-gray-700 font-bold mb-6">
                  {language === 'hi'
                    ? 'कृपया इस सिफ़ारिश को रेट करें और हमें सुधारने में मदद करें'
                    : 'Please rate this recommendation and help us improve'}
                </p>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-all duration-200 transform hover:scale-125"
                      >
                        <Star
                          className={`w-12 h-12 ${
                            star <= (hoveredRating || rating)
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 font-semibold">
                    {rating > 0 && (
                      language === 'hi'
                        ? `${rating} स्टार चयनित`
                        : `${rating} star${rating > 1 ? 's' : ''} selected`
                    )}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-lg font-black text-gray-900 mb-3">
                    {language === 'hi'
                      ? 'अतिरिक्त टिप्पणियाँ (वैकल्पिक)'
                      : 'Additional Comments (Optional)'}
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder={language === 'hi'
                      ? 'आपका अनुभव साझा करें...'
                      : 'Share your experience...'}
                    rows={4}
                    className="w-full px-6 py-4 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none resize-none text-gray-900 font-semibold text-lg"
                  />
                </div>

                <button
                  onClick={submitFeedback}
                  disabled={!rating || submittingFeedback}
                  className={`w-full py-4 rounded-xl font-black text-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                    rating && !submittingFeedback
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:scale-105 transform'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {submittingFeedback ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      {language === 'hi' ? 'सबमिट हो रहा है...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6" />
                      {language === 'hi' ? 'प्रतिक्रिया सबमिट करें' : 'Submit Feedback'}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-400 shadow-2xl animate-scale-in">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-black text-green-900 mb-2">
                    {language === 'hi' ? 'धन्यवाद!' : 'Thank You!'}
                  </h3>
                  <p className="text-lg text-gray-700 font-bold">
                    {language === 'hi'
                      ? 'आपकी प्रतिक्रिया प्राप्त हो गई है'
                      : 'Your feedback has been received'}
                  </p>
                </div>
              </div>
            )}

            {!planCreated && user && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-blue-300 shadow-2xl animate-slide-up" style={{ animationDelay: '0.55s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-8 h-8 text-blue-700" />
                  <h3 className="text-2xl font-black text-blue-900">
                    {language === 'hi' ? 'उपचार ट्रैक करें' : 'Track Treatment'}
                  </h3>
                </div>
                <p className="text-lg text-gray-700 font-bold mb-6">
                  {language === 'hi'
                    ? 'इस उपचार योजना को ट्रैक करने और रिमाइंडर प्राप्त करने के लिए उपचार योजना बनाएं'
                    : 'Create a treatment plan to track this treatment and receive reminders'}
                </p>
                <button
                  onClick={createTreatmentPlan}
                  disabled={creatingPlan}
                  className={`w-full py-4 rounded-xl font-black text-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                    !creatingPlan
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 hover:shadow-xl hover:scale-105 transform'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {creatingPlan ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      {language === 'hi' ? 'योजना बनाई जा रही है...' : 'Creating plan...'}
                    </>
                  ) : (
                    <>
                      <Plus className="w-6 h-6" />
                      {language === 'hi' ? 'उपचार योजना बनाएं' : 'Create Treatment Plan'}
                    </>
                  )}
                </button>
              </div>
            )}

            {planCreated && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-400 shadow-2xl animate-scale-in">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-black text-green-900 mb-2">
                    {language === 'hi' ? 'उपचार योजना बनाई गई!' : 'Treatment Plan Created!'}
                  </h3>
                  <p className="text-lg text-gray-700 font-bold">
                    {language === 'hi'
                      ? 'आप अपनी प्रोफ़ाइल में अपनी उपचार योजना और रिमाइंडर देख सकते हैं'
                      : 'You can view your treatment plan and reminders in your profile'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <button
                onClick={onNewDiagnosis}
                className="flex-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white py-6 rounded-2xl font-black text-2xl hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-4 shadow-2xl hover:shadow-emerald-300 transform hover:scale-105 animate-gradient"
              >
                <RefreshCw className="w-7 h-7" />
                {translate('newDiagnosis', language)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
