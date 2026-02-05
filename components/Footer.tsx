
import React from 'react';
import { Twitter, Facebook, Instagram, Phone, MapPin, Mail, Send, ChevronLeft } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0f172a] text-white pt-16 pb-32 px-6 font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Identity & Social */}
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="flex items-center gap-3 bg-white/5 p-4 rounded-[2rem] border border-white/10">
            <h2 className="text-3xl font-black italic tracking-tighter text-white">ستايل رو</h2>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
               <img src="https://stylero.online/logo.png" className="w-8 h-8 object-contain" alt="Logo" />
            </div>
          </div>
          <p className="text-gray-400 text-sm font-bold">متجرك الأول للتسوق الإلكتروني والأناقة العصرية</p>
          
          <div className="flex gap-4">
            {[Twitter, Facebook, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-[#FF4500] hover:border-[#FF4500] transition-all text-gray-300 hover:text-white">
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Quick Links */}
          <div className="space-y-6">
            <div className="flex flex-col">
              <h3 className="text-lg font-black tracking-tighter">روابط سريعة</h3>
              <div className="w-12 h-1 bg-[#FF4500] rounded-full mt-2"></div>
            </div>
            <ul className="space-y-4">
              {['الرئيسية', 'أحدث المنتجات', 'خدمة شي إن', 'طلبات خاصة', 'تتبع الطلب', 'تواصل معنا'].map((link, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold transition-all group">
                    <ChevronLeft size={16} className="text-[#FF4500] group-hover:-translate-x-1 transition-transform" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div className="space-y-6">
            <div className="flex flex-col">
              <h3 className="text-lg font-black tracking-tighter">تواصل معنا</h3>
              <div className="w-12 h-1 bg-[#FF4500] rounded-full mt-2"></div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-[#FF4500] group-hover:text-white transition-all">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase">اتصل بنا أو واتساب</p>
                  <p className="text-sm font-black tracking-wider text-gray-200">967772728311+</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-[#FF4500] group-hover:text-white transition-all">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase">العنوان</p>
                  <p className="text-sm font-black text-gray-200">صنعاء، اليمن</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-[#FF4500] group-hover:text-white transition-all">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase">البريد الإلكتروني</p>
                  <p className="text-sm font-black text-gray-200">stylero.online@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <div className="flex flex-col">
              <h3 className="text-lg font-black tracking-tighter">النشرة البريدية</h3>
              <div className="w-12 h-1 bg-[#FF4500] rounded-full mt-2"></div>
            </div>
            <p className="text-gray-400 text-xs font-bold leading-relaxed">اشترك في نشرتنا البريدية للحصول على آخر العروض والمنتجات الحصرية.</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="بريدك الإلكتروني" 
                className="w-full bg-white/5 border border-white/10 p-5 pr-6 rounded-2xl outline-none text-xs font-bold focus:border-[#FF4500] transition-all"
              />
              <button className="absolute left-2 top-2 bottom-2 bg-[#FF4500] text-white px-4 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all">
                <Send size={18} className="rotate-180" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-10 border-t border-white/5 text-center">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">جميع الحقوق محفوظة لمتجر ستايل رو © 2026</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
