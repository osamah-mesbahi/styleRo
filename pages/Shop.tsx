
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ShoppingCart, Heart, Loader2, Beaker, Palette, Ruler, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Currency, Product, StoreSettings } from '../types';
import { SAR_TO_YER_RATE, MAIN_CATEGORIES as DEFAULT_CATEGORIES } from '../constants';
import { getProducts, searchProducts } from '../services/firestoreService';

interface ShopProps {
  currency: Currency;
  addToCart: (product: Product, size?: string, color?: string, volume?: string) => void;
  settings: StoreSettings;
  selectedCategory?: string | null;
  searchQuery?: string;
  navigateTo?: (view: string, category?: string | null) => void;
}

const Shop: React.FC<ShopProps> = ({ currency, addToCart, settings, selectedCategory, searchQuery, navigateTo }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const placeholderImg = 'https://via.placeholder.com/600x800?text=No+Image';
  const getImg = (p?: Product) => p?.images && p.images.length > 0 ? p.images[0] : placeholderImg;

  const activeMainCat = selectedCategory || 'الكل';

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedVolume, setSelectedVolume] = useState('');
  const [banners, setBanners] = useState(settings.banners || []);
  const [bannerIndex, setBannerIndex] = useState(0);

  const safeParse = <T,>(key: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch (e) {
      localStorage.removeItem(key);
      return fallback;
    }
  };

  // Horizontal scrolling controls for the sticky category bar
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollLeft = () => scrollerRef.current?.scrollBy({ left: -250, behavior: 'smooth' });
  const scrollRight = () => scrollerRef.current?.scrollBy({ left: 250, behavior: 'smooth' });

  // Horizontal scrolling controls for products
  const productsRef = useRef<HTMLDivElement>(null);
  const scrollProductsLeft = () => productsRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  const scrollProductsRight = () => productsRef.current?.scrollBy({ left: 300, behavior: 'smooth' });

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const id = setInterval(() => {
      if (!el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 50, behavior: 'smooth' });
      }
    }, 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = productsRef.current;
    if (!el) return;
    const id = setInterval(() => {
      if (!el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 100, behavior: 'smooth' });
      }
    }, 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts(100).then(result => {
      setProducts(result.products);
      localStorage.setItem('stylero_products', JSON.stringify(result.products));
      setLoading(false);
    }).catch(err => {
      console.error('Error loading products:', err);
      const savedProducts = safeParse<Product[]>('stylero_products', []);
      if (savedProducts.length) setProducts(savedProducts);
      setLoading(false);
    });

    const savedCats = safeParse<any[]>('stylero_categories', DEFAULT_CATEGORIES);
    setCategories(savedCats);
  }, []);

  useEffect(() => {
    if (!banners.length) return;
    setBannerIndex(0);
    const timer = setInterval(() => {
      setBannerIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  const formatPrice = (priceSAR: number) => {
    if (currency === 'SAR') return `${priceSAR} ر.س`;
    return `${(priceSAR * SAR_TO_YER_RATE).toLocaleString()} ر.ي`;
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => activeMainCat === 'الكل' || p.category === activeMainCat);
  }, [products, activeMainCat]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const hasVariations = (product.sizes?.length ?? 0) > 0 || (product.colors?.length ?? 0) > 0 || (product.volumes?.length ?? 0) > 0;
    if (hasVariations) {
      setSelectedProduct(product);
      setSelectedSize('');
      setSelectedColor('');
      setSelectedVolume('');
    } else {
      addToCart(product);
    }
  };

  if (loading) return (
    <div className="bg-[#0b0b0f] min-h-screen flex flex-col items-center justify-center gap-3">
      <Loader2 className="animate-spin text-primary" size={32} />
      <p className="font-extrabold text-gray-400 text-[10px]">جاري التحميل...</p>
    </div>
  );

  if (!loading && filteredProducts.length === 0) {
    return (
      <div className="bg-[#0b0b0f] min-h-screen flex flex-col items-center justify-center gap-4 text-center" dir="rtl">
        <p className="font-extrabold text-gray-300 text-sm">لا توجد منتجات لعرضها حالياً.</p>
        <div className="flex gap-3">
          <button onClick={() => setSearchParams({ cat: 'الكل' })} className="btn-primary text-[11px] px-5 py-2 rounded-full">إظهار الكل</button>
          <button onClick={() => window.location.reload()} className="text-[11px] font-extrabold text-primary hover:text-white">تحديث الصفحة</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0b0b0f] min-h-screen text-white max-w-7xl mx-auto pb-16" dir="rtl">

      {/* Sticky category bar aligned with header height + smooth horizontal controls */}
      <div className="sticky z-40 bg-black/95 backdrop-blur-md border-b border-white/10 shadow-sm overflow-hidden" style={{ top: 'calc(env(safe-area-inset-top) + var(--header-height))' }}>
        <div className="relative">
          <div ref={scrollerRef} className="flex overflow-x-auto px-4 py-3 gap-3 no-scrollbar scroll-smooth">
          <button onClick={() => navigateTo && navigateTo('SHOP', 'الكل')} className={`flex-shrink-0 px-6 py-2 rounded-full text-[10px] font-extrabold transition-all ${activeMainCat === 'الكل' ? 'btn-primary' : 'bg-white/5 border border-white/10 text-white hover:border-primary hover:text-primary'}`}>الكل</button>
          {categories.map(cat => (
            <button key={cat.name} onClick={() => navigateTo && navigateTo('SHOP', cat.name)} className={`flex-shrink-0 px-6 py-2 rounded-full text-[10px] font-extrabold transition-all flex items-center gap-2 ${activeMainCat === cat.name ? 'btn-primary' : 'bg-white/5 border border-white/10 text-white hover:border-primary hover:text-primary'}`}>
              <img src={cat.icon} className="w-4 h-4 object-contain rounded-full" />
              {cat.name}
            </button>
          ))}
          </div>
          {/* Scroll controls */}
          <button aria-label="scroll left" onClick={scrollLeft} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white shadow-sm border border-white/10 rounded-full p-2 hidden sm:flex">
            <ChevronLeft size={16} />
          </button>
          <button aria-label="scroll right" onClick={scrollRight} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white shadow-sm border border-white/10 rounded-full p-2 hidden sm:flex">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {banners.length > 0 && (
        <div className="px-4 mt-4">
          <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/5 shadow-sm">
            <div className="relative h-48 md:h-64">
              {banners.map((b, idx) => (
                <div key={b.id} className={`absolute inset-0 transition-opacity duration-700 ${idx === bannerIndex ? 'opacity-100 z-10' : 'opacity-0'} ${idx === bannerIndex ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                  {b.image ? <img src={b.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">بانر بدون صورة</div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent p-4 md:p-6 flex flex-col justify-end gap-1 text-white">
                    <div className="font-extrabold text-lg md:text-xl line-clamp-2">{b.title || 'بانر'}</div>
                    {b.subtitle && <div className="text-[11px] md:text-[12px] opacity-90 line-clamp-2">{b.subtitle}</div>}
                    {b.ctaLabel && b.ctaLink && (
                      <button onClick={() => navigateTo && navigateTo('SHOP', b.ctaLink)} className="inline-flex items-center gap-2 text-[11px] font-extrabold bg-white text-black px-3 py-1 rounded-full w-fit hover:bg-primary hover:text-white transition">
                        {b.ctaLabel} <ArrowRight size={12}/>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {banners.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setBannerIndex(i)} className={`w-2.5 h-2.5 rounded-full transition ${i === bannerIndex ? 'bg-white' : 'bg-white/50'}`}></button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="px-4 mt-8">
        <div className="relative">
          <div ref={productsRef} className="flex overflow-x-auto gap-4 md:gap-6 no-scrollbar scroll-smooth pb-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="flex-shrink-0 w-48 md:w-56 bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/60 transition-all group relative">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img src={getImg(product)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <span className="absolute top-3 right-3 bg-primary text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow">
                    {product.storeName}
                  </span>
                  <button className="absolute top-3 left-3 w-9 h-9 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white/80 hover:text-primary transition shadow-sm z-10" onClick={(e) => e.stopPropagation()} aria-label="wishlist">
                     <Heart size={16} />
                  </button>
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="text-sm font-extrabold leading-snug text-white line-clamp-2">{product.name}</h3>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-primary font-extrabold text-sm">{formatPrice(product.discountPriceSAR || product.priceSAR)}</span>
                    {product.discountPriceSAR && <span className="text-[9px] text-gray-300 line-through">{formatPrice(product.priceSAR)}</span>}
                    <button onClick={(e) => handleQuickAdd(e, product)} className="text-[11px] font-extrabold text-black bg-white px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all">
                      أضف للسلة
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Scroll controls for products */}
          <button aria-label="scroll products left" onClick={scrollProductsLeft} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white shadow-sm border border-white/10 rounded-full p-2 hidden sm:flex">
            <ChevronLeft size={16} />
          </button>
          <button aria-label="scroll products right" onClick={scrollProductsRight} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white shadow-sm border border-white/10 rounded-full p-2 hidden sm:flex">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Variation Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedProduct(null)}></div>
          <div className="bg-[#0b0b0f] border border-white/10 w-full max-w-md md:rounded-[2.5rem] rounded-t-[2.5rem] relative animate-slide-in-right shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
             <div className="p-8 overflow-y-auto no-scrollbar">
                <div className="flex gap-6 mb-8">
                  <div className="w-24 h-32 bg-white/10 rounded-2xl overflow-hidden border border-white/10">
                    <img src={getImg(selectedProduct)} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-extrabold text-lg leading-tight text-white">{selectedProduct.name}</h3>
                    <p className="text-xl font-extrabold text-primary">{formatPrice(selectedProduct.discountPriceSAR || selectedProduct.priceSAR)}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {selectedProduct.volumes?.length > 0 && (
                    <div className="space-y-3">
                      <label className="text-[9px] font-extrabold text-gray-400 flex items-center gap-2 uppercase"><Beaker size={12}/> الحجم</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.volumes.map(v => (
                          <button key={v} onClick={() => setSelectedVolume(v)} className={`px-4 py-2 rounded-xl font-extrabold text-[10px] border-2 transition-all ${selectedVolume === v ? 'btn-primary' : 'bg-white/5 border border-white/10 text-white hover:border-primary hover:text-primary'}`}>{v}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedProduct.sizes?.length > 0 && (
                    <div className="space-y-3">
                      <label className="text-[9px] font-extrabold text-gray-400 flex items-center gap-2 uppercase"><Ruler size={12}/> المقاس</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.sizes.map(s => (
                          <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2 rounded-xl font-extrabold text-[10px] border-2 transition-all ${selectedSize === s ? 'btn-primary' : 'bg-white/5 border border-white/10 text-white hover:border-primary hover:text-primary'}`}>{s}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedProduct.colors?.length > 0 && (
                    <div className="space-y-3">
                      <label className="text-[9px] font-extrabold text-gray-400 flex items-center gap-2 uppercase"><Palette size={12}/> اللون</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.colors.map(c => (
                          <button key={c} onClick={() => setSelectedColor(c)} className={`px-4 py-2 rounded-xl font-extrabold text-[10px] border-2 transition-all ${selectedColor === c ? 'btn-primary' : 'bg-white/5 border border-white/10 text-white hover:border-primary hover:text-primary'}`}>{c}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
             </div>
             <div className="p-8 bg-black/50 border-t border-white/10">
                <button
                  onClick={() => {
                    addToCart(selectedProduct, selectedSize, selectedColor, selectedVolume);
                    setSelectedProduct(null);
                  }}
                  className="w-full btn-primary py-4 rounded-2xl font-extrabold text-base shadow-xl flex items-center justify-center gap-3"
                >
                  <ShoppingCart size={20} /> أضف إلى السلة
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;

