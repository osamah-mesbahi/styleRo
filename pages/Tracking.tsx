
import React, { useState } from 'react';
// Added MessageCircle to the imports
import { Search, Package, MapPin, Clock, CheckCircle2, Loader2, AlertCircle, MessageCircle } from 'lucide-react';
import { OrderStatus } from '../types';

const Tracking: React.FC = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotFound(false);
    setOrder(null);

    // محاكاة الاتصال بـ API
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (trackingCode.length < 4) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    const mockOrder = {
      id: trackingCode.toUpperCase(),
      customer: 'عميل Style Ro المميز',
      status: OrderStatus.PROCESSING,
      items: [
        { name: 'منتج من المتجر العالمي', quantity: 1, price: 150 },
        { name: 'عطر فرنسي فاخر', quantity: 1, price: 320 }
      ],
      total: 470,
      createdAt: new Date().toISOString()
    };
    
    setOrder(mockOrder);
    setIsLoading(false);
  };

  const steps = [
    { status: OrderStatus.PENDING, label: 'قيد المراجعة', icon: Clock },
    { status: OrderStatus.PAID, label: 'تم تأكيد الدفع', icon: CheckCircle2 },
    { status: OrderStatus.PROCESSING, label: 'قيد التنفيذ', icon: Package },
    { status: OrderStatus.SHIPPED, label: 'تم الشحن', icon: MapPin },
    { status: OrderStatus.COMPLETED, label: 'مكتمل', icon: CheckCircle2 }
  ];

  const getStatusIndex = (status: OrderStatus) => {
    return steps.findIndex(s => s.status === status);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-24 mt-8 animate-fade-in">
      <div className="nice-card bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-black to-pink-600 p-12 text-white text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-pink-300" />
          </div>
          <h2 className="text-3xl font-extrabold mb-2">أين طلبك الآن؟</h2>
          <p className="text-pink-100 font-bold opacity-80">أدخلي رقم التتبع المكون من 6 أرقام لمتابعة حالة شحنتك</p>
        </div>

        <div className="p-8 md:p-14">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4 mb-14">
            <div className="relative flex-1">
              <input 
                type="text" 
                required
                placeholder="أدخلي رقم التتبع (مثال: RO-5521)"
                className="w-full bg-gray-50 border-2 border-transparent rounded-[1.5rem] py-5 px-8 pr-16 focus:border-pink-500 focus:bg-white transition-all outline-none text-lg font-extrabold shadow-inner uppercase"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
              />
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300" size={24} />
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="btn-primary px-12 py-5 rounded-[1.5rem] font-extrabold flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <><Search size={20} /> تتبع الشحنة</>}
            </button>
          </form>

          {notFound && (
            <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-center gap-4 text-red-600 mb-8 animate-zoom-in">
              <AlertCircle size={24} />
              <p className="font-extrabold text-sm">عذراً، لم نتمكن من العثور على طلب بهذا الرقم. يرجى التأكد من الرمز الصحيح.</p>
            </div>
          )}

          {order && (
            <div className="space-y-16 animate-fade-in">
              {/* Interactive Stepper Progress Bar */}
              <div className="relative pt-8 pb-4">
                <div className="absolute top-[52px] left-8 right-8 h-1.5 bg-gray-100 -z-0 rounded-full"></div>
                <div 
                  className="absolute top-[52px] right-8 h-1.5 bg-pink-600 -z-0 transition-all duration-1000 rounded-full shadow-[0_0_10px_rgba(219,39,119,0.5)]" 
                  style={{ width: `${(getStatusIndex(order.status) / (steps.length - 1)) * 100}%` }}
                ></div>
                
                <div className="flex justify-between relative z-10 px-2">
                  {steps.map((step, idx) => {
                    const isActive = idx <= getStatusIndex(order.status);
                    const isCurrent = idx === getStatusIndex(order.status);
                    const Icon = step.icon;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 ${
                          isCurrent ? 'bg-pink-600 text-white shadow-2xl scale-125 border-4 border-pink-100' : 
                          isActive ? 'bg-pink-100 text-pink-600' : 'bg-white text-gray-200 border-2 border-gray-100'
                        }`}>
                          <Icon size={24} />
                        </div>
                        <div className="text-center">
                          <span className={`block text-[10px] font-extrabold uppercase tracking-widest ${isActive ? 'text-black' : 'text-gray-300'}`}>{step.label}</span>
                          {isCurrent && <span className="text-[8px] font-bold text-pink-500 animate-pulse">الحالة الحالية</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-7 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                     <h4 className="font-extrabold text-lg">تفاصيل الشحنة</h4>
                     <span className="bg-white px-4 py-1.5 rounded-full text-[10px] font-extrabold text-pink-600 shadow-sm border border-pink-50">قيد المعالجة</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 font-bold">رقم التتبع</span>
                      <span className="font-extrabold text-gray-900">#{order.id}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 font-bold">المستلم</span>
                      <span className="font-extrabold text-gray-900">{order.customer}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 font-bold">تاريخ الطلب</span>
                      <span className="font-extrabold text-gray-900">{new Date(order.createdAt).toLocaleDateString('ar-YE')}</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5 bg-white p-8 rounded-[2.5rem] border-2 border-pink-50 shadow-sm space-y-6">
                  <h4 className="font-extrabold text-lg border-b pb-4">محتويات السلة</h4>
                  <div className="space-y-3">
                    {order.items.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-600">{item.name} <span className="text-pink-600">x{item.quantity}</span></span>
                        <span className="font-extrabold">{item.price} ر.س</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
                    <span className="font-extrabold text-gray-400">الإجمالي الكلي</span>
                    <span className="text-2xl font-extrabold text-pink-600">{order.total} SAR</span>
                  </div>
                </div>
              </div>

              <div className="bg-pink-50 p-8 rounded-[2.5rem] flex flex-col items-center gap-6 text-center">
                <p className="text-xs text-pink-800 font-bold max-w-sm leading-relaxed">إذا كان لديكِ أي استفسار حول موقع شحنتك الحالي، يسعدنا خدمتكِ عبر الواتساب مباشرة.</p>
                <a 
                  href="https://wa.me/967772728311" 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-primary px-10 py-4 rounded-2xl font-extrabold flex items-center gap-3 transition-all shadow-xl"
                >
                  <MessageCircle size={22} /> تواصل مع الدعم الفني
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tracking;

