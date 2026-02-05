
import React, { useState } from 'react';
import { 
  ArrowRight, ShoppingBag, Star, Plus, Minus, Share2, Heart, 
  Info, Ruler, Palette, Hash, Box, Check
} from 'lucide-react';
import { Product } from '../types';

interface DetailsProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, qty: number, size?: string, color?: string) => void;
}

const ProductDetails: React.FC<DetailsProps> = ({ product, onBack, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes?.[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.colors?.[0]);
  const [mainImage, setMainImage] = useState(product.image || (product.images && product.images[0]));

  if (!product) return null;

  const originalPrice = product.price || 0;
  const finalPrice = product.discountPrice || originalPrice;
  const hasDiscount = product.discountPrice && product.discountPrice < originalPrice;

  return (
    <div className="min-h-screen bg-white pb-32 animate-in fade-in duration-500" dir="rtl">
      {/* شريط علوي */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10">
        <button onClick={onBack} className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm">
          <ArrowRight size={20} className="text-slate-800" />
        </button>
        <div className="flex gap-2">
          <button className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm text-slate-800"><Heart size={18} /></button>
          <button className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm text-slate-800"><Share2 size={18} /></button>
        </div>
      </div>

      {/* معرض الصور */}
      <div className="w-full h-[450px] bg-gray-50 overflow-hidden rounded-b-[3.5rem] relative shadow-lg">
        <img src={mainImage} alt={product.name} className="w-full h-full object-cover transition-transform duration-700" />
        {hasDiscount && (
          <div className="absolute bottom-10 right-8 bg-[#FF4500] text-white px-6 py-2 rounded-full font-black text-sm shadow-xl animate-bounce">
            خصم {Math.round((1 - finalPrice/originalPrice) * 100)}%
          </div>
        )}
      </div>

      <div className="px-6 mt-8 space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-[#FF4500] bg-orange-50 px-3 py-1 rounded-full uppercase tracking-widest">{product.category || 'جديد'}</span>
            <h1 className="text-2xl font-black text-slate-800 leading-tight">{product.name}</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-xl border border-yellow-100">
            <Star size={14} className="fill-yellow-500 text-yellow-500" /><span className="text-xs font-black text-yellow-700">4.9</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 py-4 border-y border-gray-50">
          <div className="flex items-center gap-4">
            <span className="text-3xl font-black text-[#FF4500]">{(finalPrice).toLocaleString()} <span className="text-sm font-medium">ر.ي</span></span>
            {hasDiscount && (
              <span className="text-sm text-gray-300 line-through">{(originalPrice).toLocaleString()} ر.ي</span>
            )}
          </div>
          {product.stock && product.stock > 0 ? (
             <p className="text-[10px] font-black text-green-500 flex items-center gap-1"><Check size={10}/> متاح في المخزون ({product.stock} قطعة)</p>
          ) : (
             <p className="text-[10px] font-black text-red-500">نفذ من المخزون</p>
          )}
        </div>

        <p className="text-xs font-bold text-slate-600 leading-relaxed">{product.description || 'قطعة فريدة تعكس ذوقك الرفيع.'}</p>

        {/* اختيار المقاس */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-2"><Ruler size={14}/> المقاس المتاح</h3>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">اختر مقاسك</span>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
              {product.sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`min-w-[50px] h-12 rounded-xl flex items-center justify-center font-black text-xs transition-all border ${selectedSize === size ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-gray-100'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* اختيار اللون */}
        {product.colors && product.colors.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-800 flex items-center gap-2"><Palette size={14}/> اللون المتاح</h3>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
              {product.colors.map(color => (
                <button 
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-6 h-12 rounded-xl flex items-center justify-center font-black text-xs transition-all border ${selectedColor === color ? 'bg-[#FF4500] text-white border-[#FF4500] shadow-lg' : 'bg-white text-slate-500 border-gray-100'}`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* تفاصيل إضافية */}
        <div className="grid grid-cols-2 gap-4">
           {product.material && (
             <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100 space-y-1">
                <div className="flex items-center gap-2 text-[#FF4500] mb-1"><Hash size={14}/> <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">الخامة / المكونات</span></div>
                <p className="text-xs font-black text-slate-700">{product.material}</p>
             </div>
           )}
           {product.dimensions && (
             <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100 space-y-1">
                <div className="flex items-center gap-2 text-blue-500 mb-1"><Box size={14}/> <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">الحجم / الأبعاد</span></div>
                <p className="text-xs font-black text-slate-700">{product.dimensions}</p>
             </div>
           )}
        </div>

        <div className="flex items-center justify-between bg-gray-50 p-5 rounded-[2rem] border border-gray-100 shadow-inner">
          <span className="text-xs font-black text-slate-600">الكمية المطلوبة</span>
          <div className="flex items-center gap-5">
            <button onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400"><Minus size={18} /></button>
            <span className="font-black text-slate-800 text-lg">{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg"><Plus size={18} /></button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-20 rounded-t-[3rem] shadow-xl">
        <button 
          onClick={() => onAddToCart(product, quantity, selectedSize, selectedColor)}
          disabled={!product.stock || product.stock <= 0}
          className="w-full bg-[#FF4500] text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all disabled:bg-gray-200 disabled:shadow-none"
        >
          <ShoppingBag size={20} />
          <span className="text-sm">
            {product.stock && product.stock > 0 
              ? `إضافة للسلة (${(finalPrice * quantity).toLocaleString()} ر.ي)` 
              : 'غير متوفر حالياً'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProductDetails;
