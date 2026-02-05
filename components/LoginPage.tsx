
import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Lock, Mail, ArrowRight, LogIn, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

const ADMIN_EMAIL = 'osamah.mesbahi@gmail.com';
const ADMIN_PASS = '366399Ro';

const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      setTimeout(() => {
        onSuccess();
        setLoading(false);
      }, 800);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onSuccess();
    } catch (error: any) {
      alert("عذراً، بيانات الدخول غير صحيحة.");
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user.email === ADMIN_EMAIL) {
        onSuccess();
      } else {
        alert("هذا الحساب لا يمتلك صلاحيات الدخول.");
        auth.signOut();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col items-center justify-center p-6 font-sans relative" dir="rtl">
      {/* زر الرجوع */}
      <button 
        onClick={onBack}
        className="absolute top-8 right-8 p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-slate-800 hover:bg-gray-50 transition-all active:scale-90 z-10"
      >
        <ArrowRight size={20} />
      </button>

      {/* الجزء العلوي - الأيقونة والعنوان */}
      <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="w-16 h-16 bg-pink-50 rounded-[1.5rem] flex items-center justify-center text-pink-500 mb-6 shadow-sm">
           <LogIn size={28} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">تسجيل الدخول</h1>
        <p className="text-gray-400 text-sm font-bold">أهلاً بك مجدداً في متجر StyleRo</p>
      </div>

      {/* بطاقة تسجيل الدخول */}
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl shadow-gray-100/50 p-8 md:p-10 border border-gray-50 animate-in zoom-in duration-500">
        
        {/* زر جوجل */}
        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-100 py-4 rounded-2xl hover:bg-gray-50 transition-all font-bold text-xs text-slate-600 mb-8"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-5 h-5" alt="google" />
          تسجيل الدخول عبر Google
        </button>

        {/* فاصل */}
        <div className="relative mb-8 text-center">
          <hr className="border-gray-50" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] text-gray-400 font-bold">أو باستخدام البريد</span>
        </div>

        {/* النموذج */}
        <form onSubmit={handleEmailLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-500 mr-2">البريد الإلكتروني</label>
            <div className="relative">
              <input 
                type="email" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-4 pl-12 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:border-pink-500 text-xs font-bold transition-all text-left"
                required
                dir="ltr"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-gray-500 mr-2">كلمة المرور</label>
            <div className="relative">
              <input 
                type="password" 
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-4 pl-12 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:border-pink-500 text-xs font-bold transition-all text-left"
                required
                dir="ltr"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#121926] text-white py-5 rounded-[1.2rem] font-black shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center mt-4"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'دخول'}
          </button>
        </form>

        {/* فاصل أسفل */}
        <div className="relative my-8 text-center">
          <hr className="border-gray-50" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[10px] text-gray-400 font-bold">ليس لديك حساب؟</span>
        </div>

        {/* زر إنشاء حساب */}
        <button className="w-full bg-white border border-gray-200 text-slate-800 py-4 rounded-2xl font-black text-xs hover:bg-gray-50 transition-all">
          إنشاء حساب جديد
        </button>

      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-green-500 opacity-60">
        <ShieldCheck size={14} />
        <span className="text-[9px] font-black tracking-widest uppercase">تشفير آمن 100%</span>
      </div>
    </div>
  );
};

export default LoginPage;
