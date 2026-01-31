import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Menu, X, ChevronDown, User, MessageCircle, Search, Grid, Truck, ShieldCheck, CreditCard, Home } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Product, CartItem, ViewState, StoreSettings, Order, StoreCategory, User as UserType, DeliveryRule } from './types';
import { ProductCard } from './components/ProductCard';
import { Button } from './components/Button';
import { CartDrawer } from './components/CartDrawer';
import { ChatWidget } from './components/ChatWidget';
import { ProductDetails } from './components/ProductDetails';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { UserLogin } from './components/UserLogin';
import Shop from './components/Shop';
import Footer from './components/Footer';
import { authFetch } from './src/api';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firebaseSignOut } from './src/firebase';
import { getUserProfile } from './services/firestoreService';
import { initializeChat } from './services/geminiService';
import { PHONE as SUPPORT_PHONE } from './constants';
import { 
  fetchProducts, 
  addProductToDb, 
  removeProductFromDb, 
  fetchSettings, 
  saveSettingsToDb, 
  fetchOrders, 
  addOrderToDb, 
  updateOrderStatusInDb 
} from './services/db';

const INITIAL_CATEGORIES: StoreCategory[] = [
  { id: '1', name: 'Makeup', nameAr: 'مكياج', image: 'https://images.unsplash.com/photo-1596462502278-27bfdd403cc2?auto=format&fit=crop&q=80&w=200', branches: ['Face', 'Eyes', 'Lips'], branchesAr: ['وجه', 'عيون', 'شفاه'] },
  { id: '2', name: 'Perfume', nameAr: 'عطور', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=200', branches: ['Men', 'Women', 'Oud'], branchesAr: ['رجالي', 'نسائي', 'عود'] },
  { id: '3', name: 'Care', nameAr: 'عناية', image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=200', branches: ['Skin', 'Hair', 'Body'], branchesAr: ['بشرة', 'شعر', 'جسم'] },
];

const INITIAL_DELIVERY_RULES: DeliveryRule[] = [
    { city: 'Sana\'a', cityAr: 'صنعاء', fee: 1000, depositRequired: true, depositPercentage: 70, active: true },
    { city: 'Aden', cityAr: 'عدن', fee: 2000, depositRequired: true, depositPercentage: 70, active: true },
];

const INITIAL_SETTINGS: StoreSettings = {
  name: "StyleRo",
  currency: 'YER',
  exchangeRate: 140,
  logo: "",
  colors: { primary: '#212121', accent: '#D44D7D' },
  socialMedia: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    whatsapp: "https://wa.me/967772728311",
    twitter: "",
    email: "stylero.online@gmail.com"
  },
  paymentInstructions: {
    kurimi: { name: "متجر ستايلرو", account: "1234567" },
    wallet: { name: "ستايلرو أونلاين", number: "772728311", type: "ون كاش / الكريمي" }
  },
  paymentMethods: [],
  storeCategories: INITIAL_CATEGORIES,
  globalStores: [],
  deliveryRules: INITIAL_DELIVERY_RULES,
  sections: {
    hero: { enabled: true, title: "Summer Beauty Sale", subtitle: "Up to 50% off on premium brands", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1920" },
    categories: { enabled: true, womenImage: "", menImage: "" },
    featured: { enabled: true, title: "Best Sellers" }
  }
};

const translations = {
  en: {
    home: "Home", shop: "Categories", orders: "Orders", signIn: "Login", cart: "Cart", shopNow: "Shop Now", addToCart: "Add to Bag",
    search: "Search for brands, products...", account: "Account",
    fastDelivery: "Fast Delivery", yemeniStyle: "Style with Passion", signOut: "Sign Out",
    shopByCategory: "Top Categories", featuredTitle: "Selected For You",
    allCategories: "All Categories",
    trust: { original: "Original Products", shipping: "Fast Shipping", secure: "Secure Payment" }
  },
  ar: {
    home: "الرئيسية", shop: "الأقسام", orders: "طلباتي", signIn: "دخول", cart: "السلة", shopNow: "تسوق الآن", addToCart: "إضافة للسلة",
    search: "ابحث عن ماركة، منتج...", account: "حسابي",
    fastDelivery: "توصيل سريع", yemeniStyle: "أناقة بشغف يمني", signOut: "تسجيل الخروج",
    shopByCategory: "أبرز الأقسام", featuredTitle: "اخترنا لك",
    allCategories: "جميع الأقسام",
    trust: { original: "منتجات أصلية", shipping: "شحن سريع", secure: "دفع آمن" }
  }
};

interface HeaderProps {
  setIsSidebarOpen: (open: boolean) => void;
  navigateTo: (view: ViewState, cat?: string | null) => void;
  storeSettings: StoreSettings;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  t: any;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  setIsCartOpen: (open: boolean) => void;
  cart: CartItem[];
  user: UserType | null;
}

const Header: React.FC<HeaderProps> = ({ 
  setIsSidebarOpen, navigateTo, storeSettings, searchQuery, setSearchQuery, t, language, setLanguage, setIsCartOpen, cart, user 
}) => {
  const isRtl = language === 'ar';
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-100 transition-all">
      <div className="hidden md:block bg-brand-black text-white py-1.5 px-4 text-xs font-medium text-center">{t.fastDelivery} | {t.yemeniStyle}</div>
      <div className="max-w-[1400px] mx-auto px-4 h-16 md:h-20 flex items-center justify-between gap-4">
         <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => navigateTo('HOME')}>
            <button onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(true); }} className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-full"><Menu size={24}/></button>
            {storeSettings.logo ? (
              <img src={storeSettings.logo} alt={storeSettings.name} className="w-9 h-9 md:w-11 md:h-11 rounded-xl object-cover border border-gray-200" />
            ) : (
              <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-brand-black text-white flex items-center justify-center font-black">
                {storeSettings.name?.slice(0, 1) || 'S'}
              </div>
            )}
            <h1 className="font-serif font-black text-2xl md:text-3xl tracking-tight text-brand-black">{storeSettings.name}</h1>
         </div>
         <div className="flex-1 max-w-2xl mx-auto hidden md:block">
            <div className="relative group">
               <input 
                 type="text" placeholder={t.search} value={searchQuery}
                 onChange={(e) => { setSearchQuery(e.target.value); if(e.target.value) navigateTo('SHOP'); }}
                 className={`w-full bg-gray-100/50 hover:bg-white text-sm py-3 rounded-full focus:bg-white focus:ring-2 focus:ring-brand-accent focus:outline-none transition-all ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} border border-transparent focus:border-transparent group-hover:border-gray-200`}
               />
               <Search className={`absolute top-3 text-gray-400 ${isRtl ? 'right-4' : 'left-4'}`} size={20} />
            </div>
         </div>
         <div className="flex items-center gap-1 md:gap-3 shrink-0">
             <button onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')} className="w-10 h-10 flex items-center justify-center font-bold text-xs rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all">{language === 'ar' ? 'EN' : 'AR'}</button>
             <button onClick={() => user ? navigateTo('ORDERS') : navigateTo('USER_LOGIN')} className="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-brand-accent hover:bg-gray-50 rounded-full transition-all">
                <User size={22}/>
             </button>
             <button onClick={() => setIsCartOpen(true)} className="relative w-10 h-10 flex items-center justify-center text-gray-700 hover:text-brand-accent hover:bg-gray-50 rounded-full transition-all">
                <ShoppingBag size={22}/>
                {cart.length > 0 && <span className="absolute top-1 right-0 bg-brand-accent text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold border-2 border-white">{cart.length}</span>}
             </button>
         </div>
      </div>
    </header>
  );
};

export const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('HOME');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(INITIAL_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [proofFiles, setProofFiles] = useState<Record<string, File | null>>({});
  const [uploadingProof, setUploadingProof] = useState<Record<string, boolean>>({});
  const [globalOrder, setGlobalOrder] = useState({
    storeId: '',
    productLink: '',
    extraLink: '',
    cartLink: '',
    size: '',
    color: '',
    quantity: 1,
    price: '',
    images: '',
    notes: ''
  });

  const t = translations[language];
  const isRtl = language === 'ar';
  const whatsappNumber = (storeSettings.socialMedia?.whatsapp || SUPPORT_PHONE || '').replace(/\D/g, '');
  const whatsappLink = whatsappNumber ? `https://wa.me/${772728311}` : 'https://wa.me/772728311';

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('stylero_user');
      if (storedUser) setUser(JSON.parse(storedUser));
      setIsAdmin(localStorage.getItem('stylero_is_admin') === '1');
    } catch {
      setUser(null);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setIsAdmin(false);
        localStorage.removeItem('stylero_user');
        localStorage.removeItem('stylero_is_admin');
        return;
      }

      const profile = await getUserProfile(fbUser.uid).catch(() => null);
      const isAdminEmail = (fbUser.email || '').toLowerCase() === 'admin@stylero.online';
      const nextUser = {
        id: fbUser.uid,
        name: profile?.name || fbUser.displayName || 'User',
        email: fbUser.email || '',
        phone: profile?.phone || '',
        address: profile?.address || '',
        isAdmin: Boolean(profile?.isAdmin || isAdminEmail)
      } as UserType;

      setUser(nextUser);
      setIsAdmin(Boolean(nextUser.isAdmin));
      localStorage.setItem('stylero_user', JSON.stringify(nextUser));
      localStorage.setItem('stylero_is_admin', nextUser.isAdmin ? '1' : '0');
    });

    return () => unsub();
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dbSettings, dbProducts, dbOrders] = await Promise.all([
        fetchSettings().catch(() => null), 
        fetchProducts().catch(() => []),
        fetchOrders(user?.id, isAdmin).catch(() => [])
      ]);

      if (dbSettings) {
        const merged = { ...INITIAL_SETTINGS, ...dbSettings };
        merged.paymentInstructions = {
          ...INITIAL_SETTINGS.paymentInstructions,
          ...(dbSettings.paymentInstructions || {})
        };
        merged.sections = {
          ...INITIAL_SETTINGS.sections,
          ...(dbSettings.sections || {})
        };
        merged.colors = {
          ...INITIAL_SETTINGS.colors,
          ...(dbSettings.colors || {})
        };
        merged.socialMedia = {
          ...INITIAL_SETTINGS.socialMedia,
          ...(dbSettings.socialMedia || {})
        };
        merged.storeCategories = Array.isArray(dbSettings.storeCategories) && dbSettings.storeCategories.length
          ? dbSettings.storeCategories
          : INITIAL_SETTINGS.storeCategories;
        merged.deliveryRules = Array.isArray(dbSettings.deliveryRules) && dbSettings.deliveryRules.length
          ? dbSettings.deliveryRules
          : INITIAL_SETTINGS.deliveryRules;
        merged.paymentMethods = Array.isArray(dbSettings.paymentMethods)
          ? dbSettings.paymentMethods
          : INITIAL_SETTINGS.paymentMethods;
        setStoreSettings(merged);
      } else {
        setStoreSettings(INITIAL_SETTINGS);
      }
      
      setProducts(dbProducts.length > 0 ? dbProducts : []);
      initializeChat(dbProducts || []);
      setOrders(dbOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isAdmin]);

  useEffect(() => { loadData(); }, [loadData]);

  const navigateTo = (newView: ViewState, category: string | null = null) => {
    setView(newView);
    setSelectedCategory(category);
    if (newView === 'HOME') setSearchQuery('');
    setIsSidebarOpen(false);
    setIsCartOpen(false);
  };

  const addToCart = (product: Product, size?: string, color?: string) => {
    const cartItemId = `${product.id}-${size || 'nosize'}-${color || 'nocolor'}`;
    setCart(prev => {
      const existing = prev.find(i => i.cartItemId === cartItemId);
      if (existing) return prev.map(i => i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1, cartItemId, selectedSize: size, selectedColor: color }];
    });
    setIsCartOpen(true);
  };

  const addGlobalOrderToCart = () => {
    const store = storeSettings.globalStores.find(s => s.id === globalOrder.storeId);
    if (!store || !globalOrder.productLink) return;
    const imgs = globalOrder.images
      ? globalOrder.images.split(',').map(i => i.trim()).filter(Boolean)
      : [];
    const price = Number(globalOrder.price || 0);
    const product: Product = {
      id: Date.now(),
      name: `${store.name} Order`,
      category: 'Global Store',
      price,
      image: imgs[0] || store.icon || store.image,
      images: imgs,
      description: globalOrder.notes || 'Global store order',
      storeName: store.name,
      productLink: globalOrder.productLink,
      cartLink: globalOrder.cartLink,
      orderNotes: globalOrder.notes,
      selectedSize: globalOrder.size,
      selectedColor: globalOrder.color,
      isGlobalOrder: true,
      globalStoreId: store.id
    };
    const qty = Math.max(1, Number(globalOrder.quantity || 1));
    const cartItemId = `${product.id}-${globalOrder.size || 'nosize'}-${globalOrder.color || 'nocolor'}`;
    setCart(prev => ([...prev, { ...product, quantity: qty, cartItemId, selectedSize: globalOrder.size, selectedColor: globalOrder.color }]));
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.cartItemId === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.cartItemId !== id));
  const clearCart = () => setCart([]);

  const fileToBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const handleGlobalImagesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const urls = await Promise.all(Array.from(files).map(fileToDataUrl));
    const existing = globalOrder.images
      ? globalOrder.images.split(',').map(i => i.trim()).filter(Boolean)
      : [];
    const merged = [...existing, ...urls].join(', ');
    setGlobalOrder({ ...globalOrder, images: merged });
  };

  const uploadProof = async (orderId: string) => {
    const file = proofFiles[orderId];
    if (!file) return null;
    setUploadingProof(prev => ({ ...prev, [orderId]: true }));
    try {
      const base64 = await fileToBase64(file);
      const res = await authFetch(`/orders/${orderId}/upload-proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofBase64: base64, proofFilename: file.name })
      });
      const data = await res.json();
      return data?.payment?.proofUrl || null;
    } catch {
      return null;
    } finally {
      setUploadingProof(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-brand-gray"><div className="animate-pulse flex flex-col items-center"><div className="w-16 h-16 bg-brand-accent rounded-full mb-4"></div><div className="h-4 w-32 bg-gray-200 rounded"></div></div></div>;

  if (view === 'ADMIN_LOGIN') return <AdminLogin onLogin={() => { setIsAdmin(true); setView('ADMIN_DASHBOARD'); }} onCancel={() => setView('HOME')} language={language} />;
  const handleLogout = () => {
    firebaseSignOut();
    localStorage.removeItem('stylero_token');
    localStorage.removeItem('stylero_user');
    localStorage.removeItem('stylero_is_admin');
    setUser(null);
    setIsAdmin(false);
    setView('HOME');
  };

  if (view === 'ADMIN_DASHBOARD') return <AdminDashboard products={products} onAddProduct={(p) => { addProductToDb(p); loadData(); }} onRemoveProduct={(id) => { removeProductFromDb(id); loadData(); }} settings={storeSettings} onUpdateSettings={(s) => { saveSettingsToDb(s); setStoreSettings(s); }} orders={orders} onUpdateOrderStatus={(id, s) => { updateOrderStatusInDb(id, s); loadData(); }} onLogout={handleLogout} language={language} />;
  if (view === 'USER_LOGIN') return <UserLogin onLogin={(u) => { setUser(u); setIsAdmin(false); setView('HOME'); }} onCancel={() => setView('HOME')} onAdminLoginRequest={() => setView('ADMIN_LOGIN')} language={language} />;

  let displayedProducts = selectedCategory 
    ? products.filter(p => p.category === selectedCategory || (storeSettings.storeCategories.find(c => c.name === selectedCategory)?.nameAr === p.category)) 
    : products;
  
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    displayedProducts = products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }

  return (
    <div className="min-h-screen bg-brand-gray text-brand-black flex flex-col font-sans" dir={isRtl ? 'rtl' : 'ltr'}>
      <Header 
        setIsSidebarOpen={setIsSidebarOpen} navigateTo={navigateTo} storeSettings={storeSettings} 
        searchQuery={searchQuery} setSearchQuery={setSearchQuery} t={t} 
        language={language} setLanguage={setLanguage} setIsCartOpen={setIsCartOpen} cart={cart} user={user} 
      />
      <main className="flex-grow">
        {view === 'HOME' && !searchQuery && (
          <div className="space-y-8 pb-10">
            <section className="max-w-[1400px] mx-auto px-4">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="text-lg font-bold">{isRtl ? 'القائمة' : 'Menu'}</h3>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg bg-gray-100 text-gray-600">
                  <Menu size={18} />
                </button>
              </div>

              {isSidebarOpen && (
                <div className="fixed inset-0 bg-black/50 z-[60] md:hidden" onClick={() => setIsSidebarOpen(false)} />
              )}
              <aside className={`fixed inset-y-0 z-[70] w-72 bg-white border-gray-100 p-4 transform transition-transform md:hidden ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} ${isSidebarOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')}`}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-sm">{isRtl ? 'الصفحة الرئيسية' : 'Home'}</h4>
                  <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg bg-gray-100 text-gray-600"><X size={16} /></button>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-gray-400">{isRtl ? 'الأقسام' : 'Categories'}</div>
                  <div className="space-y-1">
                    <button onClick={() => { navigateTo('SHOP'); setIsSidebarOpen(false); }} className="w-full text-sm text-gray-700 hover:text-brand-accent text-right">{t.shop}</button>
                    <button onClick={() => { navigateTo('ORDERS'); setIsSidebarOpen(false); }} className="w-full text-sm text-gray-700 hover:text-brand-accent text-right">{t.orders}</button>
                    <a href={whatsappLink} target="_blank" rel="noreferrer" className="w-full text-sm text-green-600 hover:text-green-700 text-right flex items-center gap-2">
                      <FaWhatsapp size={16} /> {isRtl ? 'واتساب' : 'WhatsApp'}
                    </a>
                    {storeSettings.storeCategories.map(cat => (
                      <button key={cat.id} onClick={() => { navigateTo('SHOP', cat.name); setIsSidebarOpen(false); }} className="w-full text-xs text-gray-600 hover:text-brand-accent text-right">
                        {isRtl ? (cat.nameAr || cat.name) : cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              </aside>

              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
                <aside className="hidden lg:block bg-white border border-gray-100 rounded-2xl p-4 sticky top-24 h-max">
                  <h4 className="font-bold text-sm mb-3">{isRtl ? 'الصفحة الرئيسية' : 'Home'}</h4>
                  <div className="space-y-2">
                    <div className="text-xs text-gray-400">{isRtl ? 'الأقسام' : 'Categories'}</div>
                    <div className="space-y-1">
                      <button onClick={() => navigateTo('SHOP')} className="w-full text-sm text-gray-700 hover:text-brand-accent text-right">{t.shop}</button>
                      <button onClick={() => navigateTo('ORDERS')} className="w-full text-sm text-gray-700 hover:text-brand-accent text-right">{t.orders}</button>
                      <a href={whatsappLink} target="_blank" rel="noreferrer" className="w-full text-sm text-green-600 hover:text-green-700 text-right flex items-center gap-2">
                        <FaWhatsapp size={16} /> {isRtl ? 'واتساب' : 'WhatsApp'}
                      </a>
                      {storeSettings.storeCategories.map(cat => (
                        <button key={cat.id} onClick={() => navigateTo('SHOP', cat.name)} className="w-full text-xs text-gray-600 hover:text-brand-accent text-right">
                          {isRtl ? (cat.nameAr || cat.name) : cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </aside>
                <div className="space-y-8">
            {storeSettings.sections?.hero?.enabled && (
               <section className="px-4 pt-4">
                <div className="max-w-[1400px] mx-auto relative rounded-3xl overflow-hidden aspect-[2/1] md:aspect-[3/1] bg-gray-200 shadow-lg group">
                  <img src={storeSettings.sections?.hero?.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent flex items-center px-8 md:px-20">
                        <div className="text-white max-w-lg space-y-4">
                      <h2 className="text-3xl md:text-5xl font-black leading-tight">{storeSettings.sections?.hero?.title}</h2>
                      <p className="text-white/90 text-sm md:text-lg">{storeSettings.sections?.hero?.subtitle}</p>
                           <Button onClick={() => navigateTo('SHOP')} className="bg-brand-accent text-white hover:bg-[#b03d66] border-none shadow-xl px-8 py-3 rounded-full text-sm">{t.shopNow}</Button>
                        </div>
                     </div>
                  </div>
               </section>
            )}

            <section className="max-w-[1400px] mx-auto px-4">
               <div className="grid grid-cols-3 gap-2 py-6 border-b border-gray-100">
                  <div className="flex flex-col items-center text-center gap-2">
                     <ShieldCheck className="text-blue-600" size={24} />
                     <h4 className="font-bold text-xs md:text-sm">{t.trust.original}</h4>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2 border-x border-gray-100">
                     <Truck className="text-green-600" size={24} />
                     <h4 className="font-bold text-xs md:text-sm">{t.trust.shipping}</h4>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2">
                     <CreditCard className="text-purple-600" size={24} />
                     <h4 className="font-bold text-xs md:text-sm">{t.trust.secure}</h4>
                  </div>
               </div>
            </section>

            {storeSettings.sections?.categories?.enabled && (
              <section className="max-w-[1400px] mx-auto px-4">
                <h3 className="text-lg md:text-xl font-bold mb-6">{t.shopByCategory}</h3>
                <div className="overflow-x-auto no-scrollbar -mx-4 px-4 pb-4">
                  <div className="flex gap-4 min-w-max">
                    {storeSettings.storeCategories.map(cat => (
                      <div key={cat.id} className="flex flex-col items-center gap-3 cursor-pointer group" onClick={() => navigateTo('SHOP', cat.name)}>
                        <div className="w-20 h-20 md:w-28 md:h-28 rounded-full p-1 border-2 border-transparent group-hover:border-brand-accent transition-all">
                          <div className="w-full h-full rounded-full overflow-hidden bg-white shadow-md">
                            <img src={cat.icon || cat.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          </div>
                        </div>
                        <span className="text-xs font-bold text-gray-700 group-hover:text-brand-accent">{isRtl ? (cat.nameAr || cat.name) : cat.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {storeSettings.sections?.featured?.enabled && (
              <section className="max-w-[1400px] mx-auto px-4">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">{t.featuredTitle}</h3>
                    <button onClick={() => navigateTo('SHOP')} className="text-sm font-bold text-brand-accent hover:underline">{t.shopNow}</button>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                   {products.slice(0, 10).map(p => (
                      <ProductCard key={p.id} product={p} onAddToCart={addToCart} onClick={setSelectedProduct} formattedPrice={<span className="font-bold">{p.discountPrice || p.price} {isRtl ? 'ر.ي' : 'YER'}</span>} addToCartLabel={t.addToCart} />
                   ))}
                 </div>
              </section>
            )}


            {storeSettings.globalStores?.length > 0 && (
              <section className="max-w-[1400px] mx-auto px-4">
                <details className="bg-white border border-gray-100 rounded-2xl p-6">
                  <summary className="cursor-pointer text-lg font-bold flex items-center justify-between">
                    <span>{isRtl ? 'قائمة المتاجر' : 'Store Orders'}</span>
                    <ChevronDown size={16} className="text-gray-400" />
                  </summary>
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <select value={globalOrder.storeId} onChange={(e) => setGlobalOrder({ ...globalOrder, storeId: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm">
                        <option value="">{isRtl ? 'اختر المتجر' : 'Select Store'}</option>
                        {storeSettings.globalStores.map(store => (
                          <option key={store.id} value={store.id}>{store.name}</option>
                        ))}
                      </select>
                      <input value={globalOrder.productLink} onChange={(e) => setGlobalOrder({ ...globalOrder, productLink: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder={isRtl ? 'رابط المنتج' : 'Product Link'} />
                      <input value={globalOrder.extraLink} onChange={(e) => setGlobalOrder({ ...globalOrder, extraLink: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder={isRtl ? 'أضف رابط' : 'Add Link'} />
                      <input value={globalOrder.cartLink} onChange={(e) => setGlobalOrder({ ...globalOrder, cartLink: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder={isRtl ? 'رابط السلة' : 'Cart Link'} />
                      <input value={globalOrder.size} onChange={(e) => setGlobalOrder({ ...globalOrder, size: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder={isRtl ? 'المقاس' : 'Size'} />
                      <input value={globalOrder.color} onChange={(e) => setGlobalOrder({ ...globalOrder, color: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder={isRtl ? 'اللون' : 'Color'} />
                      <input type="number" min={1} value={globalOrder.quantity} onChange={(e) => setGlobalOrder({ ...globalOrder, quantity: Number(e.target.value) })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder={isRtl ? 'الكمية' : 'Quantity'} />
                      <input value={globalOrder.price} onChange={(e) => setGlobalOrder({ ...globalOrder, price: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder={isRtl ? 'السعر' : 'Price'} />
                      <div className="space-y-2">
                        <div className="w-full bg-gray-50 border-none rounded-xl p-3 text-xs text-gray-500">
                          {globalOrder.images
                            ? `${globalOrder.images.split(',').filter(Boolean).length} ${isRtl ? 'صور مرفوعة' : 'images uploaded'}`
                            : (isRtl ? 'لم يتم رفع صور بعد' : 'No images uploaded yet')}
                        </div>
                        <input type="file" multiple accept="image/*" onChange={(e) => handleGlobalImagesUpload(e.target.files)} className="w-full text-xs" />
                      </div>
                      <textarea value={globalOrder.notes} onChange={(e) => setGlobalOrder({ ...globalOrder, notes: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm h-20 resize-none md:col-span-2" placeholder={isRtl ? 'توصيات إضافية' : 'Extra Notes'} />
                    </div>
                    <Button onClick={addGlobalOrderToCart} className="rounded-xl">{isRtl ? 'أضف إلى السلة' : 'Add to Cart'}</Button>
                  </div>
                </details>
              </section>
            )}

                </div>
              </div>
            </section>
          </div>
        )}

        {view === 'HOME' && storeSettings.socialMedia?.whatsapp && (
          <a
            href={storeSettings.socialMedia.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="fixed bottom-4 md:bottom-6 right-4 left-auto z-50 group flex items-center gap-2 bg-white/95 backdrop-blur border border-green-200 text-green-600 px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition"
            style={{ right: '1rem', left: 'auto' }}
            aria-label="WhatsApp"
          >
            <span className="w-9 h-9 rounded-full bg-green-500 text-white flex items-center justify-center">
              <MessageCircle size={18} />
            </span>
            <span className="text-xs font-bold text-green-700 hidden md:inline">{isRtl ? 'تواصل واتساب' : 'WhatsApp'}</span>
          </a>
        )}

        {(view === 'SHOP' || searchQuery) && (
          <div className="max-w-[1400px] mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">{searchQuery ? `"${searchQuery}"` : (selectedCategory || t.shop)}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {displayedProducts.map(p => (
                 <ProductCard key={p.id} product={p} onAddToCart={addToCart} onClick={setSelectedProduct} formattedPrice={<span className="font-bold">{p.discountPrice || p.price} {isRtl ? 'ر.ي' : 'YER'}</span>} addToCartLabel={t.addToCart} />
              ))}
            </div>
          </div>
        )}

        {view === 'ORDERS' && user && (
          <div className="max-w-3xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6">{t.orders}</h2>
            <div className="space-y-4">
               {orders.filter(o => o.userId === user?.id).map(order => (
                  <div key={order.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                     <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-50">
                        <div><p className="font-bold text-sm">#{order.id.slice(-6)}</p><p className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString()}</p></div>
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold">{order.status}</span>
                     </div>
                     <div className="mt-4 flex justify-between items-center font-bold"><span>Total</span><span>{order.total} {isRtl ? 'ر.ي' : 'YER'}</span></div>
                     <div className="mt-4 space-y-3">
                       <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600">
                         <div className="font-bold text-gray-700 mb-2">{isRtl ? 'معلومات الدفع' : 'Payment Info'}</div>
                         {storeSettings.paymentInstructions?.kurimi && (
                           <div className="mb-2">
                             <div className="text-gray-500">{isRtl ? 'الكريمي' : 'Kurimi'}: {storeSettings.paymentInstructions.kurimi.name}</div>
                             <div className="font-mono text-brand-accent">{storeSettings.paymentInstructions.kurimi.account}</div>
                           </div>
                         )}
                         {storeSettings.paymentInstructions?.wallet && (
                           <div>
                             <div className="text-gray-500">{storeSettings.paymentInstructions.wallet.type}: {storeSettings.paymentInstructions.wallet.name}</div>
                             <div className="font-mono text-brand-accent">{storeSettings.paymentInstructions.wallet.number}</div>
                           </div>
                         )}
                         {(storeSettings.paymentMethods || []).map((m, idx) => (
                           <div key={`${m.label}-${idx}`} className="mt-2 flex items-start gap-2">
                             {m.icon && <img src={m.icon} className="w-5 h-5 rounded" />}
                             <div>
                               <div className="text-gray-500">{m.label} {m.type ? `(${m.type})` : ''}: {m.name}</div>
                               <div className="font-mono text-brand-accent">{m.number}</div>
                             </div>
                           </div>
                         ))}
                       </div>

                       <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600">
                         <div className="font-bold text-gray-700 mb-2">{isRtl ? 'إرفاق سند التحويل' : 'Upload Transfer Proof'}</div>
                         <input
                           type="file"
                           className="w-full text-xs"
                           onChange={(e) => {
                             const file = e.target.files?.[0] || null;
                             setProofFiles(prev => ({ ...prev, [order.id]: file }));
                           }}
                         />
                       </div>

                       <button
                         onClick={async () => {
                           const proofUrl = await uploadProof(order.id);
                           const itemsText = order.items.map(i => {
                             const link = i.productLink || i.cartLink || '';
                             const price = i.discountPrice || i.price;
                             return `${i.name} x${i.quantity} - ${price} ${isRtl ? 'ر.ي' : 'YER'}${link ? ` (${link})` : ''}`;
                           }).join(isRtl ? '، ' : ', ');
                           const msg = isRtl
                             ? `تأكيد طلب #${order.id}\nالاسم: ${order.customer?.name || user?.name || ''}\nالهاتف: ${order.customer?.phone || user?.phone || ''}\nالعنوان: ${order.customer?.address || ''}\nالطلبات: ${itemsText}\nالإجمالي: ${order.total} ر.ي${proofUrl ? `\nرابط السند: ${proofUrl}` : ''}`
                             : `Order confirmation #${order.id}\nName: ${order.customer?.name || user?.name || ''}\nPhone: ${order.customer?.phone || user?.phone || ''}\nAddress: ${order.customer?.address || ''}\nItems: ${itemsText}\nTotal: ${order.total} YER${proofUrl ? `\nProof: ${proofUrl}` : ''}`;
                           const link = storeSettings.socialMedia?.whatsapp || 'https://wa.me/967772728311';
                           window.open(`${link}?text=${encodeURIComponent(msg)}`, '_blank');
                         }}
                         className="w-full bg-brand-black text-white py-3 rounded-xl text-xs font-bold disabled:opacity-60"
                         disabled={uploadingProof[order.id]}
                       >
                         {uploadingProof[order.id] ? (isRtl ? 'جارٍ رفع السند...' : 'Uploading proof...') : (isRtl ? 'تأكيد الطلب وإرساله للواتساب' : 'Confirm Order & Send to WhatsApp')}
                       </button>
                     </div>
                  </div>
               ))}
               <Button fullWidth variant="outline" onClick={handleLogout} className="text-red-500 mt-8">{t.signOut}</Button>
            </div>
          </div>
        )}
      </main>

      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 py-2 px-6 flex justify-between items-center z-50">
         <button onClick={() => navigateTo('HOME')} className={`flex flex-col items-center gap-1 ${view === 'HOME' ? 'text-brand-accent' : 'text-gray-400'}`}><Home size={22} /><span className="text-[10px]">{t.home}</span></button>
         <button onClick={() => navigateTo('SHOP')} className={`flex flex-col items-center gap-1 ${view === 'SHOP' ? 'text-brand-accent' : 'text-gray-400'}`}><Grid size={22} /><span className="text-[10px]">{t.shop}</span></button>
         <button onClick={() => setIsCartOpen(true)} className="flex flex-col items-center gap-1 text-gray-400 relative"><ShoppingBag size={22} />{cart.length > 0 && <span className="absolute -top-1 -right-1 bg-brand-accent text-white w-4 h-4 text-[9px] flex items-center justify-center rounded-full font-bold">{cart.length}</span>}</button>
         <button onClick={() => user ? navigateTo('ORDERS') : navigateTo('USER_LOGIN')} className={`flex flex-col items-center gap-1 ${view === 'ORDERS' ? 'text-brand-accent' : 'text-gray-400'}`}><User size={22} /><span className="text-[10px]">{t.account}</span></button>
      </div>

      <CartDrawer 
        isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} 
        onUpdateQuantity={updateQuantity} onRemove={removeFromCart} 
        formatPrice={(p) => p.toLocaleString() + (isRtl ? ' ر.ي' : ' YER')} 
        language={language} deliveryRules={storeSettings.deliveryRules}
        user={user} onClearCart={clearCart} onOrderSuccess={loadData} settings={storeSettings}
      />
      <ProductDetails product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} language={language} />
      <ChatWidget language={language} />
      <Footer
        settings={storeSettings}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
        onToggleCurrency={() => setStoreSettings(prev => ({ ...prev, currency: prev.currency === 'YER' ? 'SAR' : 'YER' }))}
      />
    </div>
  );
};