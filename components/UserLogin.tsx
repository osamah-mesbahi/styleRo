import React, { useState } from 'react';
import { Button } from './Button';
import { User, Mail, Lock, Phone, MapPin, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { User as UserType } from '../types';
import { fetchJson } from '../src/api';

interface UserLoginProps {
  onLogin: (user: UserType) => void;
  onCancel: () => void;
  onAdminLoginRequest: () => void;
  language: 'en' | 'ar';
}

export const UserLogin: React.FC<UserLoginProps> = ({ onLogin, onCancel, onAdminLoginRequest, language }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');

  const t = {
    en: {
      join: 'Join Stylero',
      welcome: 'Welcome Back',
      joinDesc: 'Create an account to track orders & more.',
      welcomeDesc: 'Sign in to access your account.',
      name: 'Full Name',
      email: 'Email Address',
      password: 'Password',
      phone: 'Phone Number',
      address: 'Delivery Address (City, Street)',
      register: 'Create Account',
      signIn: 'Sign In',
      google: 'Continue with Google',
      already: 'Already have an account? Sign In',
      dontHave: "Don't have an account? Register",
      guest: 'Continue as Guest',
      admin: 'Store Manager Access',
      errorFill: 'Please fill in all required fields.',
      errorWeak: 'Password must be at least 6 characters.',
      errorExists: 'Email already in use.',
      errorInvalid: 'Invalid email or password.',
      errorDomain: "Domain not authorized in Firebase Console.",
      errorCancelled: "Sign-in cancelled."
    },
    ar: {
      join: 'انضم إلينا',
      welcome: 'مرحباً بعودتك',
      joinDesc: 'أنشئ حساباً لمتابعة طلباتك والمزيد.',
      welcomeDesc: 'سجل الدخول للوصول إلى حسابك.',
      name: 'الاسم الكامل',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      phone: 'رقم الهاتف',
      address: 'عنوان التوصيل (المدينة، الشارع)',
      register: 'إنشاء حساب',
      signIn: 'تسجيل الدخول',
      google: 'المتابعة عبر جوجل',
      already: 'لديك حساب بالفعل؟ تسجيل الدخول',
      dontHave: "ليس لديك حساب؟ سجل الآن",
      guest: 'المتابعة كزائر',
      admin: 'دخول مدراء المتجر',
      errorFill: 'يرجى ملء جميع الحقول المطلوبة.',
      errorWeak: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.',
      errorExists: 'البريد الإلكتروني مستخدم بالفعل.',
      errorInvalid: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
      errorDomain: "النطاق غير مصرح به في إعدادات Firebase.",
      errorCancelled: "تم إلغاء العملية."
    }
  };

  const txt = t[language];
  const isRtl = language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegistering) {
        if (!formData.name || !formData.password || !formData.phone || !formData.address) {
          setError(txt.errorFill);
          setIsLoading(false);
          return;
        }

        const res = await fetchJson('/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email || undefined,
            phone: formData.phone,
            password: formData.password
          })
        });

        if (res?.error) throw new Error(res.error);

        const newUser: UserType = {
          id: String(res.user?.id || ''),
          name: res.user?.name || formData.name,
          email: res.user?.email || formData.email || '',
          phone: res.user?.phone || formData.phone,
          address: formData.address
        };

        if (res?.token) localStorage.setItem('stylero_token', res.token);
        localStorage.setItem('stylero_user', JSON.stringify(newUser));
        localStorage.setItem('stylero_is_admin', res.user?.isAdmin ? '1' : '0');
        onLogin(newUser);
      } else {
        const identifier = formData.email || formData.phone;
        if (!identifier || !formData.password) {
          setError(txt.errorFill);
          setIsLoading(false);
          return;
        }
        const isEmail = identifier.includes('@');
        const res = await fetchJson('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: isEmail ? identifier : undefined,
            phone: !isEmail ? identifier : undefined,
            password: formData.password
          })
        });

        if (res?.error) throw new Error(res.error);

        const loggedIn: UserType = {
          id: String(res.user?.id || ''),
          name: res.user?.name || formData.name || 'User',
          email: res.user?.email || (isEmail ? identifier : ''),
          phone: res.user?.phone || (!isEmail ? identifier : ''),
          address: formData.address
        };

        if (res?.token) localStorage.setItem('stylero_token', res.token);
        localStorage.setItem('stylero_user', JSON.stringify(loggedIn));
        localStorage.setItem('stylero_is_admin', res.user?.isAdmin ? '1' : '0');
        onLogin(loggedIn);
      }
    } catch (err: any) {
      console.error('Auth Error:', err.message || err);
      if (String(err.message || '').includes('exists')) setError(txt.errorExists);
      else if (String(err.message || '').includes('weak')) setError(txt.errorWeak);
      else setError(txt.errorInvalid);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden relative">
        <div className="bg-brand-black p-8 text-center text-white">
          <h2 className="text-3xl font-serif font-bold tracking-wide mb-2">
            {isRegistering ? txt.join : txt.welcome}
          </h2>
          <p className="text-white/70 text-sm">
            {isRegistering ? txt.joinDesc : txt.welcomeDesc}
          </p>
        </div>

        <div className="p-8 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-lg text-center animate-shake">
                {error}
              </div>
            )}

            {isRegistering && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase mx-1">{txt.name}</label>
                <div className="relative">
                  <User size={18} className={`absolute top-3.5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-black outline-none transition-all text-sm ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase mx-1">{txt.email}</label>
              <div className="relative">
                <Mail size={18} className={`absolute top-3.5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-black outline-none transition-all text-sm ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase mx-1">{txt.password}</label>
              <div className="relative">
                <Lock size={18} className={`absolute top-3.5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-black outline-none transition-all text-sm ${isRtl ? 'pr-12 pl-12' : 'pl-12 pr-12'}`}
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

            {isRegistering && (
              <>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase mx-1">{txt.phone}</label>
                  <div className="relative">
                    <Phone size={18} className={`absolute top-3.5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-black outline-none transition-all text-sm ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                      placeholder="+967..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase mx-1">{txt.address}</label>
                  <div className="relative">
                    <MapPin size={18} className={`absolute top-3.5 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className={`w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-black outline-none transition-all text-sm ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                    />
                  </div>
                </div>
              </>
            )}

            <Button fullWidth size="lg" type="submit" disabled={isLoading} className="rounded-xl py-4 mt-4">
              {isLoading ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                 isRegistering ? txt.register : txt.signIn
              )}
            </Button>
          </form>
          
          <div className="mt-6 flex flex-col items-center gap-4">
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              className="text-sm text-gray-600 hover:text-black font-medium"
            >
              {isRegistering ? txt.already : txt.dontHave}
            </button>
            
            <button 
              onClick={onCancel}
              className="text-gray-400 hover:text-brand-black text-xs font-medium flex items-center gap-2 transition-colors group"
            >
              <ArrowLeft size={14} className={`transition-transform ${isRtl ? 'rotate-180 group-hover:translate-x-1' : 'group-hover:-translate-x-1'}`} />
              {txt.guest}
            </button>
          </div>
        </div>
        
        <div className="bg-gray-50 border-t border-gray-100 p-4 text-center">
            <button 
              onClick={onAdminLoginRequest}
              className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-brand-black transition-colors mx-auto"
            >
                <ShieldCheck size={14} />
                {txt.admin}
            </button>
        </div>
      </div>
    </div>
  );
};