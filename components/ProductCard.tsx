import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ShoppingBag, Heart, Eye, Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size?: string, color?: string) => void;
  onClick: (product: Product) => void;
  formattedPrice: React.ReactNode;
  addToCartLabel: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onClick, formattedPrice, addToCartLabel }) => {
  // Local state for variant selection
  const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes?.[0] || null);
  const [selectedColor, setSelectedColor] = useState<string | null>(product.colors?.[0] || null);

  // Update local state if product props change (e.g. data refresh)
  useEffect(() => {
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    if (product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
  }, [product]);

  const hasSizes = product.sizes && product.sizes.length > 0;
  const hasColors = product.colors && product.colors.length > 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedSize || undefined, selectedColor || undefined);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(product);
  };

  return (
    <div 
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 border border-gray-100 cursor-pointer h-full"
      onClick={() => onClick(product)}
    >
      {/* Wishlist Icon */}
      <button 
        className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 transition-colors shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <Heart size={18} />
      </button>

      {/* Discount Badge */}
      {product.discountPrice && product.discountPrice < product.price && (
        <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
          -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
        </div>
      )}

      {/* Image Section */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 p-4">
        <img 
          src={product.image} 
          alt={product.name} 
          className="h-full w-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Quick View Overlay Button */}
        <div className="hidden md:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button 
                onClick={handleQuickView}
                className="bg-white/90 backdrop-blur-md text-brand-black p-3 rounded-full shadow-xl hover:bg-brand-black hover:text-white transition-all transform hover:scale-110"
                title="Quick View"
            >
                <Eye size={22} />
            </button>
        </div>
        
        {/* Quick Add Overlay - Desktop */}
        <div className="hidden md:block absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
             <button 
                onClick={handleQuickAdd}
                className="w-full bg-brand-black text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-gray-800 transition-colors"
             >
                <ShoppingBag size={16} /> {addToCartLabel}
             </button>
        </div>
      </div>
      
      {/* Info Section */}
      <div className="p-3 flex flex-col flex-grow">
        <div className="mb-2">
            <span className="text-[10px] font-bold text-brand-accent bg-brand-soft px-2 py-0.5 rounded-md">
                {product.category}
            </span>
            {product.storeName && (
              <span className="text-[9px] text-gray-400 block mt-1 truncate">{product.storeName}</span>
            )}
        </div>
        
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-relaxed mb-1 min-h-[2.5rem] group-hover:text-brand-accent transition-colors">
          {product.name}
        </h3>

        {/* Color Swatches */}
        {hasColors && (
            <div className="flex gap-1.5 mb-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                {product.colors!.slice(0, 4).map((color, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        className={`w-4 h-4 rounded-full border shadow-sm transition-transform hover:scale-110 ${selectedColor === color ? 'ring-2 ring-brand-black ring-offset-1' : 'border-gray-200'}`}
                        style={{ backgroundColor: color }}
                    />
                ))}
                 {product.colors!.length > 4 && (
                    <span className="text-[9px] text-gray-400 flex items-center">+{product.colors!.length - 4}</span>
                 )}
            </div>
        )}

        {/* Size Chips */}
        {hasSizes && (
            <div className="flex gap-1.5 mb-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                {product.sizes!.slice(0, 4).map((size, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedSize(size)}
                        className={`
                           h-6 min-w-[24px] px-1 rounded-md text-[10px] font-bold border transition-colors
                           ${selectedSize === size 
                             ? 'bg-brand-black text-white border-brand-black' 
                             : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}
                        `}
                    >
                        {size}
                    </button>
                ))}
                {product.sizes!.length > 4 && (
                    <span className="text-[9px] text-gray-400 flex items-center">+{product.sizes!.length - 4}</span>
                 )}
            </div>
        )}
        
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-gray-50">
          <div className="text-base text-brand-black w-full">{formattedPrice}</div>
          
          <button 
                onClick={handleQuickAdd}
                className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all shadow-sm
                    ${(hasSizes && !selectedSize) || (hasColors && !selectedColor) 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-brand-gray text-brand-black hover:bg-brand-black hover:text-white'}
                `}
                title={hasSizes ? "Select options" : "Add to cart"}
          >
              <Plus size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
};