import { useState, useEffect } from 'react';
import { User, MapPin, Phone, Globe, Save, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { type Language } from '../lib/translations';
import { useAuth } from '../contexts/AuthContext';
import { TreatmentDashboard } from './TreatmentDashboard';

interface ProfileSettingsProps {
  language: Language;
}

interface ProfileData {
  full_name: string;
  phone: string;
  location: string;
  preferred_language: Language;
}

export function ProfileSettings({ language }: ProfileSettingsProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    phone: '',
    location: '',
    preferred_language: language,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showTreatmentDashboard, setShowTreatmentDashboard] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  async function loadProfile() {
    try {
      if (!user) {
        throw new Error('No user found');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          location: data.location || '',
          preferred_language: data.preferred_language || language,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage({
        type: 'error',
        text: language === 'hi'
          ? 'प्रोफ़ाइल लोड करते समय त्रुटि हुई। कृपया पुनः प्रयास करें।'
          : 'Error loading profile. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    setMessage(null);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user?.id,
          full_name: profile.full_name,
          phone: profile.phone || null,
          location: profile.location || null,
          preferred_language: profile.preferred_language,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: language === 'hi'
          ? 'प्रोफ़ाइल सफलतापूर्वक सहेजी गई'
          : 'Profile saved successfully',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({
        type: 'error',
        text: language === 'hi'
          ? 'प्रोफ़ाइल सहेजते समय त्रुटि हुई'
          : 'Error saving profile',
      });
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-lime-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 bg-clip-text text-transparent mb-2">
            {language === 'hi' ? 'प्रोफ़ाइल सेटिंग्स' : 'Profile Settings'}
          </h1>
          <p className="text-gray-600 text-lg font-semibold">
            {language === 'hi'
              ? 'अपनी व्यक्तिगत जानकारी अपडेट करें'
              : 'Update your personal information'}
          </p>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowTreatmentDashboard(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 hover:scale-105 transform"
          >
            <Calendar className="w-6 h-6" />
            {language === 'hi' ? 'उपचार ट्रैकिंग देखें' : 'View Treatment Tracking'}
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-6 rounded-2xl border-2 shadow-lg flex items-center gap-4 animate-scale-in ${
              message.type === 'success'
                ? 'bg-green-50 border-green-400 text-green-800'
                : 'bg-red-50 border-red-400 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
            )}
            <p className="font-bold text-lg">{message.text}</p>
          </div>
        )}

        <div className="glass rounded-2xl p-8 border border-gray-200 shadow-2xl">
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-lg font-black text-gray-900 mb-3">
                <User className="w-5 h-5 text-emerald-600" />
                {language === 'hi' ? 'पूरा नाम' : 'Full Name'}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none font-semibold text-gray-900 text-lg"
                placeholder={language === 'hi' ? 'अपना नाम दर्ज करें' : 'Enter your name'}
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-lg font-black text-gray-900 mb-3">
                <Phone className="w-5 h-5 text-emerald-600" />
                {language === 'hi' ? 'फोन नंबर' : 'Phone Number'}
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none font-semibold text-gray-900 text-lg"
                placeholder={language === 'hi' ? '+91 1234567890' : '+91 1234567890'}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-lg font-black text-gray-900 mb-3">
                <MapPin className="w-5 h-5 text-emerald-600" />
                {language === 'hi' ? 'स्थान' : 'Location'}
              </label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none font-semibold text-gray-900 text-lg"
                placeholder={language === 'hi' ? 'गाँव, जिला, राज्य' : 'Village, District, State'}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-lg font-black text-gray-900 mb-3">
                <Globe className="w-5 h-5 text-emerald-600" />
                {language === 'hi' ? 'पसंदीदा भाषा' : 'Preferred Language'}
              </label>
              <select
                value={profile.preferred_language}
                onChange={(e) => setProfile({ ...profile, preferred_language: e.target.value as Language })}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 focus:outline-none font-semibold text-gray-900 text-lg bg-white"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>

            <div className="pt-6 border-t-2 border-gray-200">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="font-black text-lg text-blue-900 mb-2">
                  {language === 'hi' ? 'ईमेल पता' : 'Email Address'}
                </h3>
                <p className="text-gray-700 font-semibold">
                  {user?.email}
                </p>
                <p className="text-sm text-gray-600 font-semibold mt-2">
                  {language === 'hi'
                    ? 'ईमेल पता नहीं बदला जा सकता'
                    : 'Email address cannot be changed'}
                </p>
              </div>
            </div>

            <button
              onClick={saveProfile}
              disabled={!profile.full_name || saving}
              className={`w-full py-5 rounded-xl font-black text-xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg ${
                profile.full_name && !saving
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl hover:scale-105 transform'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  {language === 'hi' ? 'सहेजा जा रहा है...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  {language === 'hi' ? 'प्रोफ़ाइल सहेजें' : 'Save Profile'}
                </>
              )}
            </button>
          </div>
        </div>

        {showTreatmentDashboard && user && (
          <TreatmentDashboard
            language={language}
            userId={user.id}
            onClose={() => setShowTreatmentDashboard(false)}
          />
        )}
      </div>
    </div>
  );
}
