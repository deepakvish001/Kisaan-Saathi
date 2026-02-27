import { Sprout, Phone, Mail, MapPin, ExternalLink, Heart } from 'lucide-react';
import { type Language } from '../lib/translations';

interface FooterProps {
  language: Language;
}

export function Footer({ language }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Sprout className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black text-white">
                {language === 'hi' ? 'किसान साथी' : 'Kisaan Saathi'}
              </h3>
            </div>
            <p className="text-emerald-100 font-semibold leading-relaxed mb-4">
              {language === 'hi'
                ? 'आपकी फसलों की देखभाल के लिए AI-संचालित स्मार्ट समाधान। हर किसान के लिए विशेषज्ञ सलाह, 24/7 उपलब्ध।'
                : 'AI-powered smart solutions for your crop care. Expert advice for every farmer, available 24/7.'}
            </p>
            <div className="flex items-center gap-2 text-emerald-200 font-bold">
              <Heart className="w-5 h-5 text-red-400 fill-red-400" />
              <span>
                {language === 'hi'
                  ? 'भारतीय किसानों के लिए बनाया गया'
                  : 'Made for Indian Farmers'}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-black text-white mb-4">
              {language === 'hi' ? 'त्वरित लिंक' : 'Quick Links'}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-emerald-100 hover:text-white font-semibold transition-colors flex items-center gap-2"
                >
                  <span>{language === 'hi' ? 'नया निदान शुरू करें' : 'Start New Diagnosis'}</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-emerald-100 hover:text-white font-semibold transition-colors flex items-center gap-2"
                >
                  <span>{language === 'hi' ? 'परामर्श इतिहास' : 'Consultation History'}</span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-emerald-100 hover:text-white font-semibold transition-colors flex items-center gap-2"
                >
                  <span>{language === 'hi' ? 'प्रोफ़ाइल सेटिंग्स' : 'Profile Settings'}</span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-black text-white mb-4">
              {language === 'hi' ? 'आपातकालीन संपर्क' : 'Emergency Contacts'}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:18001801551"
                  className="text-emerald-100 hover:text-white font-semibold transition-colors flex items-center gap-2"
                >
                  <Phone className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-sm">
                      {language === 'hi' ? 'किसान कॉल सेंटर' : 'Kisan Call Centre'}
                    </div>
                    <div className="font-black">1800-180-1551</div>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="https://mkisan.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-100 hover:text-white font-semibold transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-sm">mKisan Portal</div>
                    <div className="font-black">mkisan.gov.in</div>
                  </div>
                </a>
              </li>
              <li>
                <a
                  href="https://agricoop.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-100 hover:text-white font-semibold transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-sm">
                      {language === 'hi' ? 'कृषि मंत्रालय' : 'Ministry of Agriculture'}
                    </div>
                    <div className="font-black text-xs">agricoop.nic.in</div>
                  </div>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-black text-white mb-4">
              {language === 'hi' ? 'महत्वपूर्ण जानकारी' : 'Important Information'}
            </h4>
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <p className="text-emerald-100 font-bold text-sm mb-2">
                  {language === 'hi' ? '⚠️ अस्वीकरण' : '⚠️ Disclaimer'}
                </p>
                <p className="text-emerald-200 text-xs font-semibold leading-relaxed">
                  {language === 'hi'
                    ? 'यह AI-आधारित सलाह है। गंभीर मामलों में कृषि विशेषज्ञ से परामर्श लें।'
                    : 'This is AI-based advice. Consult agricultural experts for serious cases.'}
                </p>
              </div>

              <div className="bg-emerald-800/30 backdrop-blur-sm rounded-xl p-4 border border-emerald-600/30">
                <p className="text-white font-bold text-sm mb-1">
                  {language === 'hi' ? '🌱 फसल सुरक्षा' : '🌱 Crop Protection'}
                </p>
                <p className="text-emerald-200 text-xs font-semibold">
                  {language === 'hi'
                    ? 'समय पर कार्रवाई से फसल को बचाएं'
                    : 'Protect your crops with timely action'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-emerald-200 font-semibold text-center md:text-left">
              © {currentYear} {language === 'hi' ? 'किसान साथी' : 'Kisaan Saathi'}.{' '}
              {language === 'hi' ? 'सर्वाधिकार सुरक्षित।' : 'All rights reserved.'}
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-emerald-200 hover:text-white font-semibold transition-colors text-sm"
              >
                {language === 'hi' ? 'गोपनीयता नीति' : 'Privacy Policy'}
              </a>
              <a
                href="#"
                className="text-emerald-200 hover:text-white font-semibold transition-colors text-sm"
              >
                {language === 'hi' ? 'उपयोग की शर्तें' : 'Terms of Use'}
              </a>
              <a
                href="#"
                className="text-emerald-200 hover:text-white font-semibold transition-colors text-sm"
              >
                {language === 'hi' ? 'सहायता' : 'Help'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
