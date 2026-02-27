import { useState, useEffect } from 'react';
import { Clock, Leaf, MapPin, TrendingUp, Search, Filter, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { translate, type Language } from '../lib/translations';
import { useAuth } from '../contexts/AuthContext';

interface Consultation {
  id: string;
  created_at: string;
  crop_name: string;
  growth_stage: string;
  location: string;
  status: string;
  confidence_score?: number;
  disease_name?: string;
}

interface HistoryDashboardProps {
  language: Language;
  onViewDetails: (conversationId: string) => void;
}

export function HistoryDashboard({ language, onViewDetails }: HistoryDashboardProps) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConsultations();
    }
  }, [user]);

  async function loadConsultations() {
    try {
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          growth_stage,
          location,
          status,
          crops:crop_id (name_en, name_hi),
          advisories (
            confidence_score,
            diseases:disease_id (name_en, name_hi)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = conversations?.map((conv: any) => ({
        id: conv.id,
        created_at: conv.created_at,
        crop_name: language === 'hi' ? conv.crops?.name_hi : conv.crops?.name_en,
        growth_stage: conv.growth_stage,
        location: conv.location,
        status: conv.status,
        confidence_score: conv.advisories?.[0]?.confidence_score,
        disease_name: language === 'hi'
          ? conv.advisories?.[0]?.diseases?.name_hi
          : conv.advisories?.[0]?.diseases?.name_en,
      })) || [];

      setConsultations(formatted);
    } catch (error) {
      console.error('Error loading consultations:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredConsultations = consultations.filter((consultation) => {
    const matchesSearch =
      consultation.crop_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.disease_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: consultations.length,
    completed: consultations.filter(c => c.status === 'completed').length,
    active: consultations.filter(c => c.status === 'active').length,
    escalated: consultations.filter(c => c.status === 'escalated').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-lime-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 bg-clip-text text-transparent mb-2">
            {language === 'hi' ? 'परामर्श इतिहास' : 'Consultation History'}
          </h1>
          <p className="text-gray-600 text-lg font-semibold">
            {language === 'hi'
              ? 'अपने सभी पिछले परामर्शों को देखें और ट्रैक करें'
              : 'View and track all your past consultations'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-2xl p-6 border border-emerald-200 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-4 rounded-xl">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-600 font-bold">
                  {language === 'hi' ? 'कुल परामर्श' : 'Total'}
                </p>
                <p className="text-3xl font-black text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-green-200 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-xl">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-600 font-bold">
                  {language === 'hi' ? 'पूर्ण' : 'Completed'}
                </p>
                <p className="text-3xl font-black text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-blue-200 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-xl">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-600 font-bold">
                  {language === 'hi' ? 'सक्रिय' : 'Active'}
                </p>
                <p className="text-3xl font-black text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-orange-200 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-4 rounded-xl">
                <Filter className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-600 font-bold">
                  {language === 'hi' ? 'बढ़ाया गया' : 'Escalated'}
                </p>
                <p className="text-3xl font-black text-gray-900">{stats.escalated}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-gray-200 shadow-xl mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'hi' ? 'फसल या रोग खोजें...' : 'Search by crop or disease...'}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none font-semibold text-gray-900"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-6 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none font-semibold text-gray-900 bg-white"
            >
              <option value="all">{language === 'hi' ? 'सभी स्थिति' : 'All Status'}</option>
              <option value="active">{language === 'hi' ? 'सक्रिय' : 'Active'}</option>
              <option value="completed">{language === 'hi' ? 'पूर्ण' : 'Completed'}</option>
              <option value="escalated">{language === 'hi' ? 'बढ़ाया गया' : 'Escalated'}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 font-semibold">
              {language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}
            </p>
          </div>
        ) : filteredConsultations.length === 0 ? (
          <div className="text-center py-16 glass rounded-2xl border border-gray-200">
            <Leaf className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-xl font-bold">
              {language === 'hi'
                ? 'कोई परामर्श नहीं मिला'
                : 'No consultations found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredConsultations.map((consultation) => (
              <div
                key={consultation.id}
                className="glass rounded-2xl p-6 border border-gray-200 shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] cursor-pointer"
                onClick={() => onViewDetails(consultation.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Leaf className="w-6 h-6 text-emerald-600" />
                      <h3 className="text-xl font-black text-gray-900">
                        {consultation.crop_name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        consultation.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : consultation.status === 'active'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {consultation.status === 'completed'
                          ? (language === 'hi' ? 'पूर्ण' : 'Completed')
                          : consultation.status === 'active'
                          ? (language === 'hi' ? 'सक्रिय' : 'Active')
                          : (language === 'hi' ? 'बढ़ाया गया' : 'Escalated')}
                      </span>
                    </div>

                    {consultation.disease_name && (
                      <p className="text-gray-700 font-bold mb-2">
                        {language === 'hi' ? 'निदान: ' : 'Diagnosis: '}
                        <span className="text-red-600">{consultation.disease_name}</span>
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-semibold">
                      {consultation.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {consultation.location}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {new Date(consultation.created_at).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      {consultation.confidence_score && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          {language === 'hi' ? 'विश्वास: ' : 'Confidence: '}
                          {(consultation.confidence_score * 100).toFixed(0)}%
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(consultation.id);
                    }}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 self-start md:self-center"
                  >
                    <Eye className="w-5 h-5" />
                    {language === 'hi' ? 'विवरण देखें' : 'View Details'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
