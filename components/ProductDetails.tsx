import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Heart, Minus, Plus, Check, Star, ShieldCheck, Truck, RotateCcw, User, Tag } from 'lucide-react';
import { Product } from '../types';
import { Button } from './Button';

interface ProductDetailsProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size?: string, color?: string) => void;
  language: 'en' | 'ar';
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart,
  language 
}) => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] || '');
      setSelectedColor(product.colors?.[0] || '');
      setQuantity(1);
      setActiveTab('details');
    }
  }, [product]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  if (!product) return null;

  const t = {
    en: {
      addToCart: "Add to Bag",
      buyNow: "Buy Now",
      description: "Description",
      sizes: "Select Size",
      colors: "Select Color",
      reviews: "Reviews",
      customerReviews: "Customer Reviews",
      writeReview: "Write a Review",
      basedOn: "Based on",
      ratings: "ratings",
      original: "100% Original",
      warranty: "Quality Guarantee",
      shipping: "Fast Shipping",
      currency: "YER",
      details: "Details"
    },
    ar: {
      addToCart: "إضافة للسلة",
      buyNow: "شراء الآن",
      description: "الوصف",
      sizes: "اختر المقاس",
      colors: "اختر اللون",
      reviews: "التقييمات",
      customerReviews: "تقييمات العملاء",
      writeReview: "أكتب تقييم",
      basedOn: "بناءً على",
      ratings: "تقييم",
      original: "منتج أصلي 100%",
      warranty: "ضمان الجودة",
      shipping: "شحن سريع",
      currency: "ر.ي",
      details: "التفاصيل"
    }
  };

  const txt = t[language];
  const isRtl = language === 'ar';

  // Mock Reviews Data
  const reviews = [
    { id: 1, user: "Sarah M.", rating: 5, comment: "Absolutely love this! The quality is amazing.", date: "2 days ago" },
    { id: 2, user: "Ahmed K.", rating: 4, comment: "Great product, fast delivery.", date: "1 week ago" },
    { id: 3, user: "Fatima R.", rating: 5, comment: "Perfect fit and lovely packaging.", date: "2 weeks ago" }
  ];

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize || undefined, selectedColor || undefined);
    handleClose();
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`} 
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div 
        className={`
          relative bg-white w-full md:max-w-4xl md:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-auto md:max-h-[80vh]
          transition-all duration-300 transform
          ${isClosing ? 'translate-y-full md:scale-95 md:opacity-0' : 'translate-y-0 md:scale-100 md:opacity-100'}
        `}
      >
        <button 
          onClick={handleClose} 
          className={`absolute top-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full text-gray-500 hover:text-black shadow-sm transition-colors ${isRtl ? 'left-4' : 'right-4'}`}
        >
          <X size={20} />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-gray-50 relative group">
           <div className="aspect-[4/5] md:aspect-auto md:h-full overflow-hidden flex items-center justify-center p-8">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
              />
           </div>
           {/* Mobile Tags */}
           <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.discountPrice && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                      -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                  </span>
              )}
              {product.storeName && (
                  <span className="bg-black/80 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                      {product.storeName}
                  </span>
              )}
           </div>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 flex flex-col bg-white">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            
            <div className="p-6 md:p-8">
                {/* Header */}
                <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-brand-accent uppercase tracking-wider bg-brand-soft px-2 py-0.5 rounded-md">{product.category}</span>
                    <button onClick={() => setActiveTab('reviews')} className="flex items-center gap-1 text-amber-400 text-xs font-bold hover:underline">
                        <Star size={12} fill="currentColor" />
                        <span className="text-gray-400">4.8 (120 {txt.reviews})</span>
                    </button>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight mb-2">{product.name}</h2>
                <div className="flex items-center gap-3">
                    {product.discountPrice ? (
                        <>
                        <span className="text-2xl font-bold text-red-600">{product.discountPrice.toLocaleString()} {txt.currency}</span>
                        <span className="text-lg text-gray-400 line-through">{product.price.toLocaleString()}</span>
                        </>
                    ) : (
                        <span className="text-2xl font-bold text-gray-900">{product.price.toLocaleString()} {txt.currency}</span>
                    )}
                </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 mb-6">
                    <button 
                        onClick={() => setActiveTab('details')}
                        className={`pb-3 px-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'details' ? 'border-brand-black text-brand-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        {txt.details}
                    </button>
                    <button 
                        onClick={() => setActiveTab('reviews')}
                        className={`pb-3 px-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'reviews' ? 'border-brand-black text-brand-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        {txt.customerReviews}
                    </button>
                </div>

                {activeTab === 'details' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Sizes */}
                        {product.sizes && product.sizes.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">{txt.sizes}</h3>
                            <div className="flex flex-wrap gap-2">
                                                                {product.sizes.map((size, idx) => (
                                <button
                                                                        key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`min-w-[40px] h-10 px-3 rounded-lg border text-sm font-bold transition-all flex items-center gap-2 ${
                                        selectedSize === size 
                                        ? 'border-brand-black bg-brand-black text-white shadow-md' 
                                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                                    }`}
                                >
                                                                        {product.sizeIcons?.[idx] ? (
                                                                            <img src={product.sizeIcons[idx]} className="w-4 h-4 rounded" />
                                                                        ) : (
                                                                            <Tag size={12} />
                                                                        )}
                                    <span>{size}</span>
                                </button>
                                ))}
                            </div>
                        </div>
                        )}

                        {/* Colors */}
                        {product.colors && product.colors.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">{txt.colors}</h3>
                            <div className="flex flex-wrap gap-2">
                                                                {product.colors.map((color, idx) => (
                                                                <button
                                                                        key={color}
                                                                        onClick={() => setSelectedColor(color)}
                                                                        className={`w-8 h-8 rounded-full border shadow-sm transition-transform relative ${selectedColor === color ? 'ring-2 ring-brand-black ring-offset-2 scale-110' : 'border-gray-200 hover:scale-105'}`}
                                                                        style={{ backgroundColor: color }}
                                                                        title={color}
                                                                >
                                                                    {product.colorIcons?.[idx] && (
                                                                        <img src={product.colorIcons[idx]} className="absolute inset-0 w-full h-full rounded-full object-cover" />
                                                                    )}
                                                                    {selectedColor === color && (
                                                                        <span className="absolute inset-0 flex items-center justify-center text-white">
                                                                            <Check size={14} />
                                                                        </span>
                                                                    )}
                                                                </button>
                                ))}
                            </div>
                        </div>
                        )}

                        {/* Description */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">{txt.description}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                {product.description || "Experience premium quality with this selection. Perfect for daily use and special occasions. Crafted with care to ensure the best experience."}
                            </p>
                        </div>

                        {/* Features (Trust) */}
                        <div className="grid grid-cols-3 gap-2 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <div className="flex flex-col items-center text-center gap-1">
                                <ShieldCheck className="text-gray-400" size={20}/>
                                <span className="text-[10px] font-bold text-gray-500">{txt.original}</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-1 border-x border-gray-200">
                                <Truck className="text-gray-400" size={20}/>
                                <span className="text-[10px] font-bold text-gray-500">{txt.shipping}</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-1">
                                <RotateCcw className="text-gray-400" size={20}/>
                                <span className="text-[10px] font-bold text-gray-500">{txt.warranty}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Reviews Summary */}
                        <div className="flex items-center gap-6 mb-8 bg-gray-50 p-6 rounded-2xl">
                            <div className="text-center">
                                <div className="text-4xl font-black text-gray-900">4.8</div>
                                <div className="flex text-amber-400 justify-center my-1">
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} fill="currentColor" />
                                    <Star size={16} fill="currentColor" className="text-gray-300" />
                                </div>
                                <p className="text-xs text-gray-400">{txt.basedOn} 120 {txt.ratings}</p>
                            </div>
                            <div className="flex-1 space-y-2">
                                {[5, 4, 3, 2, 1].map((star, i) => (
                                    <div key={star} className="flex items-center gap-2 text-xs">
                                        <span className="w-3 font-bold text-gray-500">{star}</span>
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-amber-400 rounded-full" 
                                                style={{ width: `${[70, 20, 5, 3, 2][i]}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reviews List */}
                        <div className="space-y-6">
                            {reviews.map(review => (
                                <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                <User size={14} className="text-gray-500"/>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900">{review.user}</h4>
                                                <div className="flex text-amber-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={10} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-200" : ""} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-400">{review.date}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                                </div>
                            ))}
                        </div>

                        {/* Write Review Placeholder */}
                        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                            <p className="text-sm text-gray-500 mb-3">Share your thoughts with other customers</p>
                            <Button variant="outline" fullWidth className="border-gray-300 text-gray-600 hover:border-black hover:text-black">
                                {txt.writeReview}
                            </Button>
                        </div>
                    </div>
                )}

            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 md:p-6 border-t border-gray-100 bg-white z-10">
             <div className="flex gap-3">
                 <div className="flex items-center bg-gray-100 rounded-xl px-2">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-gray-500 hover:text-black"><Minus size={16}/></button>
                    <span className="w-6 text-center font-bold text-sm">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-2 text-gray-500 hover:text-black"><Plus size={16}/></button>
                 </div>
                 <Button 
                   onClick={handleAddToCart}
                   fullWidth 
                   className="rounded-xl shadow-xl shadow-brand-black/20 flex items-center justify-center gap-2"
                 >
                    <ShoppingBag size={18} />
                    {txt.addToCart}
                 </Button>
                 <button className="p-3.5 border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Heart size={20} />
                 </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};