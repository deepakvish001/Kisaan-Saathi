import { useState, useEffect } from 'react';
import { MapPin, Leaf, Droplets, Plus, Check } from 'lucide-react';
import { fetchFarmProfiles, type FarmProfile } from '../lib/supabase';
import { type Language } from '../lib/translations';

interface ProfileSelectorProps {
  language: Language;
  onSelectProfile: (farmId: string, fieldId: string) => void;
  onCreateNew: () => void;
}

export function ProfileSelector({ language, onSelectProfile, onCreateNew }: ProfileSelectorProps) {
  const [profiles, setProfiles] = useState<FarmProfile[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    try {
      setError(null);
      const data = await fetchFarmProfiles();
      setProfiles(data);
      if (data.length > 0) {
        const defaultFarm = data.find(f => f.is_default) || data[0];
        setSelectedFarmId(defaultFarm.id);
        if (defaultFarm.fields && defaultFarm.fields.length > 0) {
          setSelectedFieldId(defaultFarm.fields[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
      setError(language === 'hi'
        ? 'प्रोफ़ाइल लोड करते समय त्रुटि हुई। कृपया पुनः प्रयास करें।'
        : 'Error loading profiles. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const t = (key: string) => {
    const translations: Record<string, Record<Language, string>> = {
      selectProfile: { en: 'Select Your Farm Profile', hi: 'अपना फार्म प्रोफ़ाइल चुनें' },
      createNew: { en: 'Create New Profile', hi: 'नई प्रोफ़ाइल बनाएं' },
      noProfiles: { en: 'No profiles found', hi: 'कोई प्रोफ़ाइल नहीं मिली' },
      createFirst: { en: 'Create your first farm profile', hi: 'अपनी पहली फार्म प्रोफ़ाइल बनाएं' },
      selectField: { en: 'Select Field', hi: 'खेत चुनें' },
      continue: { en: 'Continue', hi: 'जारी रखें' },
      acres: { en: 'acres', hi: 'एकड़' },
      fields: { en: 'fields', hi: 'खेत' },
    };
    return translations[key]?.[language] || key;
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-semibold">
          {language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{language === 'hi' ? 'त्रुटि' : 'Error'}</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={loadProfiles}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
        >
          {language === 'hi' ? 'पुनः प्रयास करें' : 'Try Again'}
        </button>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('noProfiles')}</h3>
        <p className="text-gray-600 mb-6">{t('createFirst')}</p>
        <button
          onClick={onCreateNew}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 mx-auto"
        >
          <Plus className="w-5 h-5" />
          {t('createNew')}
        </button>
      </div>
    );
  }

  const selectedFarm = profiles.find(p => p.id === selectedFarmId);
  const selectedField = selectedFarm?.fields?.find(f => f.id === selectedFieldId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">{t('selectProfile')}</h3>
        <button
          onClick={onCreateNew}
          className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('createNew')}
        </button>
      </div>

      <div className="grid gap-4">
        {profiles.map((farm) => (
          <div
            key={farm.id}
            onClick={() => {
              setSelectedFarmId(farm.id);
              if (farm.fields && farm.fields.length > 0) {
                setSelectedFieldId(farm.fields[0].id);
              }
            }}
            className={`p-4 border-2 rounded-xl text-left transition-all cursor-pointer ${
              selectedFarmId === farm.id
                ? 'border-emerald-600 bg-emerald-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{farm.farm_name}</h4>
                {farm.location && (
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {farm.location}
                  </p>
                )}
              </div>
              {selectedFarmId === farm.id && (
                <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              {farm.total_area && (
                <span className="flex items-center gap-1">
                  <Leaf className="w-4 h-4" />
                  {farm.total_area} {t('acres')}
                </span>
              )}
              {farm.fields && farm.fields.length > 0 && (
                <span>
                  {farm.fields.length} {t('fields')}
                </span>
              )}
            </div>

            {selectedFarmId === farm.id && farm.fields && farm.fields.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">{t('selectField')}</p>
                <div className="grid gap-2">
                  {farm.fields.map((field) => (
                    <div
                      key={field.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFieldId(field.id);
                      }}
                      className={`p-3 border rounded-lg text-left transition-all cursor-pointer ${
                        selectedFieldId === field.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">{field.field_name}</span>
                          {field.area && (
                            <span className="text-sm text-gray-600 ml-2">
                              ({field.area} {t('acres')})
                            </span>
                          )}
                        </div>
                        {selectedFieldId === field.id && (
                          <Check className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>

                      {field.soil_profile && (
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Leaf className="w-3 h-3" />
                            {field.soil_profile.soil_type}
                          </span>
                          {field.irrigation_profile && (
                            <span className="flex items-center gap-1">
                              <Droplets className="w-3 h-3" />
                              {field.irrigation_profile.irrigation_method}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedFarmId && selectedFieldId && (
        <button
          onClick={() => onSelectProfile(selectedFarmId, selectedFieldId)}
          className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
        >
          {t('continue')}
        </button>
      )}
    </div>
  );
}
