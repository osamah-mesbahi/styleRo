
import React from 'react';
import { ShoppingCart, Heart, Tag } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  onAddToCart: (e: React.MouseEvent, product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onAddToCart }) => {
  const finalPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <div 
      onClick={() => onClick(product)}
      className="bg-white p-3 rounded-[2.5rem] shadow-sm border border-gray-50 group cursor-pointer hover:shadow-md transition-all animate-in fade-in"
    >
      <div className="relative aspect-[3/4] mb-3 overflow-hidden rounded-[2rem] bg-gray-50">
        <img 
          src={product.image} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          alt={product.name} 
        />
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="absolute top-3 left-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm text-gray-300 hover:text-[#FF4500] transition-colors"
        >
          <Heart size={14}/>
        </button>
        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-[#FF4500] text-white text-[8px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
            <Tag size={8}/> خصم
          </div>
        )}
      </div>
      <div className="px-2 pb-2">
        <h3 className="text-[11px] font-bold text-gray-800 mb-2 line-clamp-1">{product.name}</h3>
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[9px] text-gray-300 line-through mb-0.5">{(product.price).toLocaleString()}</span>
            )}
            <span className="text-[#FF4500] font-black text-sm">
              {(finalPrice || 0).toLocaleString()} 
              <span className="text-[9px] font-medium opacity-60 mr-1">ر.ي</span>
            </span>
          </div>
          <button 
            onClick={(e) => onAddToCart(e, product)}
            className="bg-brand-black text-white p-2.5 rounded-xl hover:bg-[#FF4500] transition-colors shadow-lg shadow-black/5"
          >
            <ShoppingCart size={10}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
