
import React, { useState, useRef } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  User, Phone, Link as LinkIcon, Plus, Trash2, Send, Globe, 
  Sparkles, CheckCircle, ArrowRight, Info, ShoppingBag, Layers,
  RefreshCw, Image as ImageIcon, UploadCloud, X
} from 'lucide-react';
import Footer from './Footer';

interface ProductLink {
  url: string;
  specs: string;
  quantity: number;
  image?: string; // Base64 string for the uploaded image/screenshot
}

interface GlobalOrderViewProps {
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}

const GlobalOrderView: React.FC<GlobalOrderViewProps> = ({ onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });
  const [links, setLinks] = useState<ProductLink[]>([{ url: '', specs: '', quantity: 1 }]);
  const [loading, setLoading] = useState(false);

  const addLink = () => {
    setLinks([...links, { url: '', specs: '', quantity: 1 }]);
  };

  const removeLink = (index: number) => {
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index));
    }
  };

  const updateLink = (index: number, field: keyof ProductLink, value: any) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setLinks(newLinks);
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateLink(index, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || links.some(l => !l.url && !l.image)) {
      alert("يرجى إدخال رابط المنتج أو إرفاق صورة له على الأقل");
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "global_orders"), {
        ...formData,
        links,
        status: 'pending_review',
        type: 'global_brokerage',
        createdAt: serverTimestamp()
      });
      onSuccess(docRef.id);
    } catch (error) {
      alert("حدث خطأ أثناء إرسال الطلب.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] animate-in fade-in duration-700" dir="rtl">
      {/* Header */}
      <section className="bg-slate-900 text-white pt-12 pb-24 px-6 rounded-b-[4rem] relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-orange-600/10 blur-[100px] -translate-y-1/2"></div>
        <div className="relative z-10 space-y-4">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-white/5">
            <Globe className="text-[#FF4500]" size={32} />
          </div>
          <p className="text-[#FF4500] font-black text-[10px] uppercase tracking-widest">تسوق من العالم</p>
          <h1 className="text-4xl font-black tracking-tighter italic">وساطة الشراء</h1>
          <p className="text-gray-400 text-xs font-bold max-w-xs mx-auto leading-relaxed">
            اطلب من شي إن، أمازون، أو نون.. ارفق الروابط أو صور المنتجات وسنقوم باللازم.
          </p>
        </div>
        <button onClick={onBack} className="absolute top-8 right-8 p-3 bg-white/10 rounded-2xl text-white hover:bg-white/20 transition-all">
          <ArrowRight size={20} />
        </button>
      </section>

      <form onSubmit={handleSubmit} className="px-6 -mt-16 space-y-8 pb-32">
        {/* Step 1: Personal Info */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-xl shadow-gray-100/50 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="w-10 h-10 bg-orange-50 text-[#FF4500] rounded-xl flex items-center justify-center">
              <User size={20} />
            </div>
            <h3 className="font-black text-slate-800">بياناتك الشخصية</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase mr-2">الاسم الكامل</label>
              <input 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-orange-500 transition-all" 
                placeholder="الاسم هنا.."
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase mr-2">رقم الجوال</label>
              <input 
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-bold text-sm border border-transparent focus:border-orange-500 transition-all" 
                placeholder="77xxxxxxx"
                required
              />
            </div>
          </div>
        </div>

        {/* Step 2: Product Links & Files */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-xl shadow-gray-100/50 space-y-8">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Layers size={20} />
              </div>
              <h3 className="font-black text-slate-800">تفاصيل الطلبات</h3>
            </div>
            <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-[9px] font-black">{links.length} منتجات</span>
          </div>

          <div className="space-y-12">
            {links.map((link, index) => (
              <div key={index} className="relative p-6 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 space-y-6 animate-in slide-in-from-right-2">
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-black text-xs shadow-lg">
                  {index + 1}
                </div>
                
                {links.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeLink(index)}
                    className="absolute -top-3 -left-3 w-8 h-8 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-md hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                )}

                {/* File Upload Section */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase mr-2">صورة المنتج / لقطة شاشة (اختياري)</label>
                  <div className="relative group">
                    {link.image ? (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
                        <img src={link.image} className="w-full h-full object-contain" alt="Preview" />
                        <button 
                          type="button"
                          onClick={() => updateLink(index, 'image', undefined)}
                          className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full aspect-[2/1] border-2 border-dashed border-gray-200 rounded-[2rem] bg-white cursor-pointer hover:bg-blue-50/50 hover:border-blue-200 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadCloud className="w-10 h-10 text-gray-300 mb-2 group-hover:text-blue-500 transition-colors" />
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">إرفاق صورة أو ملف</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*,.pdf" 
                          onChange={(e) => handleFileChange(index, e)}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-gray-400 uppercase mr-2 flex items-center gap-1"><LinkIcon size={10}/> رابط المنتج</label>
                  <input 
                    value={link.url}
                    onChange={e => updateLink(index, 'url', e.target.value)}
                    className="w-full bg-white p-4 rounded-xl outline-none font-bold text-[11px] border border-gray-100 focus:border-blue-500" 
                    placeholder="https://..."
                    dir="ltr"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase mr-2">المواصفات (لون، مقاس..)</label>
                    <input 
                      value={link.specs}
                      onChange={e => updateLink(index, 'specs', e.target.value)}
                      className="w-full bg-white p-4 rounded-xl outline-none font-bold text-[11px] border border-gray-100" 
                      placeholder="مثال: أحمر، XL"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase mr-2">الكمية</label>
                    <div className="flex items-center bg-white rounded-xl border border-gray-100 overflow-hidden">
                      <button 
                        type="button"
                        onClick={() => updateLink(index, 'quantity', Math.max(1, link.quantity - 1))}
                        className="p-4 text-gray-400 hover:text-orange-500 transition-colors flex-1"
                      >
                        -
                      </button>
                      <span className="px-6 font-black text-sm">{link.quantity}</span>
                      <button 
                        type="button"
                        onClick={() => updateLink(index, 'quantity', link.quantity + 1)}
                        className="p-4 text-gray-400 hover:text-orange-500 transition-colors flex-1"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            type="button"
            onClick={addLink}
            className="w-full py-5 border-2 border-dashed border-gray-100 rounded-[2rem] text-gray-400 font-black text-xs flex items-center justify-center gap-3 hover:border-orange-200 hover:text-orange-500 transition-all bg-white"
          >
            <Plus size={18} /> إضافة رابط/منتج آخر
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-orange-50 p-6 rounded-[2.5rem] border border-orange-100/50 flex gap-4 items-start shadow-sm">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-xl shrink-0"><Info size={18}/></div>
          <p className="text-[10px] text-orange-800 font-bold leading-relaxed">
            سيقوم فريقنا بمراجعة الروابط والصور وحساب التكلفة الإجمالية (شاملة الشحن والعمولة) والتواصل معك لتأكيد الطلب.
          </p>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-sm flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="animate-spin" size={20}/>
          ) : (
            <>
              <Send className="rotate-180" size={20}/> 
              إرسال طلب الشراء
            </>
          )}
        </button>
      </form>

      <Footer />
    </div>
  );
};

export default GlobalOrderView;
