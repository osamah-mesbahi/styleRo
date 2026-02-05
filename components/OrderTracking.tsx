
import React, { useState } from 'react';
import { Package, Truck, Clock, Search, ArrowRight, CheckCircle, MapPin, CreditCard, ChevronDown } from 'lucide-react';

const OrderTracking: React.FC = () => {
  const [orderId, setOrderId] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-32 animate-in fade-in duration-500" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md z-40 px-6 py-4 flex justify-between items-center border-b border-gray-50 shadow-sm mb-10">
        <button className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50 opacity-0"><ArrowRight size={24}/></button>
        <h2 className="text-2xl font-black italic tracking-tighter text-[#FF4500]">ستايل رو</h2>
        <div className="w-10 h-10 rounded-full bg-red-50 text-[#FF4500] flex items-center justify-center font-black">S</div>
      </div>

      <div className="px-6 space-y-10">
        <div className="text-center space-y-4">
           <div className="w-20 h-20 bg-orange-50 text-[#FF4500] rounded-full flex items-center justify-center mx-auto shadow-inner"><Truck size={40}/></div>
           <h2 className="text-3xl font-black text-slate-800">تتبع طلبك بسهولة</h2>
           <p className="text-[11px] text-gray-400 font-bold">ادخل رقم الطلب (-ORD) أو رقم الجوال لمعرفة حالة الشحنة</p>
        </div>

        <div className="bg-white p-2 rounded-[2.5rem] shadow-xl shadow-gray-100 border border-gray-50 flex items-center mb-8 relative">
          <Search className="absolute right-6 text-gray-300" size={20} />
          <input 
            className="flex-1 p-6 pr-14 outline-none text-sm font-black text-slate-800 uppercase" 
            placeholder="ORD-10012" 
            value={orderId}
            onChange={e => setOrderId(e.target.value)}
          />
          <button 
            onClick={() => setShowDetails(true)}
            className="bg-slate-900 text-white px-8 py-5 rounded-[2rem] font-black text-xs hover:bg-black transition-all active:scale-95 shadow-lg"
          >
            تتبع
          </button>
        </div>

        {showDetails && (
          <div className="space-y-8 animate-in slide-in-from-bottom-5">
            {/* Status Card */}
            <div className="bg-white p-10 rounded-[3.5rem] border border-gray-50 shadow-sm space-y-8 relative overflow-hidden">
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">ORD-10012</h3>
                    <p className="text-[11px] text-gray-400 font-bold mt-1 flex items-center gap-2"><Clock size={12}/> تم الطلب في: 2026/2/2</p>
                  </div>
                  <span className="bg-blue-50 text-blue-500 px-4 py-1.5 rounded-xl text-[10px] font-black border border-blue-100 shadow-sm shadow-blue-50">منتجات المتجر</span>
               </div>
               
               <div className="text-center py-6 bg-gray-50/50 rounded-[2.5rem] border border-gray-50">
                  <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest mb-1">الإجمالي</p>
                  <p className="text-2xl font-black text-[#FF4500]">4,500 <span className="text-sm">ر.ي</span></p>
               </div>

               {/* Timeline */}
               <div className="flex justify-between items-start pt-10 relative px-2">
                  <div className="absolute top-[54px] left-8 right-8 h-1 bg-gray-50 z-0"></div>
                  <div className="absolute top-[54px] right-8 h-1 bg-[#10B981] z-0" style={{ width: '0%' }}></div>
                  
                  <Step icon={<Clock size={18}/>} label="قيد المراجعة" active />
                  <Step icon={<Package size={18}/>} label="تجهيز الطلب" />
                  <Step icon={<Truck size={18}/>} label="تم الشحن" />
                  <Step icon={<CheckCircle size={18}/>} label="تم التوصيل" />
               </div>
            </div>

            {/* Contents Card */}
            <div className="bg-white p-10 rounded-[3.5rem] border border-gray-50 shadow-sm space-y-6">
               <h3 className="text-lg font-black flex items-center gap-3"><Package size={20} className="text-orange-500"/> محتويات الشحنة</h3>
               <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-[1.5rem] overflow-hidden border border-gray-50 relative">
                     <img src="https://via.placeholder.com/150" className="w-full h-full object-cover" />
                     <span className="absolute bottom-1 left-1 bg-black text-white text-[9px] px-1.5 py-0.5 rounded-md font-black">x1</span>
                  </div>
                  <div className="flex-1">
                     <p className="text-xs font-black text-slate-800 leading-tight">منظم حمام ذكي 10 في 1 مع موزع معجون وأكواب دبة</p>
                     <p className="text-[#FF4500] font-black text-sm mt-1">4,500 ر.ي</p>
                  </div>
               </div>
            </div>

            {/* Address Card */}
            <div className="bg-white p-10 rounded-[3.5rem] border border-gray-50 shadow-sm space-y-6">
               <h3 className="text-lg font-black flex items-center gap-3"><MapPin size={20} className="text-red-500"/> عنوان التوصيل</h3>
               <div className="space-y-2">
                  <p className="text-sm font-black text-slate-800">اسم العميل</p>
                  <p className="text-xs font-bold text-gray-400 tracking-widest">777777777</p>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs font-bold text-slate-500 text-center mt-4">صنعاء - اليمن</div>
               </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white p-10 rounded-[3.5rem] border border-gray-50 shadow-sm space-y-6">
               <h3 className="text-lg font-black flex items-center gap-3"><CreditCard size={20} className="text-green-500"/> ملخص الدفع</h3>
               <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold text-gray-400"><span>المجموع</span><span>4,500</span></div>
                  <div className="border-t border-dashed border-gray-100 pt-4 flex justify-between items-center">
                     <span className="text-lg font-black text-slate-800">الإجمالي</span>
                     <span className="text-2xl font-black text-slate-800">4,500 <span className="text-sm">ر.ي</span></span>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Step = ({ icon, label, active }: any) => (
  <div className="flex flex-col items-center gap-4 relative z-10 flex-1">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${active ? 'bg-[#10B981] text-white shadow-xl shadow-green-100' : 'bg-gray-50 text-gray-300 border border-gray-100'}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-black whitespace-nowrap ${active ? 'text-slate-900' : 'text-gray-300'}`}>{label}</span>
  </div>
);

export default OrderTracking;
