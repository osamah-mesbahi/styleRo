
import React from 'react';
import { Instagram, Facebook, Music, Phone, Mail, MapPin, Globe, Coins } from 'lucide-react';
import { StoreSettings } from '../types';

interface FooterProps {
  settings: StoreSettings;
  language: 'en' | 'ar';
  onToggleLanguage: () => void;
  onToggleCurrency: () => void;
}

const Footer: React.FC<FooterProps> = ({ settings, language, onToggleLanguage, onToggleCurrency }) => {
  const isRtl = language === 'ar';
  return (
    <footer className="bg-white border-t border-gray-100 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 text-right" dir="rtl">
        <div className="col-span-1">
          <h2 className="text-3xl font-extrabold mb-4">{settings.name}</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed max-w-md">
            وسيطكم الأول للطلب من أشهر المواقع العالمية وتوصيلها حتى باب بيتكم في اليمن. جودة، ثقة، وسرعة في التنفيذ لضمان أفضل تجربة تسوق.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href={settings.socialMedia?.instagram || '#'} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition">
              <Instagram size={20} />
            </a>
            <a href={settings.socialMedia?.facebook || '#'} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition">
              <Facebook size={20} />
            </a>
            <a href={settings.socialMedia?.twitter || '#'} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-800 hover:text-white transition">
              <Music size={20} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-4 text-lg">تواصل معنا</h3>
          <ul className="space-y-4 text-sm text-gray-500">
            <li className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-primary">
                <Mail size={20} />
              </div>
              <span className="font-bold">stylero.onlie@gmail.com</span>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-primary">
                <MapPin size={20} />
              </div>
              <span className="font-bold">اليمن - صنعاء</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-gray-50 flex flex-col items-center gap-2">
        <div className="flex flex-col md:flex-row justify-between w-full items-center gap-4 text-[10px] text-gray-400 font-medium">
          <p>© 2024 {settings.name}. جميع الحقوق محفوظة.</p>
          <div className="flex gap-4">
            {/* تم حذف صور فيزا وماستركارد بناءً على طلب العميل */}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold"
            aria-label="Toggle language"
          >
            <Globe size={14} />
            {isRtl ? 'EN' : 'AR'}
          </button>
          <button
            type="button"
            onClick={onToggleCurrency}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold"
            aria-label="Toggle currency"
          >
            <Coins size={14} />
            {settings.currency}
          </button>
        </div>
        
        {/* توقيع مطور البرنامج بطريقة احترافية وغير متباينة */}
        <div className="mt-4 flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity duration-500 cursor-default">
          <div className="h-px w-8 bg-gray-300"></div>
          <p className="text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase">
            designed & Developed: <span className="text-gray-500">Osamah mesbahi</span>
          </p>
          <div className="h-px w-8 bg-gray-300"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

