
import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Search, Filter } from 'lucide-react';
import { MOCK_PRODUCTS } from '../services/db';
import { Product, StoreCategory } from '../types';
import ProductCard from './ProductCard';
import Footer from './Footer';

interface ShopViewProps {
  onProductClick: (product: Product) => void;
}

const ShopView: React.FC<ShopViewProps> = ({ onProductClick }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [activeCat, setActiveCat] = useState('الكل');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubP = onSnapshot(query(collection(db, "products"), orderBy("createdAt", "desc")), (s) => {
      setProducts(!s.empty ? s.docs.map(doc => ({ id: doc.id, ...doc.data() })) : MOCK_PRODUCTS);
      setLoading(false);
    }, () => {
      setProducts(MOCK_PRODUCTS);
      setLoading(false);
    });

    const unsubC = onSnapshot(query(collection(db, "categories"), orderBy("name", "asc")), (s) => {
      setCategories(s.docs.map(d => ({id: d.id, ...d.data()} as any)));
    });

    return () => { unsubP(); unsubC(); };
  }, []);

  const filteredProducts = products.filter(p => {
    const nameMatch = (p?.name || "").toString().toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = activeCat === 'الكل' || p.category === activeCat;
    return nameMatch && categoryMatch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 overflow-x-hidden" dir="rtl">
      <div className="p-4">
        <header className="flex flex-col gap-4 py-4">
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">المتجر</h2>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="text" 
                placeholder="ابحثي عن قطعة مميزة..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-4 bg-white border border-gray-100 rounded-2xl text-xs font-bold outline-none shadow-sm"
              />
            </div>
            <button className="bg-white border border-gray-100 p-4 rounded-2xl text-gray-300"><Filter size={20}/></button>
          </div>
        </header>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <button 
            onClick={() => setActiveCat('الكل')}
            className={`px-8 py-2.5 rounded-full text-[10px] font-black border transition-all ${activeCat === 'الكل' ? 'bg-[#FF4500] text-white border-[#FF4500] shadow-lg shadow-orange-500/20' : 'bg-white text-gray-400 border-gray-100'}`}
          >
            الكل
          </button>
          {categories.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCat(cat.name)}
              className={`px-8 py-2.5 rounded-full text-[10px] font-black border transition-all ${activeCat === cat.name ? 'bg-[#FF4500] text-white border-[#FF4500] shadow-lg shadow-orange-500/20' : 'bg-white text-gray-400 border-gray-100'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 pb-12">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onClick={onProductClick}
              onAddToCart={(e) => { e.stopPropagation(); onProductClick(product); }}
            />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ShopView;
