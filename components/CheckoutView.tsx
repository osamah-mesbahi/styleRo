
import React, { useState } from 'react';
import { db } from '../services/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { User, Phone, MapPin, ArrowRight, ShieldCheck, ChevronDown, Package, CreditCard, Building, Globe, AlertCircle } from 'lucide-react';

interface CheckoutProps {
  onBack: () => void;
  onSuccess: (orderId: string) => void;
  totalAmount: number;
}

const CheckoutView: React.FC<CheckoutProps> = ({ onBack, onSuccess, totalAmount }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    address: ''
  });

  const finalAmount = totalAmount || 0;

  const handleConfirmOrder = async () => {
    if (!formData.name || !formData.phone || !formData.city) {
      alert("يرجى إكمال البيانات الأساسية واختيار المدينة");
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        customerName: formData.name,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        paymentMethod,
        status: 'new',
        createdAt: serverTimestamp(),
        total: finalAmount
      });
      onSuccess(docRef.id);
    } catch (e) {
      console.error(e);
      alert("حدث خطأ، يرجى المحاولة لاحقاً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-48 animate-in slide-in-from-left-5 duration-500" dir="rtl">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-40 px-6 py-4 flex justify-between items-center border-b border-gray-50">
        <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50"><ArrowRight size={24}/></button>
        <h2 className="text-2xl font-black italic tracking-tighter">إتمام الطلب</h2>
        <div className="w-10 h-10 rounded-full bg-red-50 text-[#FF4500] flex items-center justify-center font-black">أ</div>
      </div>

      <div className="pt-24 px-6 space-y-10">
        {/* بيانات التوصيل */}
        <section className="space-y-6">
          <h3 className="text-xl font-black text-slate-800">بيانات التوصيل</h3>
          <div className="bg-white p-8 rounded-[3.5rem] border border-gray-50 shadow-sm space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 mr-2 flex items-center gap-2"><User size={12}/> الاسم الكامل</label>
              <input className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-bold text-sm" placeholder="الاسم هنا.." value={formData.name} onChange={v => setFormData({...formData, name: v.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 mr-2 flex items-center gap-2"><Phone size={12}/> رقم الجوال</label>
              <input className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-bold text-sm" placeholder="77xxxxxxx" value={formData.phone} onChange={v => setFormData({...formData, phone: v.target.value})} />
            </div>
          </div>
        </section>

        {/* ملخص الطلب */}
        <section className="space-y-6">
           <h3 className="text-xl font-black text-slate-800">ملخص الطلب</h3>
           <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-8">
              <div className="space-y-4">
                 <div className="flex justify-between text-xs font-bold text-gray-400"><span>المجموع</span><span className="text-slate-800">{(finalAmount).toLocaleString()} ر.ي</span></div>
              </div>
              <div className="pt-6 border-t border-dashed border-gray-100 flex justify-between items-center">
                 <span className="text-lg font-black text-slate-800">الإجمالي النهائي</span>
                 <span className="text-2xl font-black text-[#FF4500]">{(finalAmount).toLocaleString()} ر.ي</span>
              </div>
              <button 
                onClick={handleConfirmOrder} 
                disabled={loading}
                className="w-full bg-[#FF4500] text-white py-6 rounded-[2.5rem] font-black shadow-2xl shadow-orange-500/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <><Package size={20}/> تأكيد الطلب ({(finalAmount).toLocaleString()} ر.ي)</>}
              </button>
           </div>
        </section>
      </div>
    </div>
  );
};

export default CheckoutView;
