import React, { useState } from 'react';
import { Button } from './Button';
import { Lock, ArrowLeft, User as UserIcon, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/firebase';
import { getUserProfile } from '../services/firestoreService';

interface AdminLoginProps {
  onLogin: () => void;
  onCancel: () => void;
  language: 'en' | 'ar';
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onCancel, language }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const t = {
    en: {
      title: "Stylero",
      panel: "Admin Control Panel",
      createTitle: "Create Admin Account",
      email: "Username",
      password: "Password",
      loginBtn: "Login to Dashboard",
      createBtn: "Create Account",
      haveAccount: "Already have an account? Login",
      newAccount: "First time? Create Admin Account",
      back: "Back to Store",
      secure: "© 2024 Stylero Inc. Secure System.",
      errors: {
        authFailed: "Authentication failed.",
        invalid: "Invalid email or password.",
        exists: "Email is already registered. Please login.",
        weak: "Password should be at least 6 characters.",
        network: "Network error. Check your connection.",
        configNotFound: "Auth service not initialized. Please enable Email/Password in Firebase Console."
      }
    },
    ar: {
      title: "ستايلرو",
      panel: "لوحة تحكم الإدارة",
      createTitle: "إنشاء حساب مسؤول",
      email: "اسم المستخدم",
      password: "كلمة المرور",
      loginBtn: "دخول للوحة التحكم",
      createBtn: "إنشاء الحساب",
      haveAccount: "لديك حساب بالفعل؟ تسجيل الدخول",
      newAccount: "أول مرة؟ إنشاء حساب مسؤول",
      back: "العودة للمتجر",
      secure: "© 2024 ستايلرو. نظام آمن.",
      errors: {
        authFailed: "فشلت المصادقة.",
        invalid: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
        exists: "البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.",
        weak: "يجب أن تكون كلمة المرور 6 أحرف على الأقل.",
        network: "خطأ في الشبكة. تحقق من الاتصال.",
        configNotFound: "خدمة المصادقة غير مفعلة. يرجى تفعيل البريد وكلمة المرور في Firebase."
      }
    }
  };

  const txt = t[language];
  const isRtl = language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get Firestore profile
      const profile = await getUserProfile(firebaseUser.uid);

      // Check if user is admin
      if (!profile?.isAdmin) {
        setError(txt.errors.authFailed);
        setLoading(false);
        return;
      }

      // Store admin session
      localStorage.setItem('stylero_user', JSON.stringify({
        id: firebaseUser.uid,
        name: profile.name || 'Admin',
        email: firebaseUser.email,
        isAdmin: true
      }));
      localStorage.setItem('stylero_is_admin', '1');
      
      onLogin();
    } catch (err: any) {
      console.error('Admin login error:', err.message || err);
      const msg = String(err?.message || '').toLowerCase();
      if (msg.includes('network') || msg.includes('failed to fetch')) setError(txt.errors.network);
      else if (msg.includes('user-not-found') || msg.includes('wrong-password')) setError(txt.errors.invalid);
      else setError(txt.errors.authFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-brand-black p-8 text-center">
          <h2 className="text-3xl font-serif text-white font-bold tracking-wide">{txt.title}</h2>
          <p className="text-gray-400 text-sm mt-2 uppercase tracking-widest">
            {txt.panel}
          </p>
        </div>

        <div className="p-10">
          <div className="flex justify-center -mt-16 mb-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-gray-50">
              <Lock size={28} className="text-brand-black" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-lg flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase mx-1">{txt.email}</label>
              <div className="relative">
                <UserIcon size={18} className={`absolute top-3.5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-black focus:border-transparent outline-none transition-all text-sm font-medium ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase mx-1">{txt.password}</label>
              <div className="relative">
                <Lock size={18} className={`absolute top-3.5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-black focus:border-transparent outline-none transition-all text-sm font-medium ${isRtl ? 'pr-12 pl-12' : 'pl-12 pr-12'}`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className={`absolute top-2.5 ${isRtl ? 'left-3' : 'right-3'} p-2 text-gray-400 hover:text-gray-600`}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button 
              fullWidth 
              size="lg" 
              type="submit" 
              disabled={loading}
              className="rounded-xl py-4 text-sm uppercase tracking-wider font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                txt.loginBtn
              )}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-center">
            <button 
              onClick={onCancel}
              className="text-gray-400 hover:text-brand-black text-xs font-medium flex items-center justify-center gap-2 transition-colors mx-auto group"
            >
              {isRtl ? <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /> : <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />}
              {txt.back}
            </button>
          </div>
        </div>
      </div>
      <p className="mt-8 text-gray-400 text-xs">{txt.secure}</p>
    </div>
  );
};