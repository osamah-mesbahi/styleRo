
import React from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ChevronDown } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  cartItems: CartItem[];
  onUpdateQty: (cartItemId: string, delta: number) => void;
  onRemove: (cartItemId: string) => void;
  onCheckout: () => void;
  onBack: () => void;
}

const CartView: React.FC<CartProps> = ({ cartItems, onUpdateQty, onRemove, onCheckout, onBack }) => {
  const total = cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 pb-48 animate-in fade-in duration-500" dir="rtl">
      {/* Header Matching Screenshot */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-40 px-6 py-4 flex justify-between items-center border-b border-gray-50 shadow-sm">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-red-50 text-[#FF4500] flex items-center justify-center font-black text-sm">S</div>
           <div className="relative">
              <button className="bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2">
                YER <ChevronDown size={14} />
              </button>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <h2 className="text-xl font-black italic tracking-tighter text-[#FF4500]">ستايل رو</h2>
           <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
             <img src="https://stylero.online/logo.png" className="w-6 h-6 object-contain" />
           </div>
        </div>
      </div>

      <div className="pt-24 space-y-8">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">سلة المشتريات <span className="text-gray-300 font-bold text-sm">({cartItems.length} منتجات)</span></h2>
          <button onClick={onBack} className="p-3 bg-white rounded-2xl shadow-sm border border-gray-50"><ArrowRight size={24}/></button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 opacity-20">
            <ShoppingBag size={100} strokeWidth={1} />
            <p className="font-black mt-8 text-lg">سلة التسوق فارغة</p>
          </div>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div key={item.cartItemId} className="bg-white p-6 rounded-[3rem] border border-gray-50 shadow-sm flex gap-6 items-center">
                <div className="w-28 h-28 bg-gray-50 rounded-[2rem] overflow-hidden border border-gray-50 shadow-sm">
                  <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-start">
                     <h3 className="text-sm font-black text-slate-800 line-clamp-1 flex-1">{item.name}</h3>
                     <button onClick={() => onRemove(item.cartItemId)} className="p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                   </div>
                   <p className="text-[#FF4500] font-black text-lg mt-1">{(item.price || 0).toLocaleString()} <span className="text-xs">ر.ي</span></p>
                   
                   <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-5 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                        <button onClick={() => onUpdateQty(item.cartItemId, -1)} className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-400"><Minus size={16}/></button>
                        <span className="text-sm font-black text-slate-800">{item.quantity}</span>
                        <button onClick={() => onUpdateQty(item.cartItemId, 1)} className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-400"><Plus size={16}/></button>
                      </div>
                      <p className="text-[11px] font-black text-slate-400">الإجمالي: {((item.price || 0) * (item.quantity || 1)).toLocaleString()} ر.ي</p>
                   </div>
                </div>
              </div>
            ))}

            <div className="bg-white p-10 rounded-[3.5rem] border border-gray-50 shadow-sm space-y-6">
               <h4 className="text-xl font-black text-slate-800 mb-6">ملخص الطلب</h4>
               <div className="flex justify-between text-xs font-bold text-slate-500"><span>مجموع المنتجات</span><span>{(total).toLocaleString()} ر.ي</span></div>
               <div className="flex justify-between text-xs font-bold text-slate-500"><span>التوصيل</span><span className="text-green-500 font-black">مجاني</span></div>
               
               <div className="flex gap-3 pt-4">
                  <input className="flex-1 bg-gray-50 p-5 rounded-2xl outline-none text-xs font-bold border border-transparent focus:border-orange-500" placeholder="كود الخصم" />
                  <button className="bg-slate-900 text-white px-8 rounded-2xl font-black text-xs active:scale-95 transition-all">تطبيق</button>
               </div>

               <div className="border-t border-dashed border-gray-100 pt-8 flex justify-between items-center">
                  <span className="text-lg font-black text-slate-800">الإجمالي النهائي</span>
                  <span className="text-3xl font-black text-[#FF4500]">{(total).toLocaleString()} ر.ي</span>
               </div>
            </div>

            <div className="fixed bottom-28 left-0 right-0 px-6 z-40">
              <button 
                onClick={onCheckout}
                className="w-full bg-[#FF4500] text-white py-6 rounded-[2.5rem] font-black shadow-2xl shadow-orange-500/30 flex items-center justify-center gap-4 active:scale-95 transition-all hover:bg-orange-600"
              >
                إتمام الطلب <ArrowRight size={24} className="rotate-180" />
              </button>
              <p className="text-center text-[10px] text-gray-400 font-bold mt-4">🔒 شحن آمن ومضمون 100%</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartView;
