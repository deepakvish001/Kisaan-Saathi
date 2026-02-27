import { useState, useEffect } from 'react';
import { History, Calendar, CheckCircle, TrendingUp, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { type Language } from '../lib/translations';
import { TreatmentPlan } from './TreatmentPlan';

interface TreatmentPlanSummary {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string | null;
  status: string;
  progress_percentage: number;
  created_at: string;
}

interface TreatmentHistoryProps {
  language: Language;
  userId: string;
}

export function TreatmentHistory({ language, userId }: TreatmentHistoryProps) {
  const [plans, setPlans] = useState<TreatmentPlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    loadPlans();
  }, [userId]);

  async function loadPlans() {
    try {
      const { data, error } = await supabase
        .from('treatment_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const filteredPlans = plans.filter(plan => {
    if (filterStatus === 'all') return true;
    return plan.status === filterStatus;
  });

  if (selectedPlanId) {
    return (
      <div>
        <button
          onClick={() => setSelectedPlanId(null)}
          className="mb-4 text-emerald-600 font-bold hover:text-emerald-700 flex items-center gap-2"
        >
          ← {language === 'hi' ? 'वापस जाएं' : 'Back to history'}
        </button>
        <TreatmentPlan planId={selectedPlanId} language={language} />
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 border border-gray-200 text-center">
        <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-black text-gray-900 mb-2">
          {language === 'hi' ? 'कोई उपचार इतिहास नहीं' : 'No Treatment History'}
        </h3>
        <p className="text-gray-600 font-semibold">
          {language === 'hi'
            ? 'जब आप सिफारिशें प्राप्त करेंगे तो उपचार योजनाएं यहां दिखाई देंगी।'
            : 'Treatment plans will appear here when you receive recommendations.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-black text-gray-900">
            {language === 'hi' ? 'उपचार इतिहास' : 'Treatment History'}
          </h2>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              filterStatus === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {language === 'hi' ? 'सभी' : 'All'}
          </button>
          <button
            onClick={() => setFilterStatus('in_progress')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              filterStatus === 'in_progress'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {language === 'hi' ? 'चालू' : 'Active'}
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              filterStatus === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {language === 'hi' ? 'पूर्ण' : 'Completed'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setSelectedPlanId(plan.id)}
            className={`glass rounded-xl p-6 border-2 transition-all duration-300 hover:shadow-xl cursor-pointer hover:scale-105 ${
              plan.status === 'completed'
                ? 'border-emerald-300 bg-emerald-50'
                : plan.status === 'in_progress'
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-black text-gray-900 flex-1">{plan.title}</h3>
              {plan.status === 'completed' && (
                <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              )}
            </div>

            <p className="text-gray-700 font-semibold text-sm mb-4 line-clamp-2">
              {plan.description}
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Calendar className="w-4 h-4" />
              <span className="font-bold">
                {new Date(plan.start_date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US')}
              </span>
              {plan.end_date && (
                <>
                  <span>→</span>
                  <span className="font-bold">
                    {new Date(plan.end_date).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US')}
                  </span>
                </>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-gray-700">
                  {language === 'hi' ? 'प्रगति' : 'Progress'}
                </span>
                <span className="font-black text-emerald-600">{plan.progress_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${plan.progress_percentage}%` }}
                ></div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-black px-3 py-1 rounded-full ${
                    plan.status === 'completed'
                      ? 'bg-emerald-200 text-emerald-800'
                      : plan.status === 'in_progress'
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {plan.status === 'completed'
                    ? (language === 'hi' ? 'पूर्ण' : 'Completed')
                    : plan.status === 'in_progress'
                    ? (language === 'hi' ? 'चालू' : 'In Progress')
                    : (language === 'hi' ? 'लंबित' : 'Pending')}
                </span>
                <FileText className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="glass rounded-xl p-8 border border-gray-200 text-center">
          <p className="text-gray-600 font-semibold">
            {language === 'hi' ? 'इस फ़िल्टर में कोई योजना नहीं' : 'No plans in this filter'}
          </p>
        </div>
      )}
    </div>
  );
}
