
import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, MessageSquare, Sparkles, User, HelpCircle, CheckCircle, RefreshCw, MessageCircle } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Footer from './Footer';

const ContactView: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) {
      alert("يرجى ملء الحقول المطلوبة");
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db, "messages"), {
        ...formData,
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      alert("حدث خطأ أثناء الإرسال، حاول مرة أخرى.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] animate-in fade-in duration-700" dir="rtl">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white pt-12 pb-24 px-6 rounded-b-[4rem] relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-orange-600/10 blur-[100px] -translate-y-1/2"></div>
        <div className="relative z-10 space-y-4">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-white/5">
            <Sparkles className="text-[#FF4500]" size={32} />
          </div>
          <p className="text-[#FF4500] font-black text-[10px] uppercase tracking-widest">نحن هنا للمساعدة</p>
          <h1 className="text-4xl font-black tracking-tighter italic">تواصل معنا</h1>
          <p className="text-gray-400 text-xs font-bold max-w-xs mx-auto leading-relaxed">
            لدينا فريق دعم متميز جاهز للإجابة على استفساراتك. لا تتردد في مراسلتنا أو زيارتنا في مقرنا.
          </p>
        </div>
      </section>

      <div className="px-6 -mt-16 space-y-8">
        {/* Contact Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ContactCard 
            icon={<Phone size={22}/>} 
            title="اتصل بنا" 
            label="متاحين من 9 صباحاً حتى 10 مساءً" 
            value="+967 772 728 311"
            subValue="واتساب: 967772728311"
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
          <ContactCard 
            icon={<MapPin size={22}/>} 
            title="تفضل بزيارتنا" 
            label="مكتبنا الرئيسي" 
            value="صنعاء، اليمن - شارع حدة"
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <ContactCard 
            icon={<Mail size={22}/>} 
            title="راسلنا" 
            label="سنرد عليك في أقرب وقت" 
            value="stylero.online@gmail.com"
            color="text-emerald-600"
            bgColor="bg-emerald-50"
          />
        </div>

        {/* Form Section */}
        <section className="bg-white p-8 md:p-12 rounded-[3.5rem] border border-gray-50 shadow-xl shadow-gray-100/50 space-y-8 mb-12">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg"><MessageSquare size={24}/></div>
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tighter">أرسل رسالة</h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase">سيكون من الرائع سماع صوتك</p>
            </div>
          </div>

          {success ? (
            <div className="bg-green-50 p-10 rounded-[2.5rem] text-center space-y-4 border border-green-100">
              <CheckCircle className="mx-auto text-green-500" size={50} />
              <h3 className="text-xl font-black text-slate-800">تم الإرسال بنجاح</h3>
              <p className="text-xs text-green-600 font-bold">شكراً لتواصلك معنا، سنقوم بالرد عليك قريباً جداً.</p>
              <button onClick={() => setSuccess(false)} className="text-[10px] font-black uppercase text-gray-400 hover:text-slate-800 underline underline-offset-4">إرسال رسالة أخرى</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 mr-2 uppercase">الاسم الكامل *</label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="w-full bg-gray-50 pr-12 pl-4 py-4 rounded-2xl border-none outline-none font-bold text-xs focus:ring-1 ring-orange-500/20" 
                      placeholder="محمد أحمد" 
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 mr-2 uppercase">البريد الإلكتروني</label>
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                      type="email" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                      className="w-full bg-gray-50 pr-12 pl-4 py-4 rounded-2xl border-none outline-none font-bold text-xs focus:ring-1 ring-orange-500/20" 
                      placeholder="name@example.com" 
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 mr-2 uppercase">الموضوع</label>
                <div className="relative">
                  <HelpCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    value={formData.subject} 
                    onChange={e => setFormData({...formData, subject: e.target.value})} 
                    className="w-full bg-gray-50 pr-12 pl-4 py-4 rounded-2xl border-none outline-none font-bold text-xs focus:ring-1 ring-orange-500/20" 
                    placeholder="استفسار عن طلب، اقتراح..." 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 mr-2 uppercase">الرسالة *</label>
                <textarea 
                  value={formData.message} 
                  onChange={e => setFormData({...formData, message: e.target.value})} 
                  className="w-full bg-gray-50 p-5 rounded-[2rem] border-none outline-none font-bold text-xs focus:ring-1 ring-orange-500/20 min-h-[150px]" 
                  placeholder="كيف يمكننا مساعدتك؟" 
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={sending}
                className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-sm flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
              >
                {sending ? <RefreshCw className="animate-spin" size={20}/> : <><Send className="rotate-180" size={20}/> إرسال الرسالة</>}
              </button>
            </form>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
};

const ContactCard = ({ icon, title, label, value, subValue, color, bgColor }: any) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col items-center text-center gap-4 transition-all hover:scale-[1.02]">
    <div className={`w-14 h-14 ${bgColor} ${color} rounded-2xl flex items-center justify-center shadow-sm`}>{icon}</div>
    <div className="space-y-1">
      <h3 className="font-black text-sm text-slate-800">{title}</h3>
      <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{label}</p>
    </div>
    <div className="space-y-0.5 pt-2 border-t border-gray-50 w-full">
      <p className="text-xs font-black text-slate-600 tracking-tighter">{value}</p>
      {subValue && <p className="text-[10px] font-black text-orange-600">{subValue}</p>}
    </div>
  </div>
);

export default ContactView;
