import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, Circle, AlertCircle, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { type Language } from '../lib/translations';

interface TreatmentStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  scheduled_date: string;
  scheduled_time: string | null;
  status: 'pending' | 'completed' | 'skipped';
  completed_at: string | null;
  notes: string | null;
}

interface TreatmentPlanData {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string | null;
  status: string;
  progress_percentage: number;
  steps: TreatmentStep[];
}

interface TreatmentPlanProps {
  planId: string;
  language: Language;
  onClose?: () => void;
}

export function TreatmentPlan({ planId, language, onClose }: TreatmentPlanProps) {
  const [plan, setPlan] = useState<TreatmentPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStep, setSelectedStep] = useState<TreatmentStep | null>(null);

  useEffect(() => {
    loadPlan();
  }, [planId]);

  async function loadPlan() {
    try {
      const { data: planData, error: planError } = await supabase
        .from('treatment_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;

      const { data: stepsData, error: stepsError } = await supabase
        .from('treatment_steps')
        .select('*')
        .eq('treatment_plan_id', planId)
        .order('step_number');

      if (stepsError) throw stepsError;

      setPlan({
        ...planData,
        steps: stepsData || [],
      });
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markStepComplete(stepId: string, notes: string = '') {
    try {
      const { error } = await supabase
        .from('treatment_steps')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          notes: notes || null,
        })
        .eq('id', stepId);

      if (error) throw error;

      await loadPlan();
      setSelectedStep(null);
    } catch (error) {
      console.error('Error marking step complete:', error);
    }
  }

  async function skipStep(stepId: string) {
    try {
      const { error } = await supabase
        .from('treatment_steps')
        .update({ status: 'skipped' })
        .eq('id', stepId);

      if (error) throw error;
      await loadPlan();
    } catch (error) {
      console.error('Error skipping step:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 font-semibold">
          {language === 'hi' ? 'उपचार योजना नहीं मिली' : 'Treatment plan not found'}
        </p>
      </div>
    );
  }

  const completedSteps = plan.steps.filter(s => s.status === 'completed').length;
  const totalSteps = plan.steps.length;
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 border border-emerald-200 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-black text-gray-900 mb-2">{plan.title}</h2>
            <p className="text-gray-700 font-semibold leading-relaxed">{plan.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-5 h-5" />
            <span className="font-bold">
              {new Date(plan.start_date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US')}
            </span>
          </div>
          {plan.end_date && (
            <>
              <span className="text-gray-400">→</span>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-5 h-5" />
                <span className="font-bold">
                  {new Date(plan.end_date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US')}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-700">
              {language === 'hi' ? 'प्रगति' : 'Progress'}: {completedSteps} / {totalSteps} {language === 'hi' ? 'चरण' : 'steps'}
            </span>
            <span className="text-sm font-bold text-emerald-600">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-gray-900">
          {language === 'hi' ? 'उपचार चरण' : 'Treatment Steps'}
        </h3>

        {plan.steps.map((step) => (
          <div
            key={step.id}
            className={`glass rounded-xl p-5 border-2 transition-all duration-300 hover:shadow-xl ${
              step.status === 'completed'
                ? 'border-emerald-300 bg-emerald-50'
                : step.status === 'skipped'
                ? 'border-gray-300 bg-gray-50 opacity-60'
                : 'border-gray-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {step.status === 'completed' ? (
                  <CheckCircle className="w-7 h-7 text-emerald-600" />
                ) : step.status === 'skipped' ? (
                  <Circle className="w-7 h-7 text-gray-400" />
                ) : (
                  <AlertCircle className="w-7 h-7 text-orange-500" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-lg font-black text-gray-900">
                    {step.step_number}. {step.title}
                  </h4>
                  {step.status === 'pending' && (
                    <button
                      onClick={() => setSelectedStep(step)}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl text-sm"
                    >
                      {language === 'hi' ? 'पूर्ण करें' : 'Complete'}
                    </button>
                  )}
                </div>

                <p className="text-gray-700 mb-3 font-semibold leading-relaxed">{step.description}</p>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="font-bold">
                      {new Date(step.scheduled_date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US')}
                    </span>
                  </div>
                  {step.scheduled_time && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-bold">{step.scheduled_time}</span>
                    </div>
                  )}
                </div>

                {step.completed_at && (
                  <div className="mt-3 pt-3 border-t border-emerald-200">
                    <p className="text-sm text-emerald-700 font-bold">
                      {language === 'hi' ? '✓ पूर्ण: ' : '✓ Completed: '}
                      {new Date(step.completed_at).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-US')}
                    </p>
                    {step.notes && (
                      <p className="text-sm text-gray-600 mt-1 font-semibold">
                        {language === 'hi' ? 'नोट्स: ' : 'Notes: '}{step.notes}
                      </p>
                    )}
                  </div>
                )}

                {step.status === 'pending' && (
                  <button
                    onClick={() => skipStep(step.id)}
                    className="text-sm text-gray-500 hover:text-gray-700 font-bold mt-2 underline"
                  >
                    {language === 'hi' ? 'छोड़ें' : 'Skip this step'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedStep && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 max-w-md w-full shadow-2xl animate-scale-in">
            <h3 className="text-xl font-black text-gray-900 mb-4">
              {language === 'hi' ? 'चरण पूर्ण करें' : 'Complete Step'}
            </h3>

            <div className="mb-4">
              <p className="text-gray-700 font-semibold mb-2">{selectedStep.title}</p>
              <textarea
                id="notes"
                placeholder={language === 'hi' ? 'नोट्स या अवलोकन (वैकल्पिक)' : 'Notes or observations (optional)'}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none resize-none text-gray-900 font-semibold"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedStep(null)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-300 transition-colors"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  const notes = (document.getElementById('notes') as HTMLTextAreaElement)?.value;
                  markStepComplete(selectedStep.id, notes);
                }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
              >
                {language === 'hi' ? 'पूर्ण करें' : 'Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
