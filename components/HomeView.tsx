
import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Plus, Sparkles, ChevronLeft, Truck, CreditCard, ShieldCheck, ShoppingBag, Globe, ExternalLink } from 'lucide-react';
import { MOCK_PRODUCTS } from '../services/db';
import { Product, StoryGroup, GlobalStore } from '../types';
import ProductCard from './ProductCard';
import Footer from './Footer';

interface HomeViewProps {
  onProductClick: (product: Product) => void;
  onViewAll: () => void;
  onGlobalOrder: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onProductClick, onViewAll, onGlobalOrder }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [stories, setStories] = useState<StoryGroup[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [globalStores, setGlobalStores] = useState<GlobalStore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubP = onSnapshot(
      query(collection(db, "products"), orderBy("createdAt", "desc")), 
      (s) => {
        if (!s.empty) {
          setProducts(s.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          setProducts(MOCK_PRODUCTS);
        }
        setLoading(false);
      }, 
      () => {
        setProducts(MOCK_PRODUCTS);
        setLoading(false);
      }
    );

    const unsubS = onSnapshot(query(collection(db, "stories")), (s) => {
      setStories(s.docs.map(d => ({id: d.id, ...d.data()} as any)));
    });

    const unsubB = onSnapshot(query(collection(db, "banners"), orderBy("createdAt", "desc")), (s) => {
      setBanners(s.docs.map(d => ({id: d.id, ...d.data()} as any)));
    });

    const unsubGS = onSnapshot(query(collection(db, "global_stores")), (s) => {
      setGlobalStores(s.docs.map(d => ({id: d.id, ...d.data()} as any)));
    });

    return () => { unsubP(); unsubS(); unsubB(); unsubGS(); };
  }, []);

  return (
    <div className="animate-in fade-in duration-700 overflow-x-hidden bg-[#FDFDFD]" dir="rtl">
      
      {/* Welcome Section */}
      <section className="px-6 pt-12 pb-6 text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
          أهلاً بك في متجر <span className="text-[#FF4500] italic">ستايل رو</span>
        </h1>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">وجهتك الأولى للتسوق الإلكتروني</p>
      </section>

      {/* Stories Section */}
      <section className="px-6 py-4 overflow-x-auto no-scrollbar flex gap-5 mb-4">
        <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer">
          <div className="w-16 h-16 rounded-full border-2 border-orange-500 p-0.5 shadow-lg relative group">
            <div className="w-full h-full rounded-full bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-100 transition-all">
              <Plus size={20} strokeWidth={3} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-slate-900 text-white rounded-full p-0.5 border-2 border-white"><Sparkles size={8}/></div>
          </div>
          <span className="text-[9px] font-black text-slate-800 tracking-tighter">قصتك</span>
        </div>
        
        {stories.map((group, idx) => (
          <div key={idx} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
            <div className="w-16 h-16 rounded-full border-2 border-orange-500 p-0.5 group-hover:scale-105 transition-all">
              <img src={group.thumbnail} className="w-full h-full rounded-full object-cover border-2 border-white" alt="" />
            </div>
            <span className="text-[9px] font-black text-slate-500 group-hover:text-orange-600 transition-all tracking-tighter">{group.name}</span>
          </div>
        ))}
      </section>

      {/* Services Highlights */}
      <section className="px-6 grid grid-cols-3 gap-3 mb-10">
        <FeatureItem icon={<Truck size={18}/>} title="توصيل سريع" desc="3-5 أيام" color="bg-orange-50 text-orange-600" />
        <FeatureItem icon={<CreditCard size={18}/>} title="دفع آمن" desc="عند الاستلام" color="bg-blue-50 text-blue-600" />
        <FeatureItem icon={<ShieldCheck size={18}/>} title="ضمان الجودة" desc="أصلي 100%" color="bg-emerald-50 text-emerald-600" />
      </section>

      {/* Hero Banners Section */}
      <section className="px-4 mb-12 space-y-4">
        {banners.length > 0 ? (
          banners.map((banner, idx) => (
            <div key={idx} onClick={onViewAll} className="bg-[#1a1c2e] rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200 group cursor-pointer transition-all hover:scale-[1.01]">
              <div className="relative z-10">
                {banner.badge && (
                  <span className="bg-orange-600 text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-[0.2em] shadow-lg shadow-orange-600/20">
                    {banner.badge}
                  </span>
                )}
                <h2 className="text-2xl font-black mt-4 mb-2 leading-tight tracking-tighter">{banner.title}</h2>
                <p className="text-gray-400 text-[10px] mb-6 font-black opacity-80 leading-relaxed max-w-[200px]">{banner.description}</p>
                <button className="bg-white text-black px-8 py-3 rounded-2xl font-black text-[10px] shadow-xl active:scale-95 transition-all flex items-center gap-2">
                  {banner.buttonText || 'تسوقي الآن'}
                  <ChevronLeft size={14}/>
                </button>
              </div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-600/20 rounded-full blur-[100px] group-hover:bg-orange-600/30 transition-all"></div>
            </div>
          ))
        ) : (
          <div onClick={onViewAll} className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl group cursor-pointer">
            <div className="relative z-10">
              <span className="bg-[#FF4500] text-[9px] px-3 py-1.5 rounded-full font-black uppercase tracking-[0.2em]">وصل حديثاً</span>
              <h2 className="text-2xl font-black mt-4 mb-2 leading-tight tracking-tighter">أفضل المنتجات<br/>بأسعار منافسة</h2>
              <p className="text-gray-400 text-[10px] mb-6 font-black opacity-80">تسوقي الآن تشكيلة 2026 الحصرية</p>
              <button className="bg-white text-black px-8 py-3 rounded-2xl font-black text-[10px]">تصفح المنتجات</button>
            </div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-orange-600/20 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity"></div>
          </div>
        )}
      </section>

      {/* Global Shopping Section */}
      <section className="px-6 mb-12">
        <div className="flex flex-col mb-6">
          <h3 className="font-black text-xl text-slate-800 tracking-tighter">تسوق من العالم</h3>
          <div className="w-12 h-1 bg-[#FF4500] rounded-full mt-1"></div>
        </div>
        
        <div className="space-y-4">
          {globalStores.length > 0 ? (
            globalStores.map(store => (
              <GlobalStoreCard 
                key={store.id}
                onClick={onGlobalOrder}
                name={store.name} 
                desc={store.description || `اطلب أزياءك المفضلة من ${store.name} وسنوصلها لباب بيتك.`} 
                icon={<img src={store.image} className="w-8 h-8 object-contain" />} 
                color="bg-white" 
                textColor="text-slate-900"
              />
            ))
          ) : (
            <>
              <GlobalStoreCard 
                onClick={onGlobalOrder}
                name="شي إن (Shein)" 
                desc="اطلب أزياءك المفضلة من شي إن وسنوصلها لباب بيتك." 
                icon={<ShoppingBag size={24}/>} 
                color="bg-black" 
                textColor="text-white"
              />
              <GlobalStoreCard 
                onClick={onGlobalOrder}
                name="أمازون (Amazon)" 
                desc="تسوق من أكبر متجر في العالم، ونحن نتكفل بالشحن والجمارك." 
                icon={<Globe size={24}/>} 
                color="bg-[#FF9900]" 
                textColor="text-slate-900"
              />
            </>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="px-6 pb-20">
        <div className="flex justify-between items-center mb-8">
          <div className="flex flex-col">
            <h3 className="font-black text-xl text-slate-800 tracking-tighter">وصل حديثاً</h3>
            <div className="w-10 h-1 bg-orange-600 rounded-full mt-1"></div>
          </div>
          <button 
            onClick={onViewAll}
            className="text-gray-400 text-[10px] font-black border border-gray-100 px-4 py-2 rounded-xl bg-white shadow-sm hover:text-orange-600 transition-colors tracking-tighter"
          >
            عرض الكل
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-5">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-72 bg-gray-50 rounded-[2.5rem] animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={onProductClick}
                onAddToCart={(e) => { e.stopPropagation(); onProductClick(product); }}
              />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

const FeatureItem = ({ icon, title, desc, color }: any) => (
  <div className="flex flex-col items-center text-center space-y-2">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} shadow-sm`}>{icon}</div>
    <div className="space-y-0.5">
      <h4 className="text-[10px] font-black text-slate-800 whitespace-nowrap">{title}</h4>
      <p className="text-[8px] font-bold text-gray-400">{desc}</p>
    </div>
  </div>
);

const GlobalStoreCard = ({ name, desc, icon, color, textColor, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`p-6 rounded-[2.5rem] border border-gray-100 bg-white shadow-sm flex items-center gap-5 group hover:shadow-md transition-all cursor-pointer`}
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} ${textColor} shadow-lg shrink-0 overflow-hidden`}>
      {icon}
    </div>
    <div className="flex-1">
      <h4 className="font-black text-sm text-slate-800">{name}</h4>
      <p className="text-[10px] text-gray-400 font-bold leading-relaxed">{desc}</p>
      <button className="mt-3 text-[10px] font-black text-[#FF4500] flex items-center gap-1 group-hover:gap-2 transition-all">
        اطلب الآن <ChevronLeft size={12}/>
      </button>
    </div>
  </div>
);

export default HomeView;
