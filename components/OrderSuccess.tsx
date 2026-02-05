
import React from 'react';
import { CheckCircle, Home, ShoppingBag, PartyPopper } from 'lucide-react';

interface SuccessProps {
  orderId: string;
  onGoHome: () => void;
}

const OrderSuccess: React.FC<SuccessProps> = ({ orderId, onGoHome }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-500" dir="rtl">
      {/* أيقونة النجاح المتحركة */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
        <div className="relative bg-green-500 text-white p-6 rounded-full shadow-xl shadow-green-100">
          <CheckCircle size={60} strokeWidth={2.5} />
        </div>
      </div>

      <h1 className="text-2xl font-black text-slate-800 mb-2">تم استلام طلبك بنجاح!</h1>
      <p className="text-gray-400 font-bold text-[11px] mb-8 leading-relaxed">
        شكراً لثقتك بـ <span className="text-orange-600 italic">StyleRo</span>. <br /> 
        جاري تجهيز طلبك الآن وسنتواصل بك قريباً.
      </p>

      {/* بطاقة رقم الطلب */}
      <div className="bg-gray-50 p-6 rounded-[2.5rem] w-full max-w-xs border border-gray-100 mb-10">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">رقم الطلب الخاص بك</p>
        <p className="text-lg font-black text-slate-800 tracking-tighter">#{orderId.slice(0, 8).toUpperCase()}</p>
      </div>

      {/* أزرار التوجيه */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button 
          onClick={onGoHome}
          className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
        >
          <Home size={18} /> العودة للرئيسية
        </button>
        <button 
          onClick={onGoHome}
          className="w-full bg-orange-50 text-orange-600 py-5 rounded-[2rem] font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          <ShoppingBag size={18} /> تصفح المزيد
        </button>
      </div>

      <div className="mt-12 flex items-center gap-2 text-orange-500 opacity-50">
        <PartyPopper size={20} />
        <span className="text-[10px] font-black italic">نحن فخورون بخدمتك</span>
      </div>
    </div>
  );
};

export default OrderSuccess;
