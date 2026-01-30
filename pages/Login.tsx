
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Eye, EyeOff, Lock, User, LogIn, AlertCircle, ShieldCheck, 
  Loader2, Package, Clock, CheckCircle2, MapPin, LogOut, 
  ShoppingBag, Phone, ChevronDown, UserPlus,
  Search, MessageCircle, ExternalLink, HelpCircle
} from 'lucide-react';
import { ADMIN_USERNAME, ADMIN_PASSWORD, SAR_TO_YER_RATE, YEMEN_GOVERNORATES, PHONE as SUPPORT_PHONE } from '../constants';
import { firebaseRegisterWithPhone, firebaseLoginWithPhone, firebaseSignOut, sendSmsCode, verifySmsCode } from '../src/firebase';
import { Order, OrderStatus, Currency } from '../types';

interface LoginProps {
  setUser: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ setUser }) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Register Form States
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirmPass, setRegConfirmPass] = useState('');
  const [regLocation, setRegLocation] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  // SMS auth states
  const [smsSent, setSmsSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('stylero_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setLoggedInUser(user);
      loadUserOrders(user);
    }
  }, []);

  const loadUserOrders = (user: any) => {
    const allOrders: Order[] = JSON.parse(localStorage.getItem('stylero_orders') || '[]');
    // التصفية بناءً على رقم الهاتف لضمان دقة الطلبات الخاصة بالمستخدم
    const filtered = allOrders.filter(o => 
      o.phoneNumber === user.phone || 
      (o.customerName === user.name && o.phoneNumber === user.phone)
    );
    setUserOrders(filtered);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // try backend auth for admin
      const resp = await fetch('/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      if (resp.ok) {
        const data = await resp.json();
        const user = { username: username.trim(), isAdmin: true, name: 'إدارة المتجر', phone: username.trim() };
        localStorage.setItem('stylero_user', JSON.stringify(user));
        localStorage.setItem('stylero_token', data.token);
        setUser(user);
        navigate('/admin');
        return;
      }
    } catch (e) { }

    // try firebase auth (phone mapped to internal email)
    try {
      const fbUser = await firebaseLoginWithPhone(username, password);
      const user = { name: fbUser.displayName || fbUser.phoneNumber || fbUser.email || username, phone: username, uid: fbUser.uid };
      localStorage.setItem('stylero_user', JSON.stringify(user));
      setUser(user);
      setLoggedInUser(user);
      loadUserOrders(user);
      return;
    } catch (fbErr) {
      // ignore and fallback to local storage
    }

    // fallback to local storage
    const users = JSON.parse(localStorage.getItem('stylero_registered_users') || '[]');
    const found = users.find((u: any) => u.phone === username && u.password === password);
    if (found) {
      localStorage.setItem('stylero_user', JSON.stringify(found));
      setUser(found);
      setLoggedInUser(found);
      loadUserOrders(found);
    } else {
      setError('بيانات الدخول غير صحيحة');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (regPass !== regConfirmPass) {
      setError('كلمة المرور غير متطابقة');
      setLoading(false);
      return;
    }

    if (!regName.trim() || !regPhone.trim() || !regPass.trim() || !regLocation.trim()) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      setLoading(false);
      return;
    }

    try {
      // Try to register user in Firebase (phone mapped to internal email)
      const fbUser = await firebaseRegisterWithPhone(regPhone, regPass);
      const created = { name: regName, phone: regPhone, uid: fbUser.uid, location: regLocation, isAdmin: false, createdAt: new Date().toISOString() };
      const users = JSON.parse(localStorage.getItem('stylero_registered_users') || '[]');
      users.push({ ...created, password: regPass });
      localStorage.setItem('stylero_registered_users', JSON.stringify(users));
      localStorage.setItem('stylero_user', JSON.stringify(created));
      setUser(created);
      setLoggedInUser(created);
      setMode('login');
      setLoading(false);
      return;
    } catch (fbErr) {
      // fallback to local registration
      const users = JSON.parse(localStorage.getItem('stylero_registered_users') || '[]');
      if (users.find((u: any) => u.phone === regPhone)) {
        setError('هذا الرقم مسجل مسبقاً!');
        setLoading(false);
        return;
      }
      const newUser = {
        name: regName,
        phone: regPhone,
        password: regPass,
        location: regLocation,
        isAdmin: false,
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem('stylero_registered_users', JSON.stringify(users));
      localStorage.setItem('stylero_user', JSON.stringify(newUser));
      setUser(newUser);
      setLoggedInUser(newUser);
      setMode('login');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('stylero_user');
    setLoggedInUser(null);
    setUser(null);
    navigate('/');
  };

  // SMS auth helpers
  const handleSendSms = async () => {
    setError('');
    if (!username) { setError('أدخل رقم الهاتف لإرسال الرمز'); return; }
    setLoading(true);
    try {
      const phone = username.startsWith('+') ? username : (username.length === 9 ? `+967${username}` : username);
      await sendSmsCode(phone);
      setSmsSent(true);
    } catch (err: any) {
      setError(err?.message || 'فشل إرسال الرمز');
    } finally { setLoading(false); }
  };

  const handleVerifySms = async () => {
    setError('');
    if (!verificationCode) { setError('أدخل رمز التحقق'); return; }
    setLoading(true);
    try {
      const fbUser: any = await verifySmsCode(verificationCode);
      const user = { name: fbUser.displayName || fbUser.phoneNumber || fbUser.email || username, phone: username, uid: fbUser.uid };
      localStorage.setItem('stylero_user', JSON.stringify(user));
      setUser(user);
      setLoggedInUser(user);
      loadUserOrders(user);
      setSmsSent(false);
      setVerificationCode('');
    } catch (err: any) {
      setError(err?.message || 'فشل التحقق');
    } finally { setLoading(false); }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'text-amber-600 bg-amber-50 border-amber-100';
      case OrderStatus.PAID: return 'text-blue-600 bg-blue-50 border-blue-100';
      case OrderStatus.PROCESSING: return 'text-purple-600 bg-purple-50 border-purple-100';
      case OrderStatus.SHIPPED: return 'text-pink-600 bg-pink-50 border-pink-100';
      case OrderStatus.COMPLETED: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getStatusProgress = (status: OrderStatus) => {
    const stages = [OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.COMPLETED];
    const index = stages.indexOf(status);
    return ((index + 1) / stages.length) * 100;
  };

  if (loggedInUser) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-right animate-zoom-in" dir="rtl">
        {/* User Profile Summary Card */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-10">
          <div className="bg-gray-50/50 p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-gray-100">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-black text-white rounded-3xl flex items-center justify-center shadow-lg transform -rotate-3">
                <User size={36} strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-gray-900">{loggedInUser.name}</h2>
                <div className="flex flex-wrap items-center gap-4">
                   <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px]"><Phone size={12} className="text-primary" />{loggedInUser.phone}</div>
                   <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px]"><MapPin size={12} className="text-primary" />{loggedInUser.location}</div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleLogout} className="px-6 py-2.5 bg-white text-red-500 hover:bg-red-50 rounded-2xl transition-all text-[10px] font-extrabold border border-red-100 flex items-center gap-2">
                 تسجيل الخروج <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Order History Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900">طلباتي</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Order History & Status</p>
            </div>
            <div className="bg-white px-5 py-2 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
               <span className="text-[10px] font-extrabold text-gray-400">إجمالي الطلبات:</span>
               <span className="text-sm font-extrabold text-primary">{userOrders.length}</span>
            </div>
          </div>

          {userOrders.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {userOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-[2.2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                  {/* Order Main Header */}
                  <div 
                    className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 cursor-pointer"
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  >
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                         <Package size={28} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                           <span className="font-extrabold text-lg text-gray-900">طلب #{order.id}</span>
                           <span className={`px-4 py-1 rounded-full text-[9px] font-extrabold border uppercase ${getStatusColor(order.status)}`}>
                             {order.status}
                           </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1.5 uppercase tracking-tighter">
                          <Clock size={12} /> {new Date(order.createdAt).toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-10 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0">
                      <div className="text-right">
                         <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">المبلغ الإجمالي</p>
                         <p className="font-extrabold text-xl text-black">{Math.round(order.totalSAR)} <span className="text-xs font-bold text-gray-400">SAR</span></p>
                      </div>
                      <div className={`p-2 rounded-full bg-gray-50 transition-transform ${expandedOrderId === order.id ? 'rotate-180 bg-primary/10 text-primary' : 'text-gray-300'}`}>
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Order Details */}
                  {expandedOrderId === order.id && (
                    <div className="px-6 md:px-8 pb-8 animate-zoom-in space-y-8">
                      {/* Order Status Tracker Bar */}
                      <div className="bg-gray-50 rounded-3xl p-6 md:p-8">
                         <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-6">تتبع حالة التنفيذ</h4>
                         <div className="relative h-2 bg-gray-200 rounded-full mb-8">
                            <div 
                              className="absolute top-0 right-0 h-full bg-primary rounded-full transition-all duration-1000 shadow-sm"
                              style={{ width: `${getStatusProgress(order.status)}%` }}
                            ></div>
                            <div className="absolute inset-0 flex justify-between items-center -top-4">
                               {[0, 1, 2, 3, 4].map((i) => (
                                 <div key={i} className={`w-3 h-3 rounded-full border-2 border-white ${getStatusProgress(order.status) >= ((i+1)/5)*100 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                               ))}
                            </div>
                         </div>
                         <div className="flex justify-between items-center text-[9px] font-extrabold text-gray-400 uppercase tracking-tighter">
                            <span>بانتظار المراجعة</span>
                            <span>تم الدفع</span>
                            <span>جاري التنفيذ</span>
                            <span>تم الشحن</span>
                            <span>تم التسليم</span>
                         </div>
                      </div>

                      {/* Items List */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-2">محتويات طلبك</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-gray-100 hover:border-primary/20 transition-all">
                              <div className="w-16 h-20 rounded-2xl overflow-hidden shrink-0 bg-gray-50">
                                <img src={item.image || 'https://via.placeholder.com/200'} className="w-full h-full object-cover" alt={item.name} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-extrabold text-[11px] text-gray-900 line-clamp-1">{item.name}</h5>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {item.size && <span className="text-[8px] font-extrabold bg-gray-50 text-gray-500 px-2 py-1 rounded-md">المقاس: {item.size}</span>}
                                  {item.volume && <span className="text-[8px] font-extrabold bg-gray-50 text-gray-500 px-2 py-1 rounded-md">الحجم: {item.volume}</span>}
                                  {item.color && <span className="text-[8px] font-extrabold bg-gray-50 text-gray-500 px-2 py-1 rounded-md">اللون: {item.color}</span>}
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                  <span className="text-[10px] font-extrabold text-primary">{Math.round(item.priceSAR)} SAR</span>
                                  <span className="text-[10px] font-bold text-gray-400">الكمية: {item.quantity}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary & Actions */}
                      <div className="flex flex-col md:flex-row gap-6 items-stretch">
                         <div className="flex-1 bg-black text-white p-6 rounded-[2rem] flex flex-col justify-between gap-4">
                            <div>
                               <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">المبلغ الإجمالي باليمني</p>
                               <p className="text-2xl font-extrabold">{(order.totalSAR * SAR_TO_YER_RATE).toLocaleString()} <span className="text-xs">YER</span></p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-extrabold text-primary bg-primary/10 px-4 py-2 rounded-xl w-fit">
                               <CheckCircle2 size={14} /> تم حساب سعر الصرف (1 SAR = {SAR_TO_YER_RATE} YER)
                            </div>
                         </div>
                         <div className="flex-1 grid grid-cols-2 gap-4">
                            <Link 
                              to="/tracking" 
                              className="flex flex-col items-center justify-center gap-3 bg-gray-50 rounded-[2rem] hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-gray-100 group"
                            >
                               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-primary shadow-sm"><Search size={24}/></div>
                               <span className="text-[10px] font-extrabold text-gray-800">تتبع الشحنة</span>
                            </Link>
                            <a 
                              href={`https://wa.me/967${SUPPORT_PHONE}?text=${encodeURIComponent(`استفسار بخصوص الطلب رقم #${order.id}`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex flex-col items-center justify-center gap-3 bg-gray-50 rounded-[2rem] hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-gray-100 group"
                            >
                               <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-green-500 shadow-sm"><HelpCircle size={24}/></div>
                               <span className="text-[10px] font-extrabold text-gray-800">طلب مساعدة</span>
                            </a>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[3rem] border border-dashed border-gray-200 py-24 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
                <ShoppingBag size={48} />
              </div>
              <h4 className="text-lg font-extrabold text-gray-800">لا توجد طلبات سابقة</h4>
              <p className="text-gray-400 text-[10px] font-bold mt-2">ابدأي رحلة تسوقكِ الآن من متجرنا المحلي أو المواقع العالمية</p>
              <Link to="/shop" className="inline-block bg-black text-white px-10 py-3.5 rounded-full font-extrabold text-sm mt-8 shadow-xl hover:bg-primary transition-all active:scale-95">تسوقي الآن</Link>
            </div>
          )}
        </div>

        {/* Support Section */}
        <div className="mt-16 bg-pink-50/50 rounded-[3rem] border border-pink-100 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-6 text-center md:text-right">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-primary shadow-sm">
                 <MessageCircle size={32} />
              </div>
              <div>
                 <h4 className="text-lg font-extrabold text-gray-900">هل تحتاجين مساعدة في طلباتك؟</h4>
                 <p className="text-[10px] text-gray-500 font-bold mt-1 leading-relaxed">فريق خدمة عملاء Style Ro متواجد لمساعدتكِ في أي وقت عبر الواتساب.</p>
              </div>
           </div>
           <a 
             href={`https://wa.me/967${SUPPORT_PHONE}`}
             target="_blank"
             rel="noreferrer"
             className="bg-black text-white px-10 py-4 rounded-2xl font-extrabold text-sm hover:bg-primary transition-all shadow-xl shadow-pink-100 flex items-center gap-3"
           >
              تحدثي معنا <ExternalLink size={18} />
           </a>
        </div>
      </div>
    );
  }

  // Login View Template (بقي كما هو لكن مع تحسينات طفيفة في التنسيق)
  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 relative overflow-hidden py-12">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10"></div>
      
      <div className="nice-card bg-white/90 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] shadow-2xl border border-white max-w-md w-full animate-zoom-in">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-black rounded-3xl text-white flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3">
            {mode === 'login' ? <ShieldCheck size={32} className="text-primary" /> : <UserPlus size={32} className="text-primary" />}
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {mode === 'login' ? 'مرحباً بكِ مجدداً' : 'انضمي لعالم الجمال'}
          </h2>
          <p className="text-gray-400 text-[9px] font-bold mt-2 uppercase tracking-widest opacity-60">
            {mode === 'login' ? 'Login to StyleRo' : 'Create your account now'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-[10px] font-extrabold flex items-center gap-3 border border-red-100 mb-6 animate-shake">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-gray-400 pr-2">رقم الهاتف أو الاسم</label>
              <div className="relative group">
                <input type="text" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-6 pr-12 focus:border-primary/20 focus:bg-white transition-all outline-none font-extrabold text-xs" placeholder="77XXXXXXX" value={username} onChange={(e) => setUsername(e.target.value)} />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-gray-400 pr-2">كلمة المرور</label>
              <div className="relative group">
                <input type={showPassword ? "text" : "password"} className="w-full bg-gray-50 border-2 border-transparent rounded-2xl py-4 px-6 pr-12 focus:border-primary/20 focus:bg-white transition-all outline-none font-extrabold text-xs" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div id="recaptcha-container"></div>
              {!smsSent ? (
                <button type="button" onClick={handleSendSms} className="w-full bg-green-600 text-white py-3 rounded-xl font-extrabold hover:opacity-90 transition">دخول برمز SMS</button>
              ) : (
                <div className="space-y-2">
                  <input type="text" placeholder="رمز التحقق" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} className="w-full bg-gray-50 border-2 border-transparent rounded-xl py-3 px-4 font-extrabold text-[11px] outline-none" />
                  <div className="flex gap-2">
                    <button type="button" onClick={handleVerifySms} className="flex-1 bg-primary text-white py-3 rounded-xl font-extrabold">تحقق</button>
                    <button type="button" onClick={() => { setSmsSent(false); setVerificationCode(''); }} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl">إعادة إرسال</button>
                  </div>
                </div>
              )}
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-4.5 rounded-[1.8rem] font-extrabold text-sm shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 mt-4">
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><LogIn size={20} /> دخول للحساب</>}
            </button>
            <div className="text-center mt-8">
              <p className="text-gray-400 text-[10px] font-bold">ليس لديكِ حساب؟ <button type="button" onClick={() => setMode('register')} className="text-primary font-extrabold hover:underline">سجلي الآن</button></p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-gray-400 pr-2">الاسم الكريم</label>
              <input type="text" className="w-full bg-gray-50 border-2 border-transparent rounded-xl py-3.5 px-6 font-extrabold text-[11px] outline-none" placeholder="الاسم الكامل..." value={regName} onChange={(e) => setRegName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-gray-400 pr-2">الرقم</label>
              <input type="tel" className="w-full bg-gray-50 border-2 border-transparent rounded-xl py-3.5 px-6 font-extrabold text-[11px] outline-none" placeholder="77XXXXXXX" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-gray-400 pr-2">كلمة المرور</label>
                <input type="password" className="w-full bg-gray-50 border-2 border-transparent rounded-xl py-3.5 px-4 font-extrabold text-[11px] outline-none" value={regPass} onChange={(e) => setRegPass(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold text-gray-400 pr-2">تأكيد كلمة المرور</label>
                <input type="password" className="w-full bg-gray-50 border-2 border-transparent rounded-xl py-3.5 px-4 font-extrabold text-[11px] outline-none" value={regConfirmPass} onChange={(e) => setRegConfirmPass(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-extrabold text-gray-400 pr-2">المكان (المحافظة)</label>
              <select className="w-full bg-gray-50 border-2 border-transparent rounded-xl py-3.5 px-6 font-extrabold text-[11px] outline-none" value={regLocation} onChange={(e) => setRegLocation(e.target.value)}>
                <option value="">اختر المكان...</option>
                {YEMEN_GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} className="w-full btn-primary py-4.5 rounded-[1.8rem] font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4">
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'إنشاء الحساب الآن'}
            </button>
            <div className="text-center mt-6">
              <p className="text-gray-400 text-[10px] font-bold">لديكِ حساب بالفعل؟ <button type="button" onClick={() => setMode('login')} className="text-black font-extrabold hover:underline">دخول</button></p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;

