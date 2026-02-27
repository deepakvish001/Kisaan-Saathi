import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, MapPin, Droplets, Leaf, History, Clock } from 'lucide-react';
import { translate, type Language } from '../lib/translations';

export interface FarmProfileData {
  farmName: string;
  totalArea: string;
  location: string;
  farmType: 'smallholder' | 'commercial' | 'organic' | 'mixed';
  primaryCrops: string[];
}

export interface FieldProfileData {
  fieldName: string;
  area: string;
  slope: 'flat' | 'gentle' | 'moderate' | 'steep';
  drainage: 'poor' | 'adequate' | 'good' | 'excellent';
  sunExposure: 'full_sun' | 'partial_shade' | 'full_shade';
}

export interface SoilProfileData {
  soilType: 'sandy' | 'loamy' | 'clay' | 'silt' | 'peat' | 'chalk';
  organicMatter: 'low' | 'medium' | 'high';
  phLevel: string;
  nitrogenLevel?: 'low' | 'medium' | 'high';
  phosphorusLevel?: 'low' | 'medium' | 'high';
  potassiumLevel?: 'low' | 'medium' | 'high';
}

export interface IrrigationProfileData {
  waterSource: 'well' | 'canal' | 'river' | 'rainwater' | 'borewell' | 'municipal';
  irrigationMethod: 'drip' | 'sprinkler' | 'flood' | 'furrow' | 'manual' | 'rainfed';
  waterQuality: 'excellent' | 'good' | 'fair' | 'poor';
  waterAvailability: 'abundant' | 'adequate' | 'limited' | 'scarce';
}

export interface CharacterisationData {
  farm: FarmProfileData;
  field: FieldProfileData;
  soil: SoilProfileData;
  irrigation: IrrigationProfileData;
}

interface FarmProfileWizardProps {
  language: Language;
  onComplete: (data: CharacterisationData) => void;
  onSkip: () => void;
  onClose: () => void;
}

type WizardStep = 'farm' | 'field' | 'soil' | 'irrigation' | 'review';

export function FarmProfileWizard({ language, onComplete, onSkip, onClose }: FarmProfileWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('farm');
  const [farmData, setFarmData] = useState<FarmProfileData>({
    farmName: '',
    totalArea: '',
    location: '',
    farmType: 'smallholder',
    primaryCrops: [],
  });
  const [fieldData, setFieldData] = useState<FieldProfileData>({
    fieldName: '',
    area: '',
    slope: 'flat',
    drainage: 'adequate',
    sunExposure: 'full_sun',
  });
  const [soilData, setSoilData] = useState<SoilProfileData>({
    soilType: 'loamy',
    organicMatter: 'medium',
    phLevel: '',
  });
  const [irrigationData, setIrrigationData] = useState<IrrigationProfileData>({
    waterSource: 'well',
    irrigationMethod: 'manual',
    waterQuality: 'good',
    waterAvailability: 'adequate',
  });

  const steps: WizardStep[] = ['farm', 'field', 'soil', 'irrigation', 'review'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const t = (key: string) => {
    const translations: Record<string, Record<Language, string>> = {
      wizardTitle: { en: 'Farm Profile Setup', hi: 'फार्म प्रोफ़ाइल सेटअप' },
      skipForNow: { en: 'Skip for now', hi: 'अभी छोड़ें' },
      next: { en: 'Next', hi: 'आगे' },
      back: { en: 'Back', hi: 'पीछे' },
      complete: { en: 'Complete Setup', hi: 'सेटअप पूरा करें' },
      farmInfo: { en: 'Farm Information', hi: 'फार्म जानकारी' },
      fieldInfo: { en: 'Field Details', hi: 'खेत विवरण' },
      soilInfo: { en: 'Soil Analysis', hi: 'मिट्टी विश्लेषण' },
      irrigationInfo: { en: 'Irrigation Setup', hi: 'सिंचाई व्यवस्था' },
      reviewInfo: { en: 'Review & Confirm', hi: 'समीक्षा और पुष्टि' },
      farmName: { en: 'Farm Name', hi: 'फार्म का नाम' },
      farmNamePlaceholder: { en: 'e.g., Green Valley Farm', hi: 'उदाहरण: ग्रीन वैली फार्म' },
      totalArea: { en: 'Total Area (acres)', hi: 'कुल क्षेत्र (एकड़)' },
      location: { en: 'Location', hi: 'स्थान' },
      locationPlaceholder: { en: 'Village/Town, District', hi: 'गांव/शहर, जिला' },
      farmType: { en: 'Farm Type', hi: 'फार्म प्रकार' },
      smallholder: { en: 'Smallholder (< 5 acres)', hi: 'छोटा किसान (< 5 एकड़)' },
      commercial: { en: 'Commercial (> 5 acres)', hi: 'व्यावसायिक (> 5 एकड़)' },
      organic: { en: 'Organic Farm', hi: 'जैविक खेती' },
      mixed: { en: 'Mixed Farming', hi: 'मिश्रित खेती' },
      fieldName: { en: 'Field/Plot Name', hi: 'खेत/प्लॉट का नाम' },
      fieldNamePlaceholder: { en: 'e.g., North Field, Plot 1', hi: 'उदाहरण: उत्तरी खेत, प्लॉट 1' },
      fieldArea: { en: 'Field Area (acres)', hi: 'खेत का क्षेत्र (एकड़)' },
      slope: { en: 'Land Slope', hi: 'भूमि की ढलान' },
      flat: { en: 'Flat', hi: 'समतल' },
      gentle: { en: 'Gentle Slope', hi: 'हल्की ढलान' },
      moderate: { en: 'Moderate Slope', hi: 'मध्यम ढलान' },
      steep: { en: 'Steep Slope', hi: 'तीव्र ढलान' },
      drainage: { en: 'Drainage', hi: 'जल निकासी' },
      poor: { en: 'Poor', hi: 'खराब' },
      adequate: { en: 'Adequate', hi: 'पर्याप्त' },
      good: { en: 'Good', hi: 'अच्छी' },
      excellent: { en: 'Excellent', hi: 'उत्कृष्ट' },
      sunExposure: { en: 'Sun Exposure', hi: 'धूप' },
      fullSun: { en: 'Full Sun', hi: 'पूर्ण धूप' },
      partialShade: { en: 'Partial Shade', hi: 'आंशिक छाया' },
      fullShade: { en: 'Full Shade', hi: 'पूर्ण छाया' },
      soilType: { en: 'Soil Type', hi: 'मिट्टी का प्रकार' },
      sandy: { en: 'Sandy', hi: 'रेतीली' },
      loamy: { en: 'Loamy (best)', hi: 'दोमट (सर्वोत्तम)' },
      clay: { en: 'Clay', hi: 'चिकनी' },
      silt: { en: 'Silt', hi: 'गाद' },
      peat: { en: 'Peat', hi: 'पीट' },
      chalk: { en: 'Chalk', hi: 'चाक' },
      organicMatter: { en: 'Organic Matter', hi: 'जैविक पदार्थ' },
      low: { en: 'Low', hi: 'कम' },
      medium: { en: 'Medium', hi: 'मध्यम' },
      high: { en: 'High', hi: 'उच्च' },
      phLevel: { en: 'pH Level (optional)', hi: 'pH स्तर (वैकल्पिक)' },
      phPlaceholder: { en: '6.0 - 7.5 (ideal)', hi: '6.0 - 7.5 (आदर्श)' },
      npkLevels: { en: 'NPK Levels (optional)', hi: 'NPK स्तर (वैकल्पिक)' },
      nitrogen: { en: 'Nitrogen (N)', hi: 'नाइट्रोजन (N)' },
      phosphorus: { en: 'Phosphorus (P)', hi: 'फास्फोरस (P)' },
      potassium: { en: 'Potassium (K)', hi: 'पोटेशियम (K)' },
      waterSource: { en: 'Water Source', hi: 'पानी का स्रोत' },
      well: { en: 'Well', hi: 'कुआं' },
      canal: { en: 'Canal', hi: 'नहर' },
      river: { en: 'River', hi: 'नदी' },
      rainwater: { en: 'Rainwater', hi: 'वर्षा जल' },
      borewell: { en: 'Borewell', hi: 'बोरवेल' },
      municipal: { en: 'Municipal Supply', hi: 'नगरपालिका आपूर्ति' },
      irrigationMethod: { en: 'Irrigation Method', hi: 'सिंचाई विधि' },
      drip: { en: 'Drip Irrigation', hi: 'ड्रिप सिंचाई' },
      sprinkler: { en: 'Sprinkler', hi: 'स्प्रिंकलर' },
      flood: { en: 'Flood Irrigation', hi: 'बाढ़ सिंचाई' },
      furrow: { en: 'Furrow', hi: 'कुंड' },
      manual: { en: 'Manual/Bucket', hi: 'मैनुअल/बाल्टी' },
      rainfed: { en: 'Rainfed (No Irrigation)', hi: 'वर्षा आधारित (कोई सिंचाई नहीं)' },
      waterQuality: { en: 'Water Quality', hi: 'पानी की गुणवत्ता' },
      waterAvailability: { en: 'Water Availability', hi: 'पानी की उपलब्धता' },
      abundant: { en: 'Abundant', hi: 'प्रचुर' },
      limited: { en: 'Limited', hi: 'सीमित' },
      scarce: { en: 'Scarce', hi: 'दुर्लभ' },
      reviewTitle: { en: 'Review Your Profile', hi: 'अपनी प्रोफ़ाइल की समीक्षा करें' },
      reviewDesc: { en: 'This information will help provide personalized recommendations', hi: 'यह जानकारी व्यक्तिगत सिफारिशें प्रदान करने में मदद करेगी' },
    };
    return translations[key]?.[language] || key;
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleComplete = () => {
    onComplete({
      farm: farmData,
      field: fieldData,
      soil: soilData,
      irrigation: irrigationData,
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'farm':
        return farmData.farmName && farmData.farmType;
      case 'field':
        return fieldData.fieldName;
      case 'soil':
        return true;
      case 'irrigation':
        return true;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{t('wizardTitle')}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="flex gap-2">
              {steps.map((step, idx) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    idx <= currentStepIndex
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {idx < currentStepIndex ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
              ))}
            </div>
            <button
              onClick={onSkip}
              className="text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1"
            >
              <Clock className="w-4 h-4" />
              {t('skipForNow')}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'farm' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t('farmInfo')}</h3>
                  <p className="text-sm text-gray-600">Basic information about your farm</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('farmName')} *
                </label>
                <input
                  type="text"
                  value={farmData.farmName}
                  onChange={(e) => setFarmData({ ...farmData, farmName: e.target.value })}
                  placeholder={t('farmNamePlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('totalArea')}
                  </label>
                  <input
                    type="number"
                    value={farmData.totalArea}
                    onChange={(e) => setFarmData({ ...farmData, totalArea: e.target.value })}
                    placeholder="5"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('location')}
                  </label>
                  <input
                    type="text"
                    value={farmData.location}
                    onChange={(e) => setFarmData({ ...farmData, location: e.target.value })}
                    placeholder={t('locationPlaceholder')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('farmType')} *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['smallholder', 'commercial', 'organic', 'mixed'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFarmData({ ...farmData, farmType: type })}
                      className={`p-4 border-2 rounded-xl text-left transition-all ${
                        farmData.farmType === type
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium text-gray-900">{t(type)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'field' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t('fieldInfo')}</h3>
                  <p className="text-sm text-gray-600">Details about your field or plot</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('fieldName')} *
                </label>
                <input
                  type="text"
                  value={fieldData.fieldName}
                  onChange={(e) => setFieldData({ ...fieldData, fieldName: e.target.value })}
                  placeholder={t('fieldNamePlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('fieldArea')}
                </label>
                <input
                  type="number"
                  value={fieldData.area}
                  onChange={(e) => setFieldData({ ...fieldData, area: e.target.value })}
                  placeholder="2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('slope')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['flat', 'gentle', 'moderate', 'steep'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFieldData({ ...fieldData, slope: type })}
                      className={`p-3 border-2 rounded-xl transition-all ${
                        fieldData.slope === type
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-900">{t(type)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('drainage')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['poor', 'adequate', 'good', 'excellent'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFieldData({ ...fieldData, drainage: type })}
                      className={`p-3 border-2 rounded-xl transition-all ${
                        fieldData.drainage === type
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-900">{t(type)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('sunExposure')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['full_sun', 'partial_shade', 'full_shade'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFieldData({ ...fieldData, sunExposure: type })}
                      className={`p-3 border-2 rounded-xl transition-all ${
                        fieldData.sunExposure === type
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-900">{t(type.replace('_', ''))}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'soil' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t('soilInfo')}</h3>
                  <p className="text-sm text-gray-600">Information about your soil conditions</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('soilType')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['sandy', 'loamy', 'clay', 'silt', 'peat', 'chalk'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSoilData({ ...soilData, soilType: type })}
                      className={`p-3 border-2 rounded-xl transition-all ${
                        soilData.soilType === type
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-900">{t(type)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('organicMatter')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setSoilData({ ...soilData, organicMatter: level })}
                      className={`p-3 border-2 rounded-xl transition-all ${
                        soilData.organicMatter === level
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-900">{t(level)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('phLevel')}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={soilData.phLevel}
                  onChange={(e) => setSoilData({ ...soilData, phLevel: e.target.value })}
                  placeholder={t('phPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('npkLevels')}
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">{t('nitrogen')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['low', 'medium', 'high'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setSoilData({ ...soilData, nitrogenLevel: level })}
                          className={`p-2 border-2 rounded-lg text-xs transition-all ${
                            soilData.nitrogenLevel === level
                              ? 'border-emerald-600 bg-emerald-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {t(level)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">{t('phosphorus')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['low', 'medium', 'high'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setSoilData({ ...soilData, phosphorusLevel: level })}
                          className={`p-2 border-2 rounded-lg text-xs transition-all ${
                            soilData.phosphorusLevel === level
                              ? 'border-emerald-600 bg-emerald-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {t(level)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">{t('potassium')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['low', 'medium', 'high'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setSoilData({ ...soilData, potassiumLevel: level })}
                          className={`p-2 border-2 rounded-lg text-xs transition-all ${
                            soilData.potassiumLevel === level
                              ? 'border-emerald-600 bg-emerald-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {t(level)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'irrigation' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t('irrigationInfo')}</h3>
                  <p className="text-sm text-gray-600">Your irrigation and water management</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('waterSource')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['well', 'canal', 'river', 'rainwater', 'borewell', 'municipal'] as const).map((source) => (
                    <button
                      key={source}
                      onClick={() => setIrrigationData({ ...irrigationData, waterSource: source })}
                      className={`p-3 border-2 rounded-xl transition-all ${
                        irrigationData.waterSource === source
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-900">{t(source)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('irrigationMethod')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['drip', 'sprinkler', 'flood', 'furrow', 'manual', 'rainfed'] as const).map((method) => (
                    <button
                      key={method}
                      onClick={() => setIrrigationData({ ...irrigationData, irrigationMethod: method })}
                      className={`p-3 border-2 rounded-xl transition-all ${
                        irrigationData.irrigationMethod === method
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-900">{t(method)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('waterQuality')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['excellent', 'good', 'fair', 'poor'] as const).map((quality) => (
                    <button
                      key={quality}
                      onClick={() => setIrrigationData({ ...irrigationData, waterQuality: quality })}
                      className={`p-3 border-2 rounded-xl transition-all ${
                        irrigationData.waterQuality === quality
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-900">{t(quality)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('waterAvailability')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['abundant', 'adequate', 'limited', 'scarce'] as const).map((avail) => (
                    <button
                      key={avail}
                      onClick={() => setIrrigationData({ ...irrigationData, waterAvailability: avail })}
                      className={`p-3 border-2 rounded-xl transition-all ${
                        irrigationData.waterAvailability === avail
                          ? 'border-emerald-600 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium text-gray-900">{t(avail)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <History className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t('reviewTitle')}</h3>
                  <p className="text-sm text-gray-600">{t('reviewDesc')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('farmInfo')}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Name:</span> {farmData.farmName}</p>
                    {farmData.totalArea && <p><span className="font-medium">Area:</span> {farmData.totalArea} acres</p>}
                    {farmData.location && <p><span className="font-medium">Location:</span> {farmData.location}</p>}
                    <p><span className="font-medium">Type:</span> {t(farmData.farmType)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('fieldInfo')}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Name:</span> {fieldData.fieldName}</p>
                    {fieldData.area && <p><span className="font-medium">Area:</span> {fieldData.area} acres</p>}
                    <p><span className="font-medium">Slope:</span> {t(fieldData.slope)}</p>
                    <p><span className="font-medium">Drainage:</span> {t(fieldData.drainage)}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('soilInfo')}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Type:</span> {t(soilData.soilType)}</p>
                    <p><span className="font-medium">Organic Matter:</span> {t(soilData.organicMatter)}</p>
                    {soilData.phLevel && <p><span className="font-medium">pH:</span> {soilData.phLevel}</p>}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('irrigationInfo')}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Water Source:</span> {t(irrigationData.waterSource)}</p>
                    <p><span className="font-medium">Method:</span> {t(irrigationData.irrigationMethod)}</p>
                    <p><span className="font-medium">Quality:</span> {t(irrigationData.waterQuality)}</p>
                    <p><span className="font-medium">Availability:</span> {t(irrigationData.waterAvailability)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className="px-6 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('back')}
          </button>

          {currentStep === 'review' ? (
            <button
              onClick={handleComplete}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              {t('complete')}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {t('next')}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
