
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Trash2, Send, 
  User, Phone, Info, ArrowRight, CheckCircle2, Globe
} from 'lucide-react';
import { EXTERNAL_STORES } from '../constants';

interface ProductLink {
  url: string;
  quantity: number;
  specs: string;
}

const Brokerage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [links, setLinks] = useState<ProductLink[]>([{ url: '', quantity: 1, specs: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addLink = () => setLinks([...links, { url: '', quantity: 1, specs: '' }]);
  const removeLink = (idx: number) => setLinks(links.filter((_, i) => i !== idx));
  const updateLink = (idx: number, field: keyof ProductLink, val: any) => {
    const newLinks = [...links];
    newLinks[idx] = { ...newLinks[idx], [field]: val };
    setLinks(newLinks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phoneNumber || !links[0].url) return alert('يرجى ملء كافة البيانات الأساسية');
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert('تم إرسال طلبك بنجاح! فريق Style Ro سيتواصل معكِ عبر الواتساب لتأكيد الحساب.');
      navigate('/');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-32 mt-12 text-right" dir="rtl">
      
      {/* Visual Progress Header */}
      <div className="flex items-center justify-between mb-16 relative">
         <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -z-10"></div>
         <StepIndicator active={step >= 1} current={step === 1} num={1} label="المتجر" />
         <StepIndicator active={step >= 2} current={step === 2} num={2} label="الروابط" />
         <StepIndicator active={step >= 3} current={step === 3} num={3} label="بياناتك" />
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-50 overflow-hidden animate-zoom-in">
        
        {/* Step 1: Store Choice */}
        {step === 1 && (
          <div className="p-10 space-y-8">
            <div className="text-center space-y-2">
               <h2 className="text-2xl font-extrabold">اختاري متجرك المفضل 🌍</h2>
               <p className="text-gray-400 text-xs font-bold">حددي الموقع الذي ترغبين بالطلب منه</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {EXTERNAL_STORES.map(store => (
                <button
                  key={store.name}
                  onClick={() => { setSelectedStore(store.name); setStep(2); }}
                  className={`flex flex-col items-center gap-4 p-6 rounded-[2rem] border-2 transition-all ${selectedStore === store.name ? 'border-primary bg-pink-50' : 'border-gray-50 hover:border-gray-200'}`}
                >
                  <img src={store.logo} className="h-10 object-contain" alt={store.name} />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">{store.name}</span>
                </button>
              ))}
              <button onClick={() => { setSelectedStore('آخر'); setStep(2); }} className="flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 border-dashed border-gray-200 text-gray-400 hover:border-primary hover:text-primary transition-all">
                 <Globe size={24} className="mb-2" />
                 <span className="text-[10px] font-extrabold">متجر آخر</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Product Links */}
        {step === 2 && (
          <div className="p-10 space-y-8">
             <div className="flex items-center justify-between border-b pb-6">
                <h2 className="text-xl font-extrabold">روابط المنتجات 🔗</h2>
                <button onClick={addLink} className="flex items-center gap-2 text-primary font-extrabold text-[10px] bg-pink-50 px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-all shadow-sm">
                   <Plus size={16} /> إضافة رابط
                </button>
             </div>
             
             <div className="space-y-6 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
                {links.map((link, idx) => (
                  <div key={idx} className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 relative space-y-4 group">
                    {links.length > 1 && (
                      <button onClick={() => removeLink(idx)} className="absolute top-4 left-4 text-red-300 hover:text-red-500 transition shadow-sm bg-white p-2 rounded-full"><Trash2 size={16}/></button>
                    )}
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-extrabold text-gray-400 mr-2 uppercase">رابط المنتج من موقع {selectedStore}</label>
                      <input 
                        type="url" 
                        placeholder="الصقي الرابط هنا..."
                        className="w-full bg-white border-none rounded-xl py-4 px-6 text-xs font-bold shadow-sm outline-none focus:ring-2 focus:ring-primary/20"
                        value={link.url}
                        onChange={(e) => updateLink(idx, 'url', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-extrabold text-gray-400 mr-2 uppercase">الكمية</label>
                          <input type="number" min="1" className="w-full bg-white border-none rounded-xl py-3 px-6 text-xs font-extrabold shadow-sm outline-none" value={link.quantity} onChange={(e) => updateLink(idx, 'quantity', parseInt(e.target.value))} />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-extrabold text-gray-400 mr-2 uppercase">المواصفات (لون/مقاس)</label>
                          <input type="text" placeholder="مثال: أسود، XL" className="w-full bg-white border-none rounded-xl py-3 px-6 text-xs font-bold shadow-sm outline-none" value={link.specs} onChange={(e) => updateLink(idx, 'specs', e.target.value)} />
                       </div>
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="flex gap-4 pt-4">
             <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-2xl font-extrabold text-xs text-gray-400 bg-gray-50">رجوع</button>
             <button onClick={() => setStep(3)} className="flex-[2] btn-primary py-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2">متابعة البيانات <ArrowRight size={16}/></button>
           </div>
          </div>
        )}

        {/* Step 3: Final Data */}
        {step === 3 && (
          <div className="p-10 space-y-8">
             <div className="text-center space-y-2">
                <h2 className="text-2xl font-extrabold">الخطوة الأخيرة 💌</h2>
                <p className="text-gray-400 text-xs font-bold">بيانات التواصل لتأكيد طلبك</p>
             </div>
             <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">الاسم الكامل</label>
                   <div className="relative">
                      <input type="text" className="w-full bg-gray-50 rounded-2xl py-4 px-12 font-bold outline-none border border-transparent focus:border-primary/30" placeholder="ادخلي اسمك هنا..." value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                      <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">رقم الواتساب</label>
                   <div className="relative">
                      <input type="tel" className="w-full bg-gray-50 rounded-2xl py-4 px-12 font-bold text-right outline-none border border-transparent focus:border-primary/30" placeholder="77XXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                      <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                   </div>
                </div>
             </div>
             
             <div className="nice-card bg-pink-50 p-6 rounded-3xl flex gap-4 border border-pink-100">
                <Info size={24} className="text-primary shrink-0" />
                <p className="text-[10px] text-pink-900 font-bold leading-relaxed">سيقوم فريقنا بحساب تكلفة الشحن والعمولة وإرسال "فاتورة مبدئية" لكِ عبر الواتساب للموافقة عليها قبل البدء.</p>
             </div>

             <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-2xl font-extrabold text-xs text-gray-400 bg-gray-50">رجوع</button>
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="flex-[3] btn-primary py-4 rounded-2xl font-extrabold text-lg shadow-2xl flex items-center justify-center gap-3 transition-all hover:opacity-95"
                >
                  {isSubmitting ? 'جاري الإرسال...' : <><Send size={20} /> تأكيد الطلب</>}
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StepIndicator = ({num, label, active, current}: any) => (
  <div className="flex flex-col items-center gap-2 relative">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold transition-all duration-500 shadow-sm ${
      current ? 'bg-primary text-white scale-125 shadow-primary/20 rotate-12' : 
      active ? 'bg-black text-white' : 'bg-white text-gray-200 border border-gray-100'
    }`}>
      {active && !current ? <CheckCircle2 size={20} /> : num}
    </div>
    <span className={`text-[10px] font-extrabold uppercase tracking-widest ${active ? 'text-black' : 'text-gray-300'}`}>{label}</span>
  </div>
);

export default Brokerage;

