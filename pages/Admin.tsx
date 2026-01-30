
import React, { useState, useEffect, useRef } from 'react';
import { 
   Plus, Trash2, Edit, LayoutDashboard, 
   Search, ShoppingBag, DollarSign,
   Image as ImageIcon, X, Package, Clock, Store, Layers, Settings as SettingsIcon, Monitor, TrendingUp, Tag, Upload, Phone, User as UserIcon, MessageCircle, Link as LinkIcon, Instagram, Type, ExternalLink, Key, RefreshCw, ChevronDown, SlidersHorizontal
} from 'lucide-react';
import { Product, ExternalStore, Order, OrderStatus, StoreSettings, DeliveryFee, Banner } from '../types';
import { 
   MAIN_CATEGORIES as DEFAULT_CATEGORIES, 
   EXTERNAL_STORES as DEFAULT_STORES,
   STORE_NAME,
   PHONE,
   SAR_TO_YER_RATE
} from '../constants';
import UserList from '../components/admin/UserList';
import { fetchJson, authFetch } from '../src/api';
import { fetchProductsFromFirestore, subscribeProductsFromFirestore, upsertProductToFirestore, deleteProductFromFirestore } from '../firebase';

interface AdminProps {
  currentSettings: StoreSettings;
  onSettingsUpdate: (settings: StoreSettings) => void;
}

const Admin: React.FC<AdminProps> = ({ currentSettings, onSettingsUpdate }) => {
   const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'orders' | 'categories' | 'settings' | 'notifications' | 'users'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [externalStores, setExternalStores] = useState<ExternalStore[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
   const [tempSettings, setTempSettings] = useState<StoreSettings>({ ...currentSettings, banners: currentSettings.banners || [] });
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
   const [notifications, setNotifications] = useState<any[]>([]);

   // Filters
   const [productSearch, setProductSearch] = useState('');
   const [productCategoryFilter, setProductCategoryFilter] = useState('');
   const [productStoreFilter, setProductStoreFilter] = useState('');
   const [productDiscountOnly, setProductDiscountOnly] = useState(false);
   const [productMinPrice, setProductMinPrice] = useState('');
   const [productMaxPrice, setProductMaxPrice] = useState('');
   const [productStockFilter, setProductStockFilter] = useState<'all' | 'in' | 'low' | 'out'>('all');
   const [productSort, setProductSort] = useState<'none' | 'price-asc' | 'price-desc'>('none');
   const [orderSearch, setOrderSearch] = useState('');
   const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');
   const [orderDateFrom, setOrderDateFrom] = useState('');
   const [orderDateTo, setOrderDateTo] = useState('');
   const [orderPaymentFilter, setOrderPaymentFilter] = useState('');
   const [orderLocationSearch, setOrderLocationSearch] = useState('');
   const [fsWriteEnabled, setFsWriteEnabled] = useState(true);
   const [fsOnline, setFsOnline] = useState(false);
   const [lastFsSync, setLastFsSync] = useState<string>('');
   const [bannerForm, setBannerForm] = useState<Partial<Banner>>({ title: '', subtitle: '', image: '', ctaLabel: '', ctaLink: '' });

   const exportCsv = (filename: string, rows: Record<string, any>[]) => {
      if (!rows.length) { alert('لا توجد بيانات للتصدير'); return; }
      const headers = Object.keys(rows[0]);
      const sanitize = (v: any) => {
         const val = v === undefined || v === null ? '' : String(v);
         const escaped = val.replace(/"/g, '""');
         return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
      };
      const csv = [headers.join(','), ...rows.map(r => headers.map(h => sanitize(r[h])).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
   };
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const storeLogoRef = useRef<HTMLInputElement>(null);
  const catImageRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
   const bannerImageRef = useRef<HTMLInputElement>(null);

  // Forms
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '', category: '', subCategory: '', priceSAR: undefined, discountPriceSAR: undefined, shippingCommissionSAR: undefined,
    images: [], sizes: [], colors: [], volumes: [], originalLink: '', description: '', stock: 10, storeName: 'Style Ro',
    brand: '', weight: '', dimensions: '', material: '', careInstructions: '', tags: [],
    seoTitle: '', seoDescription: '', sku: '', barcode: '', manufacturer: '', warranty: '', countryOfOrigin: '',
    minOrderQuantity: 1, maxOrderQuantity: 10, isActive: true, isFeatured: false, isNewArrival: false, isOnSale: false,
    saleStartDate: '', saleEndDate: '', relatedProducts: [], crossSellProducts: [], upSellProducts: [], customFields: {}
  });
  const [storeForm, setStoreForm] = useState<ExternalStore>({ name: '', logo: '', url: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', image: '', icon: '', parent: '', sub: [] });

   useEffect(() => {
      const token = localStorage.getItem('stylero_token');

      const unsub = subscribeProductsFromFirestore((items) => {
         setProducts(items as any);
         localStorage.setItem('stylero_products', JSON.stringify(items));
         setFsOnline(true);
         setLastFsSync(new Date().toISOString());
      });

      // fallback initial fetch in case Firestore fails
      fetchProductsFromFirestore().then(cloud => {
         if (Array.isArray(cloud) && cloud.length) {
            setProducts(cloud as any);
            localStorage.setItem('stylero_products', JSON.stringify(cloud));
            setFsOnline(true);
            setLastFsSync(new Date().toISOString());
         }
      }).catch(() => {
         setFsOnline(false);
         fetchJson('/products').then(data => { if (Array.isArray(data)) { setProducts(data); localStorage.setItem('stylero_products', JSON.stringify(data)); } }).catch(() => {
            const saved = localStorage.getItem('stylero_products'); if (saved) setProducts(JSON.parse(saved));
         });
      });

      // fetch admin orders
      fetchJson('/admin/orders').then(data => { if (Array.isArray(data)) setOrders(data); }).catch(() => {
         const savedOrders = localStorage.getItem('stylero_orders'); if (savedOrders) setOrders(JSON.parse(savedOrders));
      });

      // external stores and categories fallback to existing constants/localStorage
      const savedStores = localStorage.getItem('stylero_external_stores');
      setExternalStores(savedStores ? JSON.parse(savedStores) : DEFAULT_STORES);

      const savedCats = localStorage.getItem('stylero_categories');
      setCategories(savedCats ? JSON.parse(savedCats) : DEFAULT_CATEGORIES);

      // fetch notifications (admin)
      fetchJson('/notifications?admin=1').then(j => { if (j && Array.isArray(j.items)) setNotifications(j.items); }).catch(() => {});

      // fetch users (admin)
      fetchJson('/admin/users').then(data => { if (Array.isArray(data)) { /* store or ignore until users tab */ } }).catch(() => {});

      const user = JSON.parse(localStorage.getItem('stylero_user') || '{}');
      if (user && user.isAdmin) setIsAuthenticated(true);

      return () => { try { unsub(); } catch (e) {} };
   }, []);

  const saveToLocalStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new Event('storage'));
  };

  const handleSettingsSave = () => {
    onSettingsUpdate(tempSettings);
      localStorage.setItem('stylero_settings', JSON.stringify(tempSettings));
      // store admin key on server if token available
      try {
         const token = localStorage.getItem('stylero_token');
         if (token && tempSettings.adminApiKey) {
            fetch('/admin/store-key', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ apiKey: tempSettings.adminApiKey }) }).catch(e => console.error(e));
         }
      } catch (e) {}
    alert('تم حفظ كافة إعدادات المتجر بنجاح ✨');
  };

   // Default store settings to restore previous appearance
   const DEFAULT_SETTINGS: StoreSettings = {
      storeName: 'Style Ro',
      primaryColor: '#ec4899',
      bgColor: '#fcfcfc',
      fontFamily: 'Cairo',
      phone: '712345678',
      email: 'Stylero.online@gmail.com',
      iconSize: 15,
      iconRadius: 8,
      banners: []
   };

   const handleResetSettings = () => {
      if (!confirm('إرجاع إعدادات المتجر الافتراضية؟')) return;
      const restored = { ...DEFAULT_SETTINGS };
      setTempSettings(restored);
      onSettingsUpdate(restored);
      localStorage.setItem('stylero_settings', JSON.stringify(restored));
      alert('تمت إعادة الإعدادات الافتراضية بنجاح ✅');
   };

   const addBanner = () => {
      if (!bannerForm.image && !bannerForm.title) return alert('أضف صورة أو عنوان للبانر');
      const newBanner: Banner = { id: bannerForm.id || `BN-${Date.now()}`, ...bannerForm } as Banner;
      const updated = [...(tempSettings.banners || []), newBanner];
      setTempSettings({ ...tempSettings, banners: updated });
      setBannerForm({ title: '', subtitle: '', image: '', ctaLabel: '', ctaLink: '' });
   };

   const removeBanner = (id: string) => {
      const updated = (tempSettings.banners || []).filter(b => b.id !== id);
      setTempSettings({ ...tempSettings, banners: updated });
   };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (res: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = () => {
    if (!productForm.name || !productForm.priceSAR || !productForm.images?.length) return alert('يرجى ملء البيانات الأساسية للمنتج');
    const newPrd = {
      ...productForm as Product & {
        brand?: string;
        weight?: string;
        dimensions?: string;
        material?: string;
        careInstructions?: string;
        tags?: string[];
        seoTitle?: string;
        seoDescription?: string;
        sku?: string;
        barcode?: string;
        manufacturer?: string;
        warranty?: string;
        countryOfOrigin?: string;
        minOrderQuantity?: number;
        maxOrderQuantity?: number;
        isActive?: boolean;
        isFeatured?: boolean;
        isNewArrival?: boolean;
        isOnSale?: boolean;
        saleStartDate?: string;
        saleEndDate?: string;
        relatedProducts?: string[];
        crossSellProducts?: string[];
        upSellProducts?: string[];
        customFields?: { [key: string]: string };
      },
      id: editingProduct ? editingProduct.id : `PRD-${Date.now()}`
    };
    const newList = editingProduct ? products.map(p => p.id === editingProduct.id ? newPrd : p) : [newPrd, ...products];
    setProducts(newList);
    saveToLocalStorage('stylero_products', newList);
      if (fsWriteEnabled) upsertProductToFirestore(newPrd).catch(() => {});
    setProductForm({
      name: '', category: '', subCategory: '', priceSAR: undefined, discountPriceSAR: undefined, shippingCommissionSAR: undefined,
      images: [], sizes: [], colors: [], volumes: [], originalLink: '', description: '', stock: 10, storeName: 'Style Ro',
      brand: '', weight: '', dimensions: '', material: '', careInstructions: '', tags: [],
      seoTitle: '', seoDescription: '', sku: '', barcode: '', manufacturer: '', warranty: '', countryOfOrigin: '',
      minOrderQuantity: 1, maxOrderQuantity: 10, isActive: true, isFeatured: false, isNewArrival: false, isOnSale: false,
      saleStartDate: '', saleEndDate: '', relatedProducts: [], crossSellProducts: [], upSellProducts: [], customFields: {}
    });
    setEditingProduct(null);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({ ...product });
    setActiveTab('inventory');
  };

  const handleAddCategory = () => {
    if (!categoryForm.name || !categoryForm.image) return alert('يرجى إدخال اسم القسم وصورة الغلاف');
    const newCat = { ...categoryForm, id: `CAT-${Date.now()}` };
    const newList = [...categories, newCat];
    setCategories(newList);
    saveToLocalStorage('stylero_categories', newList);
    setCategoryForm({ name: '', image: '', icon: '', parent: '', sub: [] });
  };

  const handleAddStore = () => {
    if (!storeForm.name || !storeForm.url || !storeForm.logo) return alert('يرجى ملء بيانات المتجر العالمي وشعاره');
    const newList = [...externalStores, storeForm];
    setExternalStores(newList);
    saveToLocalStorage('stylero_external_stores', newList);
    setStoreForm({ name: '', logo: '', url: '' });
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-amber-50 text-amber-600 border-amber-100';
      case OrderStatus.PAID: return 'bg-blue-50 text-blue-600 border-blue-100';
      case OrderStatus.PROCESSING: return 'bg-purple-50 text-purple-600 border-purple-100';
      case OrderStatus.SHIPPED: return 'bg-pink-50 text-pink-600 border-pink-100';
      case OrderStatus.COMPLETED: return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

   const normalizedProductSearch = productSearch.trim().toLowerCase();
   const storeOptions = Array.from(new Set([
      'Style Ro',
      ...externalStores.map(s => s.name).filter(Boolean),
      ...products.map(p => p.storeName).filter(Boolean)
   ]));
   const filteredProducts = products.filter(p => {
      const priceValue = (p as any).discountPriceSAR ?? (p as any).priceSAR ?? (p as any).price ?? 0;
      const stockValue = (p as any).stock ?? (p as any).inStock ?? 0;
      const matchesSearch = normalizedProductSearch ? `${p.name} ${p.category} ${p.storeName}`.toLowerCase().includes(normalizedProductSearch) : true;
      const matchesCategory = productCategoryFilter ? p.category === productCategoryFilter : true;
      const matchesStore = productStoreFilter ? p.storeName === productStoreFilter : true;
      const matchesDiscount = productDiscountOnly ? !!p.discountPriceSAR : true;
      const minOk = productMinPrice ? priceValue >= Number(productMinPrice) : true;
      const maxOk = productMaxPrice ? priceValue <= Number(productMaxPrice) : true;
      const stockOk = (() => {
         if (productStockFilter === 'all') return true;
         if (productStockFilter === 'out') return stockValue <= 0;
         if (productStockFilter === 'low') return stockValue > 0 && stockValue <= 5;
         return stockValue > 5;
      })();
      return matchesSearch && matchesCategory && matchesStore && matchesDiscount && minOk && maxOk && stockOk;
   }).sort((a, b) => {
      if (productSort === 'none') return 0;
      const priceA = (a as any).discountPriceSAR ?? (a as any).priceSAR ?? (a as any).price ?? 0;
      const priceB = (b as any).discountPriceSAR ?? (b as any).priceSAR ?? (b as any).price ?? 0;
      return productSort === 'price-asc' ? priceA - priceB : priceB - priceA;
   });

   const normalizedOrderSearch = orderSearch.trim().toLowerCase();
   const filteredOrders = orders.filter(o => {
      const matchesSearch = normalizedOrderSearch ? `${o.id} ${o.customerName} ${o.phoneNumber}`.toLowerCase().includes(normalizedOrderSearch) : true;
      const matchesStatus = orderStatusFilter === 'all' ? true : o.status === orderStatusFilter;
      const matchesPayment = orderPaymentFilter ? (o as any).paymentMethod === orderPaymentFilter : true;
      const locationValue = `${(o as any).governorate || (o as any).region || (o as any).city || (o as any).customerLocation || ''}`.toLowerCase();
      const matchesLocation = orderLocationSearch.trim() ? locationValue.includes(orderLocationSearch.trim().toLowerCase()) : true;
      const created = (o as any).createdAt ? new Date((o as any).createdAt) : null;
      const fromOk = orderDateFrom && created ? created >= new Date(orderDateFrom) : true;
      const toOk = orderDateTo && created ? created <= new Date(orderDateTo + 'T23:59:59') : true;
      return matchesSearch && matchesStatus && matchesPayment && matchesLocation && fromOk && toOk;
   });

   if (!isAuthenticated) return <div className="p-20 text-center font-extrabold">يرجى تسجيل الدخول كمسؤول.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 pb-32 mt-6 text-right" dir="rtl">
      {/* Control Hub Navigation */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-black text-white rounded-[1.5rem] flex items-center justify-center shadow-lg"><LayoutDashboard size={24} /></div>
               <div>
                  <h1 className="text-xl font-extrabold">لوحة التحكم</h1>
            <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">إدارة متجر Style Ro</p>
          </div>
        </div>
         <nav className="flex flex-wrap gap-2 bg-gray-50 p-1.5 rounded-full justify-center">
                      {[
                  {id: 'dashboard', label: 'الإحصائيات', icon: TrendingUp},
                  {id: 'inventory', label: 'المخزون', icon: Package},
                  {id: 'orders', label: 'الطلبات', icon: ShoppingBag},
                  {id: 'categories', label: 'الأقسام', icon: Layers},
                  {id: 'notifications', label: 'الإشعارات', icon: MessageCircle},
                  {id: 'users', label: 'المستخدمون', icon: UserIcon},
                  {id: 'settings', label: 'الإعدادات', icon: SettingsIcon}
               ].map(tab => (
                           <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-extrabold transition-all ${activeTab === tab.id ? 'btn-primary' : 'text-gray-400 hover:text-black'}`}>
                     <tab.icon size={14}/> {tab.label}
                  </button>
               ))}
            </nav>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-zoom-in">
           <StatCard title="المبيعات" value={`${orders.reduce((acc, o) => acc + (o.totalSAR || 0), 0).toFixed(0)} SAR`} icon={DollarSign} color="green" />
           <StatCard title="الطلبات النشطة" value={orders.filter(o => o.status !== OrderStatus.COMPLETED).length} icon={Clock} color="pink" />
           <StatCard title="المخزون" value={products.length} icon={Package} color="blue" />
           <StatCard title="الأقسام" value={categories.length} icon={Layers} color="orange" />
        </div>
      )}

         {/* Notifications Tab */}
         {activeTab === 'notifications' && (
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl">
               <h3 className="font-extrabold text-xl mb-4">إدارة الإشعارات</h3>
               <div className="flex gap-3 mb-4">
                  <button onClick={async () => {
                     const res = await authFetch('/dev/send-notification', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'اختبار من لوحة التحكم', message: 'هذه رسالة اختبار' }) });
                     if (res.ok) alert('تم إرسال إشعار تجريبي');
                  }} className="btn-primary px-4 py-2">إرسال إشعار تجريبي</button>
                  <button onClick={async () => {
                     const res = await authFetch('/notifications/mark-all-read', { method: 'POST' });
                     if (res.ok) { setNotifications(n => n.map(x => ({ ...x, isRead: true }))); alert('تم وسم كل الإشعارات كمقروءة'); }
                  }} className="btn-secondary px-4 py-2">وضع الكل كمقروء</button>
               </div>
               <div className="space-y-3">
                  {notifications.length === 0 && <div className="text-gray-400">لا توجد إشعارات</div>}
                  {notifications.map(n => (
                     <div key={n.id} className={`p-4 rounded-2xl border ${n.isRead ? 'bg-white' : 'bg-gray-50 border-pink-50'}`}>
                        <div className="flex justify-between items-start">
                           <div>
                              <div className="font-extrabold">{n.title}</div>
                              <div className="text-sm text-gray-600 mt-1">{n.message}</div>
                              <div className="text-[10px] text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</div>
                           </div>
                           <div className="flex flex-col gap-2">
                                {!n.isRead && <button onClick={async () => { const r = await authFetch(`/notifications/${n.id}/read`, { method: 'POST' }); if (r.ok) setNotifications(ns => ns.map(x => x.id === n.id ? { ...x, isRead: true } : x)); }} className="px-3 py-1 btn-primary text-[12px]">تم</button>}
                                <button onClick={async () => { if (!confirm('حذف الإشعار نهائياً؟')) return; const r = await authFetch(`/notifications/${n.id}`, { method: 'DELETE' }); if (r.ok) setNotifications(ns => ns.filter(x => x.id !== n.id)); }} className="px-3 py-1 btn-secondary text-[12px]">حذف</button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* Users Tab */}
         {activeTab === 'users' && (
            <div className="bg-white p-6 rounded-[2.5rem] shadow-xl">
               <h3 className="font-extrabold text-xl mb-4">قائمة المستخدمين</h3>
               <UserList />
            </div>
         )}

      {/* Inventory Tab Update with Product Link Field */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-zoom-in">
          <div className="lg:col-span-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl space-y-6">
              <h3 className="font-extrabold border-b pb-4 flex items-center gap-2 text-lg"><Tag size={20} className="text-primary"/> {editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}</h3>
              <div className="space-y-5">
                
                <div className="space-y-1">
                   <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">اسم المنتج</label>
                   <input type="text" placeholder="مثال: عطر لافيرن الفاخر..." className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-extrabold text-xs outline-none shadow-inner border-transparent focus:border-primary/20 transition-all" value={productForm.name} onChange={(e) => setProductForm({...productForm, name: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">القسم</label>
                      <select className="w-full bg-gray-50 rounded-2xl py-4 px-4 text-[11px] font-bold outline-none shadow-inner cursor-pointer" value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})}>
                         <option value="">اختر القسم</option>
                         {categories.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">المتجر المصدر</label>
                      <select className="w-full bg-gray-50 rounded-2xl py-4 px-4 text-[11px] font-bold outline-none shadow-inner cursor-pointer" value={productForm.storeName} onChange={(e) => setProductForm({...productForm, storeName: e.target.value})}>
                         <option value="Style Ro">Style Ro (محلي)</option>
                         {externalStores.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                      </select>
                   </div>
                </div>

                {/* The requested field: Product Link */}
                <div className="space-y-1">
                   <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase flex items-center gap-2"><LinkIcon size={12}/> رابط المنتج الأصلي</label>
                   <input type="url" placeholder="انسخي رابط المنتج من الموقع الأصلي هنا..." className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold text-[10px] outline-none shadow-inner border-transparent focus:border-primary/20 transition-all" value={productForm.originalLink || ''} onChange={(e) => setProductForm({...productForm, originalLink: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">السعر (ر.س)</label>
                      <input type="number" className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-extrabold text-xs outline-none shadow-inner" value={productForm.priceSAR || ''} onChange={(e) => setProductForm({...productForm, priceSAR: Number(e.target.value)})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">بعد الخصم</label>
                      <input type="number" className="w-full bg-pink-50 text-pink-700 rounded-2xl py-4 px-6 font-extrabold text-xs border border-pink-100 outline-none shadow-inner" value={productForm.discountPriceSAR || ''} onChange={(e) => setProductForm({...productForm, discountPriceSAR: Number(e.target.value)})} />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">المخزون</label>
                      <input type="number" className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-extrabold text-xs outline-none shadow-inner" value={productForm.stock || ''} onChange={(e) => setProductForm({...productForm, stock: Number(e.target.value)})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">الوزن (كجم)</label>
                      <input type="text" className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-extrabold text-xs outline-none shadow-inner" value={productForm.weight || ''} onChange={(e) => setProductForm({...productForm, weight: e.target.value})} />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">الأبعاد (سم)</label>
                      <input type="text" placeholder="طول × عرض × ارتفاع" className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-extrabold text-xs outline-none shadow-inner" value={productForm.dimensions || ''} onChange={(e) => setProductForm({...productForm, dimensions: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">المادة</label>
                      <input type="text" placeholder="مثال: قطن، جلد..." className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-extrabold text-xs outline-none shadow-inner" value={productForm.material || ''} onChange={(e) => setProductForm({...productForm, material: e.target.value})} />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">العلامة التجارية</label>
                      <input type="text" className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-extrabold text-xs outline-none shadow-inner" value={productForm.brand || ''} onChange={(e) => setProductForm({...productForm, brand: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">بلد المنشأ</label>
                      <input type="text" className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-extrabold text-xs outline-none shadow-inner" value={productForm.countryOfOrigin || ''} onChange={(e) => setProductForm({...productForm, countryOfOrigin: e.target.value})} />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">SKU</label>
                      <input type="text" className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-extrabold text-xs outline-none shadow-inner" value={productForm.sku || ''} onChange={(e) => setProductForm({...productForm, sku: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">الباركود</label>
                      <input type="text" className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-extrabold text-xs outline-none shadow-inner" value={productForm.barcode || ''} onChange={(e) => setProductForm({...productForm, barcode: e.target.value})} />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">الشركة المصنعة</label>
                      <input type="text" className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-extrabold text-xs outline-none shadow-inner" value={productForm.manufacturer || ''} onChange={(e) => setProductForm({...productForm, manufacturer: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">الضمان</label>
                      <input type="text" placeholder="مثال: سنة واحدة" className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-extrabold text-xs outline-none shadow-inner" value={productForm.warranty || ''} onChange={(e) => setProductForm({...productForm, warranty: e.target.value})} />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">الحد الأدنى للطلب</label>
                      <input type="number" min="1" className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-extrabold text-xs outline-none shadow-inner" value={productForm.minOrderQuantity || ''} onChange={(e) => setProductForm({...productForm, minOrderQuantity: Number(e.target.value)})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">الحد الأقصى للطلب</label>
                      <input type="number" min="1" className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-extrabold text-xs outline-none shadow-inner" value={productForm.maxOrderQuantity || ''} onChange={(e) => setProductForm({...productForm, maxOrderQuantity: Number(e.target.value)})} />
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">تعليمات العناية</label>
                   <textarea rows={2} placeholder="تعليمات غسل وتنظيف المنتج..." className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold text-xs outline-none shadow-inner border-transparent focus:border-primary/20 transition-all resize-none" value={productForm.careInstructions || ''} onChange={(e) => setProductForm({...productForm, careInstructions: e.target.value})} />
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">العلامات (Tags)</label>
                   <input type="text" placeholder="أدخل العلامات مفصولة بفواصل" className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-extrabold text-xs outline-none shadow-inner" value={(productForm.tags || []).join(', ')} onChange={(e) => setProductForm({...productForm, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)})} />
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">عنوان SEO</label>
                   <input type="text" className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-extrabold text-xs outline-none shadow-inner" value={productForm.seoTitle || ''} onChange={(e) => setProductForm({...productForm, seoTitle: e.target.value})} />
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">وصف SEO</label>
                   <textarea rows={2} placeholder="وصف مختصر لمحركات البحث..." className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold text-xs outline-none shadow-inner border-transparent focus:border-primary/20 transition-all resize-none" value={productForm.seoDescription || ''} onChange={(e) => setProductForm({...productForm, seoDescription: e.target.value})} />
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">خصائص المنتج</label>
                   <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={productForm.isActive || false} onChange={(e) => setProductForm({...productForm, isActive: e.target.checked})} />
                        <span className="text-[10px] font-extrabold">نشط</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={productForm.isFeatured || false} onChange={(e) => setProductForm({...productForm, isFeatured: e.target.checked})} />
                        <span className="text-[10px] font-extrabold">مميز</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={productForm.isNewArrival || false} onChange={(e) => setProductForm({...productForm, isNewArrival: e.target.checked})} />
                        <span className="text-[10px] font-extrabold">جديد</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" checked={productForm.isOnSale || false} onChange={(e) => setProductForm({...productForm, isOnSale: e.target.checked})} />
                        <span className="text-[10px] font-extrabold">عرض خاص</span>
                      </label>
                   </div>
                </div>

                {productForm.isOnSale && (
                   <div className="grid grid-cols-2 gap-4 animate-zoom-in">
                      <div className="space-y-1">
                         <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">تاريخ بداية العرض</label>
                         <input type="date" className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-extrabold text-xs outline-none shadow-inner" value={productForm.saleStartDate || ''} onChange={(e) => setProductForm({...productForm, saleStartDate: e.target.value})} />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">تاريخ نهاية العرض</label>
                         <input type="date" className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-extrabold text-xs outline-none shadow-inner" value={productForm.saleEndDate || ''} onChange={(e) => setProductForm({...productForm, saleEndDate: e.target.value})} />
                      </div>
                   </div>
                )}

                {productForm.storeName !== 'Style Ro' && (
                              <div className="space-y-1 animate-zoom-in">
                              <label className="text-[10px] font-extrabold text-blue-600 mr-2 uppercase">عمولة الشحن (ر.س)</label>
                              <input type="number" placeholder="قيمة العمولة..." className="w-full bg-blue-50 text-blue-800 rounded-2xl py-4 px-6 font-extrabold text-xs border border-blue-100 outline-none" value={productForm.shippingCommissionSAR || ''} onChange={(e) => setProductForm({...productForm, shippingCommissionSAR: Number(e.target.value)})} />
                           </div>
                )}

                <div className="space-y-1">
                   <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">وصف المنتج</label>
                   <textarea rows={3} placeholder="اكتبي تفاصيل المنتج الجمالية هنا..." className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold text-xs outline-none shadow-inner border-transparent focus:border-primary/20 transition-all resize-none" value={productForm.description || ''} onChange={(e) => setProductForm({...productForm, description: e.target.value})} />
                </div>

                <div className="space-y-1">
                   <label className="text-[10px] font-extrabold text-gray-400 mr-2 flex items-center gap-2 uppercase"><ImageIcon size={14}/> صور المنتج</label>
                   <div className="min-h-32 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 flex items-center justify-center flex-wrap gap-3 p-4 shadow-inner">
                      {productForm.images?.map((img, i) => (
                        <div key={i} className="relative group/img">
                           <img src={img} className="w-20 h-24 object-cover rounded-xl shadow-md" />
                           <button onClick={() => setProductForm({...productForm, images: productForm.images?.filter((_, idx) => idx !== i)})} className="absolute -top-1 -left-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover/img:opacity-100 transition shadow-lg"><X size={12}/></button>
                        </div>
                      ))}
                                  <button onClick={() => fileInputRef.current?.click()} className="w-20 h-24 flex flex-col items-center justify-center text-gray-300 bg-white border-2 border-dashed border-gray-100 rounded-xl hover:border-primary hover:text-primary transition-all shadow-sm">
                                    <Plus size={24}/>
                                    <span className="text-[8px] font-extrabold mt-1">إضافة صورة</span>
                                 </button>
                      <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={(e) => {
                         const files = Array.from(e.target.files || []) as File[];
                         files.forEach(f => {
                            const reader = new FileReader();
                            reader.onload = () => setProductForm(prev => ({...prev, images: [...(prev.images || []), reader.result as string]}));
                            reader.readAsDataURL(f);
                         });
                      }} />
                   </div>
                </div>

                         <div className="flex gap-4">
                           {editingProduct && (
                              <button onClick={() => { setEditingProduct(null); setProductForm({name: '', images: [], sizes: [], colors: [], volumes: [], priceSAR: undefined, category: '', stock: 10, storeName: 'Style Ro', description: '', originalLink: ''}); }} className="flex-1 btn-secondary py-4 rounded-2xl font-extrabold text-xs transition-all">إلغاء التعديل</button>
                           )}
                           <button onClick={handleAddProduct} className="flex-[2] btn-primary py-4 rounded-2xl font-extrabold text-sm shadow-xl transition-all active:scale-95">
                              {editingProduct ? 'حفظ التغييرات' : 'إضافة المنتج للمخزون'}
                           </button>
                        </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-6">
             <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 min-h-[500px]">
                      <div className="flex flex-col gap-3 mb-6">
                         <div className="flex items-center gap-2 flex-wrap justify-between">
                            <h3 className="font-extrabold flex items-center gap-2">قائمة المنتجات الحالية <span className="bg-gray-100 px-3 py-1 rounded-full text-[10px] text-gray-400">{products.length}</span> <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px]">المعروضة: {filteredProducts.length}</span></h3>
                            <div className="flex flex-wrap gap-2">
                               <div className="relative">
                                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                                  <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="بحث بالاسم أو القسم أو المتجر" className="pl-9 pr-3 py-2 rounded-full border text-[11px] bg-gray-50 outline-none focus:border-primary/40" />
                               </div>
                               <select value={productCategoryFilter} onChange={(e) => setProductCategoryFilter(e.target.value)} className="px-3 py-2 rounded-full border text-[11px] bg-gray-50 outline-none">
                                  <option value="">كل الأقسام</option>
                                  {categories.map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
                               </select>
                               <select value={productStoreFilter} onChange={(e) => setProductStoreFilter(e.target.value)} className="px-3 py-2 rounded-full border text-[11px] bg-gray-50 outline-none">
                                  <option value="">كل المتاجر</option>
                                  {storeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                               </select>
                                  <input value={productMinPrice} onChange={(e) => setProductMinPrice(e.target.value)} placeholder="سعر من" type="number" className="w-24 px-3 py-2 rounded-full border text-[11px] bg-white outline-none" />
                                  <input value={productMaxPrice} onChange={(e) => setProductMaxPrice(e.target.value)} placeholder="سعر إلى" type="number" className="w-24 px-3 py-2 rounded-full border text-[11px] bg-white outline-none" />
                                  <select value={productStockFilter} onChange={(e) => setProductStockFilter(e.target.value as any)} className="px-3 py-2 rounded-full border text-[11px] bg-white outline-none">
                                     <option value="all">كل المخزون</option>
                                     <option value="in">متوفر</option>
                                     <option value="low">مخزون منخفض</option>
                                     <option value="out">نفد</option>
                                  </select>
                                  <select value={productSort} onChange={(e) => setProductSort(e.target.value as any)} className="px-3 py-2 rounded-full border text-[11px] bg-white outline-none">
                                     <option value="none">بدون ترتيب</option>
                                     <option value="price-asc">السعر تصاعدي</option>
                                     <option value="price-desc">السعر تنازلي</option>
                                  </select>
                                  <button onClick={() => setProductDiscountOnly(v => !v)} className={`px-3 py-2 rounded-full text-[11px] flex items-center gap-1 border transition ${productDiscountOnly ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-500'}`}>
                                     <SlidersHorizontal size={14}/> عروض فقط
                                  </button>
                                  {(productSearch || productCategoryFilter || productStoreFilter || productDiscountOnly || productMinPrice || productMaxPrice || productStockFilter !== 'all' || productSort !== 'none') && (
                                     <button onClick={() => { setProductSearch(''); setProductCategoryFilter(''); setProductStoreFilter(''); setProductDiscountOnly(false); setProductMinPrice(''); setProductMaxPrice(''); setProductStockFilter('all'); setProductSort('none'); }} className="px-3 py-2 rounded-full border text-[11px] bg-blue-50 text-blue-600">إعادة الضبط</button>
                                  )}
                                  <button onClick={() => exportCsv('products', filteredProducts.map(p => ({
                                     id: p.id,
                                     name: p.name,
                                     category: (p as any).category,
                                     store: (p as any).storeName,
                                     priceSAR: (p as any).priceSAR ?? (p as any).price ?? '',
                                     discountSAR: (p as any).discountPriceSAR ?? '',
                                     stock: (p as any).stock ?? (p as any).inStock ?? '',
                                     originalLink: (p as any).originalLink || '',
                                     shippingCommissionSAR: (p as any).shippingCommissionSAR ?? ''
                                  })))} className="px-3 py-2 rounded-full border text-[11px] bg-green-50 text-green-700">تصدير CSV</button>
                                 <button onClick={() => {
                                    fetchProductsFromFirestore().then(cloud => {
                                      if (Array.isArray(cloud) && cloud.length) {
                                        setProducts(cloud as any);
                                        localStorage.setItem('stylero_products', JSON.stringify(cloud));
                                        setFsOnline(true);
                                        setLastFsSync(new Date().toISOString());
                                      } else {
                                        alert('لا توجد بيانات سحابية حالياً');
                                      }
                                    }).catch(() => alert('تعذر التحديث من السحابة'));
                                  }} className="px-3 py-2 rounded-full border text-[11px] bg-white text-gray-600">تحديث من السحابة</button>
                                 <div className="flex items-center gap-2 px-3 py-2 rounded-full border text-[11px] bg-gray-50 text-gray-600">
                                    <span className={`w-2.5 h-2.5 rounded-full ${fsOnline ? 'bg-green-500' : 'bg-red-400'}`}></span>
                                    <span>{fsOnline ? 'متصل بسحابة المنتجات' : 'غير متصل بالسحابة'}</span>
                                    {lastFsSync && <span className="text-[10px] text-gray-400">آخر مزامنة: {new Date(lastFsSync).toLocaleTimeString()}</span>}
                                 </div>
                                 <label className="flex items-center gap-2 px-3 py-2 rounded-full border text-[11px] bg-white text-gray-700 cursor-pointer">
                                    <input type="checkbox" checked={fsWriteEnabled} onChange={(e) => setFsWriteEnabled(e.target.checked)} />
                                    <span>السماح بالكتابة إلى Firestore</span>
                                 </label>
                            </div>
                         </div>
                      </div>
                     <div className="space-y-4 max-h-[1000px] overflow-y-auto no-scrollbar pr-2">
                        {filteredProducts.length === 0 && (
                          <div className="text-gray-400 text-sm text-center py-6">لا توجد منتجات مطابقة للبحث</div>
                        )}
                        {filteredProducts.map(p => (
                      <div key={p.id} className="nice-card flex items-center justify-between p-4 group hover:shadow-xl transition-all">
                         <div className="flex items-center gap-4">
                            <img src={p.images[0]} className="w-16 h-20 object-cover rounded-2xl shadow-sm bg-white" />
                            <div>
                               <p className="font-extrabold text-xs text-gray-800 line-clamp-1">{p.name}</p>
                               <div className="flex gap-2 mt-1">
                                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{p.category}</span>
                                  <span className="text-[8px] font-bold text-primary uppercase tracking-widest">{p.storeName}</span>
                               </div>
                               <p className="text-[10px] font-extrabold text-pink-600 mt-1">{p.discountPriceSAR || p.priceSAR} SAR</p>
                            </div>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => handleEditProduct(p)} className="p-3 text-blue-500 bg-white rounded-2xl opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-blue-50"><Edit size={16}/></button>
                            <button onClick={() => { if(confirm('حذف هذا المنتج نهائياً من المخزون؟')) { const up = products.filter(i => i.id !== p.id); setProducts(up); saveToLocalStorage('stylero_products', up); if (fsWriteEnabled) deleteProductFromFirestore(String(p.id)).catch(() => {}); }}} className="p-3 text-red-500 bg-white rounded-2xl opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-red-50"><Trash2 size={16}/></button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-zoom-in">
           <div className="lg:col-span-4">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl space-y-6">
                 <h3 className="font-extrabold border-b pb-4 flex items-center gap-2"><Layers size={20}/> إدارة الأقسام</h3>
                 <div className="space-y-5">
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">اختر القسم الرئيسي (اختياري)</label>
                      <div className="relative">
                        <select className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold text-xs outline-none shadow-inner appearance-none" value={categoryForm.parent} onChange={(e) => setCategoryForm({...categoryForm, parent: e.target.value})}>
                          <option value="">هذا قسم رئيسي</option>
                          {categories.filter(c => !c.parent).map(c => <option key={c.id || c.name} value={c.name}>{c.name}</option>)}
                        </select>
                        <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={14}/>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">اسم القسم الجديد</label>
                      <input type="text" placeholder="مثال: عطور، مكياج..." className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-extrabold text-xs outline-none shadow-inner" value={categoryForm.name} onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})} />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">إدراج صورة القسم</label>
                      <div className="h-44 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 flex items-center justify-center relative overflow-hidden group shadow-inner">
                         {categoryForm.image ? <img src={categoryForm.image} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center gap-2 text-gray-300"><ImageIcon size={40}/><span className="text-[9px] font-extrabold">رفع صورة الغلاف</span></div>}
                         <button onClick={() => catImageRef.current?.click()} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center font-extrabold text-[11px] gap-2"><Upload size={18}/> اختر صورة</button>
                         <input type="file" ref={catImageRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, (res) => setCategoryForm({...categoryForm, image: res}))} />
                      </div>
                    </div>
                    
                    <button onClick={handleAddCategory} className="w-full btn-primary py-4.5 rounded-2xl font-extrabold text-sm transition-all shadow-xl flex items-center justify-center gap-2">
                      <Plus size={20}/> إضافة القسم للمتجر
                    </button>
                 </div>
              </div>
           </div>
           <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                 {categories.map(cat => (
                    <div key={cat.id || cat.name} className="relative group bg-white rounded-[2.5rem] p-4 border border-gray-100 text-center shadow-sm hover:shadow-2xl transition-all duration-700">
                       <div className="aspect-square rounded-[2rem] overflow-hidden mb-4 shadow-md bg-gray-50">
                          <img src={cat.image || cat.icon} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                       </div>
                       <div className="flex flex-col gap-1">
                          <span className="font-extrabold text-sm text-gray-800">{cat.name}</span>
                          {cat.parent && <span className="text-[8px] font-extrabold text-pink-500 uppercase">فرعي لـ {cat.parent}</span>}
                       </div>
                       <button onClick={() => { if(confirm('حذف هذا القسم؟')) { const up = categories.filter(c => (c.id || c.name) !== (cat.id || cat.name)); setCategories(up); saveToLocalStorage('stylero_categories', up); }}} className="absolute -top-3 -left-3 bg-red-500 text-white p-3.5 rounded-full opacity-0 group-hover:opacity-100 transition shadow-xl hover:rotate-12"><Trash2 size={16}/></button>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Orders Tab Update - Detailed View Added */}
      {activeTab === 'orders' && (
        <div className="bg-white p-6 md:p-10 rounded-[3rem] shadow-xl animate-zoom-in border border-gray-100">
         <h3 className="text-2xl font-extrabold mb-12 flex items-center gap-4 border-b pb-8"><Package size={30} className="text-primary"/> إدارة طلبات العملاء</h3>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-8">
                   <div className="flex flex-wrap items-center gap-3 flex-1">
                      <div className="relative w-full md:w-64">
                         <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                         <input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="بحث بالطلب أو العميل أو الهاتف" className="w-full pl-9 pr-3 py-3 rounded-2xl bg-gray-50 border outline-none focus:border-primary/40 text-sm" />
                      </div>
                      <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value as OrderStatus | 'all')} className="px-4 py-3 rounded-2xl bg-gray-50 border text-sm outline-none">
                         <option value="all">كل الحالات</option>
                         {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <input type="date" value={orderDateFrom} onChange={(e) => setOrderDateFrom(e.target.value)} className="px-3 py-3 rounded-2xl bg-white border text-sm outline-none" />
                      <input type="date" value={orderDateTo} onChange={(e) => setOrderDateTo(e.target.value)} className="px-3 py-3 rounded-2xl bg-white border text-sm outline-none" />
                      <select value={orderPaymentFilter} onChange={(e) => setOrderPaymentFilter(e.target.value)} className="px-4 py-3 rounded-2xl bg-white border text-sm outline-none">
                         <option value="">كل طرق الدفع</option>
                         {Array.from(new Set(orders.map(o => (o as any).paymentMethod).filter(Boolean))).map(p => <option key={p} value={p as string}>{p as string}</option>)}
                      </select>
                      <div className="relative w-full md:w-56">
                         <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                         <input value={orderLocationSearch} onChange={(e) => setOrderLocationSearch(e.target.value)} placeholder="بحث بالمحافظة/المدينة" className="w-full pl-8 pr-3 py-3 rounded-2xl bg-white border text-sm outline-none" />
                      </div>
                   </div>
                   <div className="flex items-center gap-2 text-[11px] text-gray-500 flex-wrap">
                      <span className="bg-gray-100 px-3 py-1 rounded-full">الكل: {orders.length}</span>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">المعروضة: {filteredOrders.length}</span>
                      {(orderSearch || orderStatusFilter !== 'all' || orderDateFrom || orderDateTo || orderPaymentFilter || orderLocationSearch) && (
                         <button onClick={() => { setOrderSearch(''); setOrderStatusFilter('all'); setOrderDateFrom(''); setOrderDateTo(''); setOrderPaymentFilter(''); setOrderLocationSearch(''); }} className="text-blue-500 hover:text-blue-700 px-3 py-1 rounded-full border border-blue-100 bg-blue-50">إعادة الضبط</button>
                      )}
                      <button onClick={() => exportCsv('orders', filteredOrders.map(o => ({
                         id: o.id,
                         customer: (o as any).customerName,
                         phone: (o as any).phoneNumber,
                         status: o.status,
                         payment: (o as any).paymentMethod || '',
                         totalSAR: (o as any).totalSAR ?? (o as any).total ?? '',
                         createdAt: (o as any).createdAt,
                         location: (o as any).governorate || (o as any).region || (o as any).city || (o as any).customerLocation || '',
                         address: (o as any).address || (o as any).customerLocation || '',
                         itemsCount: Array.isArray((o as any).items) ? (o as any).items.length : '',
                         itemsNames: Array.isArray((o as any).items) ? (o as any).items.map((i: any) => i.name).join(' | ') : ''
                      })))} className="text-green-700 px-3 py-1 rounded-full border border-green-100 bg-green-50">تصدير CSV</button>
                   </div>
                </div>
           <div className="space-y-6">
                     {filteredOrders.length > 0 ? filteredOrders.map(o => (
                 <div key={o.id} className="bg-gray-50 rounded-[2.5rem] overflow-hidden border border-gray-100 transition-all duration-500 hover:shadow-xl">
                    <div 
                      className="p-6 md:p-8 flex flex-col lg:flex-row justify-between items-center gap-6 cursor-pointer group"
                      onClick={() => setExpandedOrderId(expandedOrderId === o.id ? null : o.id)}
                    >
                       <div className="flex items-center gap-6 w-full lg:w-auto">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${expandedOrderId === o.id ? 'bg-primary text-white' : 'bg-white text-gray-400 group-hover:text-primary'}`}>
                             <ShoppingBag size={28}/>
                          </div>
                          <div className="text-right">
                             <div className="flex items-center gap-3">
                                <h4 className="font-extrabold text-lg">طلب #{o.id}</h4>
                                <span className={`px-4 py-1 rounded-full text-[9px] font-extrabold border ${getStatusColor(o.status)}`}>{o.status}</span>
                             </div>
                             <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">{o.customerName} • {o.phoneNumber}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-8 w-full lg:w-auto justify-between lg:justify-end">
                          <div className="text-right">
                             <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">إجمالي الطلب</p>
                             <p className="text-2xl font-extrabold text-black">{Math.round(o.totalSAR)} <span className="text-xs">SAR</span></p>
                          </div>
                          <div className="flex items-center gap-4">
                                           <select 
                                              onClick={(e) => e.stopPropagation()}
                                              className={`px-6 py-2 rounded-full text-[10px] font-extrabold border-2 outline-none shadow-sm transition-all cursor-pointer ${getStatusColor(o.status)}`} 
                               value={o.status} 
                               onChange={(e) => { 
                                 const up = orders.map(ord => ord.id === o.id ? {...ord, status: e.target.value as OrderStatus} : ord); 
                                 setOrders(up); 
                                 saveToLocalStorage('stylero_orders', up); 
                               }}
                             >
                                {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                             </select>
                             <button onClick={(e) => { e.stopPropagation(); if(confirm('حذف الطلب نهائياً؟')) { const up = orders.filter(ord => ord.id !== o.id); setOrders(up); saveToLocalStorage('stylero_orders', up); }}} className="text-red-300 hover:text-red-500 transition-all p-2"><Trash2 size={20}/></button>
                             <div className={`transition-transform duration-300 ${expandedOrderId === o.id ? 'rotate-180' : ''}`}><ChevronDown size={20} className="text-gray-300"/></div>
                          </div>
                       </div>
                    </div>

                    {/* Detailed Items View */}
                    {expandedOrderId === o.id && (
                      <div className="bg-white border-t border-gray-100 p-8 animate-zoom-in space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                               <h5 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-2"><UserIcon size={14}/> بيانات العميل والتوصيل</h5>
                               <div className="nice-card p-6 rounded-3xl space-y-3">
                                  <div className="flex justify-between text-xs font-bold"><span className="text-gray-400">الاسم:</span><span>{o.customerName}</span></div>
                                  <div className="flex justify-between text-xs font-bold"><span className="text-gray-400">الهاتف:</span><span dir="ltr">{o.phoneNumber}</span></div>
                                  <div className="flex justify-between text-xs font-bold"><span className="text-gray-400">طريقة الدفع:</span><span className="text-primary">{o.paymentMethod || 'غير محدد'}</span></div>
                                  <div className="flex justify-between text-xs font-bold"><span className="text-gray-400">تاريخ الطلب:</span><span>{new Date(o.createdAt).toLocaleString('ar-YE')}</span></div>
                               </div>
                            </div>
                            <div className="space-y-4">
                               <h5 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-2"><DollarSign size={14}/> ملخص الحساب</h5>
                               <div className="nice-card p-6 rounded-3xl space-y-3 bg-black text-white">
                                  <div className="flex justify-between text-xs"><span className="opacity-50">المبلغ بالريال السعودي:</span><span className="font-extrabold">{Math.round(o.totalSAR)} SAR</span></div>
                                  <div className="flex justify-between text-xs"><span className="opacity-50">المبلغ بالريال اليمني:</span><span className="font-extrabold text-primary">{(o.totalSAR * SAR_TO_YER_RATE).toLocaleString()} YER</span></div>
                                  <div className="pt-2 border-t border-white/10 flex justify-between items-center"><span className="text-[10px] opacity-50">حالة الدفع:</span><span className="bg-white/10 px-3 py-1 rounded-full text-[9px]">{o.status === OrderStatus.PENDING ? 'بانتظار التأكيد' : 'تم التأكيد'}</span></div>
                               </div>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <h5 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Package size={14}/> المنتجات المطلوبة ({o.items.length})</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               {o.items.map((item, idx) => (
                                 <div key={idx} className="flex items-center gap-4 p-4 rounded-3xl nice-card border border-gray-100 hover:border-primary/20 transition-all">
                                    <div className="w-16 h-20 rounded-2xl overflow-hidden shrink-0 bg-white">
                                       <img src={item.image || 'https://via.placeholder.com/200'} className="w-full h-full object-cover" alt={item.name} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                       <h6 className="font-extrabold text-[11px] text-gray-900 line-clamp-1">{item.name}</h6>
                                       <div className="flex flex-wrap gap-2 mt-2">
                                          {item.size && <span className="text-[8px] font-extrabold bg-white text-gray-500 px-2 py-1 rounded-md border border-gray-100">المقاس: {item.size}</span>}
                                          {item.volume && <span className="text-[8px] font-extrabold bg-white text-gray-500 px-2 py-1 rounded-md border border-gray-100">الحجم: {item.volume}</span>}
                                          {item.color && <span className="text-[8px] font-extrabold bg-white text-gray-500 px-2 py-1 rounded-md border border-gray-100">اللون: {item.color}</span>}
                                       </div>
                                       <div className="flex justify-between items-center mt-2">
                                          <span className="text-[10px] font-extrabold text-primary">{Math.round(item.priceSAR)} SAR</span>
                                          <span className="text-[10px] font-bold text-gray-400">الكمية: {item.quantity}</span>
                                       </div>
                                    </div>
                                    {item.externalLink && (
                                       <a href={item.externalLink} target="_blank" rel="noreferrer" className="p-2 text-blue-400 hover:text-blue-600 transition-colors"><ExternalLink size={16}/></a>
                                    )}
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                    )}
                 </div>
              )) : (
                <div className="py-24 text-center text-gray-300">
                   <ShoppingBag size={64} className="mx-auto mb-4 opacity-20"/>
                   <p className="font-extrabold text-lg">لا توجد طلبات مطابقة</p>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-12 animate-zoom-in">
          <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-50 space-y-10">
             <div className="flex justify-between items-center border-b pb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary text-white rounded-[1.8rem] flex items-center justify-center shadow-lg"><SettingsIcon size={32}/></div>
                  <div>
                    <h3 className="text-2xl font-extrabold">إعدادات المتجر العامة</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">تخصيص الهوية والمظهر والمصادر</p>
                  </div>
                </div>
                        <div className="flex items-center gap-3">
                           <button onClick={handleResetSettings} className="btn-secondary px-6 py-4 rounded-full font-extrabold text-sm transition-all shadow-xl flex items-center gap-2"><RefreshCw size={16}/> استرجاع الإعدادات الافتراضية</button>
                           <button onClick={handleSettingsSave} className="btn-primary px-12 py-4 rounded-full font-extrabold text-sm transition-all shadow-xl">حفظ كافة التغييرات</button>
                        </div>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                   <div className="bg-gray-50 p-8 rounded-[2.5rem] space-y-6">
                      <h4 className="font-extrabold text-sm flex items-center gap-2 text-primary border-b pb-2">الهوية البصرية</h4>
                      <div className="flex items-center gap-6">
                        <div className="w-28 h-28 bg-white rounded-[2rem] border-2 border-dashed flex items-center justify-center relative overflow-hidden group shadow-sm">
                           {tempSettings.logo ? <img src={tempSettings.logo} className="p-4 object-contain w-full h-full" /> : <ImageIcon size={32}/>}
                           <button onClick={() => logoInputRef.current?.click()} className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center"><Edit size={20}/></button>
                           <input type="file" ref={logoInputRef} hidden onChange={(e) => handleImageUpload(e, (res) => setTempSettings({...tempSettings, logo: res}))} />
                        </div>
                        <div className="flex-1 space-y-4">
                           <label className="text-[10px] font-extrabold text-gray-400 block mb-2">اسم المتجر الظاهر</label>
                           <input type="text" className="w-full bg-white rounded-2xl py-4 px-6 font-extrabold text-sm outline-none shadow-sm" value={tempSettings.storeName} onChange={(e) => setTempSettings({...tempSettings, storeName: e.target.value})} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-gray-400 block mb-1">اللون الأساسي</label>
                            <input type="color" className="w-full h-12 rounded-xl cursor-pointer shadow-sm" value={tempSettings.primaryColor} onChange={(e) => setTempSettings({...tempSettings, primaryColor: e.target.value})} />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-gray-400 block mb-1">لون الخلفية</label>
                            <input type="color" className="w-full h-12 rounded-xl cursor-pointer shadow-sm" value={tempSettings.bgColor} onChange={(e) => setTempSettings({...tempSettings, bgColor: e.target.value})} />
                         </div>
                      </div>
                   </div>

                   <div className="bg-gray-50 p-8 rounded-[2.5rem] space-y-6">
                      <h4 className="font-extrabold text-sm flex items-center gap-2 text-primary border-b pb-2">غلاف الواجهة</h4>
                      <div className="h-52 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100 flex items-center justify-center relative overflow-hidden group shadow-sm">
                         {tempSettings.heroImage ? <img src={tempSettings.heroImage} className="w-full h-full object-cover" /> : <Monitor size={48} className="text-gray-100"/>}
                         <button onClick={() => heroInputRef.current?.click()} className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center font-extrabold text-xs gap-3 shadow-xl"><Upload size={20}/> تحديث الغلاف</button>
                         <input type="file" ref={heroInputRef} hidden onChange={(e) => handleImageUpload(e, (res) => setTempSettings({...tempSettings, heroImage: res}))} />
                      </div>
                   </div>

                            <div className="bg-gray-50 p-8 rounded-[2.5rem] space-y-6">
                                 <h4 className="font-extrabold text-sm flex items-center gap-2 text-primary border-b pb-2">إدارة البانرات الرئيسية</h4>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="text" value={bannerForm.title || ''} onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})} placeholder="عنوان البانر" className="w-full bg-white rounded-xl py-3.5 px-4 text-xs font-bold outline-none shadow-sm" />
                                    <input type="text" value={bannerForm.subtitle || ''} onChange={(e) => setBannerForm({...bannerForm, subtitle: e.target.value})} placeholder="نص فرعي" className="w-full bg-white rounded-xl py-3.5 px-4 text-xs font-bold outline-none shadow-sm" />
                                    <input type="text" value={bannerForm.ctaLabel || ''} onChange={(e) => setBannerForm({...bannerForm, ctaLabel: e.target.value})} placeholder="نص الزر" className="w-full bg-white rounded-xl py-3.5 px-4 text-xs font-bold outline-none shadow-sm" />
                                    <input type="url" value={bannerForm.ctaLink || ''} onChange={(e) => setBannerForm({...bannerForm, ctaLink: e.target.value})} placeholder="رابط الزر" className="w-full bg-white rounded-xl py-3.5 px-4 text-xs font-bold outline-none shadow-sm" />
                                 </div>
                                 <div className="h-40 bg-white rounded-[1.5rem] border-2 border-dashed border-gray-100 flex items-center justify-center relative group shadow-sm overflow-hidden">
                                     {bannerForm.image ? <img src={bannerForm.image} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center text-gray-200"><Upload size={24}/><span className="text-[9px] font-extrabold">رفع صورة البانر</span></div>}
                                     <button onClick={() => bannerImageRef.current?.click()} className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[10px] font-extrabold">اختر الصورة</button>
                                     <input type="file" ref={bannerImageRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, (res) => setBannerForm({...bannerForm, image: res}))} />
                                 </div>
                                 <div className="flex gap-3">
                                    <button onClick={addBanner} className="flex-1 btn-primary py-3 rounded-xl font-extrabold text-xs">إضافة بانر</button>
                                    <button onClick={() => setBannerForm({ title: '', subtitle: '', image: '', ctaLabel: '', ctaLink: '' })} className="flex-1 btn-secondary py-3 rounded-xl font-extrabold text-xs">تفريغ الحقول</button>
                                 </div>

                                 <div className="space-y-3 max-h-72 overflow-y-auto no-scrollbar">
                                    {(tempSettings.banners || []).length === 0 && <div className="text-gray-400 text-sm">لا يوجد بانرات مضافة</div>}
                                    {(tempSettings.banners || []).map((b) => (
                                       <div key={b.id} className="p-3 rounded-2xl bg-white border flex items-center gap-3">
                                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 border">
                                             {b.image ? <img src={b.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">لا صورة</div>}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                             <div className="font-extrabold text-sm line-clamp-1">{b.title || 'بدون عنوان'}</div>
                                             <div className="text-[11px] text-gray-500 line-clamp-1">{b.subtitle || 'بدون وصف'}</div>
                                             <div className="text-[10px] text-blue-500 line-clamp-1">{b.ctaLink || ''}</div>
                                          </div>
                                          <button onClick={() => removeBanner(b.id)} className="p-2 text-red-500 bg-red-50 rounded-xl hover:bg-red-100"><Trash2 size={16}/></button>
                                       </div>
                                    ))}
                                 </div>
                            </div>
                </div>

                <div className="space-y-8">
                   <div className="bg-gray-50 p-8 rounded-[2.5rem] space-y-6">
                      <h4 className="font-extrabold text-sm flex items-center gap-2 text-primary border-b pb-2">المتاجر العالمية</h4>
                      <div className="space-y-5">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="اسم المتجر" className="w-full bg-white rounded-xl py-3.5 px-6 text-xs font-bold outline-none shadow-sm" value={storeForm.name} onChange={(e) => setStoreForm({...storeForm, name: e.target.value})} />
                            <input type="url" placeholder="الرابط" className="w-full bg-white rounded-xl py-3.5 px-6 text-xs font-bold outline-none shadow-sm" value={storeForm.url} onChange={(e) => setStoreForm({...storeForm, url: e.target.value})} />
                         </div>
                         <div className="h-32 bg-white rounded-[1.5rem] border-2 border-dashed border-gray-100 flex items-center justify-center relative group shadow-sm">
                            {storeForm.logo ? <img src={storeForm.logo} className="h-full object-contain p-4" /> : <div className="flex flex-col items-center text-gray-200"><Upload size={24}/><span className="text-[8px] font-extrabold">رفع الشعار</span></div>}
                            <button onClick={() => storeLogoRef.current?.click()} className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[10px] font-extrabold">اختر الصورة</button>
                            <input type="file" ref={storeLogoRef} hidden accept="image/*" onChange={(e) => handleImageUpload(e, (res) => setStoreForm({...storeForm, logo: res}))} />
                         </div>
                                     <button onClick={handleAddStore} className="w-full btn-primary py-4 rounded-xl font-extrabold text-xs transition-all shadow-lg flex items-center justify-center gap-2">
                                        <Plus size={16}/> إضافة المتجر
                                     </button>
                      </div>
                   </div>

                   <div className="bg-gray-50 p-8 rounded-[2.5rem] space-y-6">
                      <h4 className="font-extrabold text-sm flex items-center gap-2 text-primary border-b pb-2">بيانات التواصل</h4>
                      <div className="grid grid-cols-2 gap-4">
                         <input type="text" placeholder="رقم الهاتف" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.phone} onChange={(e) => setTempSettings({...tempSettings, phone: e.target.value})} />
                         <input type="email" placeholder="البريد الإلكتروني" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.email} onChange={(e) => setTempSettings({...tempSettings, email: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <input type="text" placeholder="رقم الواتساب" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.whatsapp || ''} onChange={(e) => setTempSettings({...tempSettings, whatsapp: e.target.value})} />
                         <input type="text" placeholder="رابط فيسبوك" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.facebook || ''} onChange={(e) => setTempSettings({...tempSettings, facebook: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <input type="text" placeholder="رابط إنستغرام" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.instagram || ''} onChange={(e) => setTempSettings({...tempSettings, instagram: e.target.value})} />
                         <input type="text" placeholder="رابط تويتر" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.twitter || ''} onChange={(e) => setTempSettings({...tempSettings, twitter: e.target.value})} />
                      </div>
                      <div className="mt-4">
                        <label className="text-[10px] font-extrabold text-gray-400 block mb-2">مفتاح API للمسؤول (مخفي)</label>
                        <input type="password" placeholder="أدخل مفتاح الإدارة هنا" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.adminApiKey || ''} onChange={(e) => setTempSettings({...tempSettings, adminApiKey: e.target.value})} />
                        <p className="text-[11px] text-gray-400 mt-2">سيُحفظ المفتاح في متصفحك فقط لاستخدام وظائف الإدارة (تأكد من تعيين `API_KEY` في الخادم).</p>
                      </div>
                   </div>

                   <div className="bg-gray-50 p-8 rounded-[2.5rem] space-y-6">
                      <h4 className="font-extrabold text-sm flex items-center gap-2 text-primary border-b pb-2">إعدادات الشحن والتوصيل</h4>
                      <div className="grid grid-cols-2 gap-4">
                         <input type="number" placeholder="رسوم الشحن الافتراضية (ر.س)" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.defaultShippingFee || ''} onChange={(e) => setTempSettings({...tempSettings, defaultShippingFee: Number(e.target.value)})} />
                         <input type="number" placeholder="حد الشحن المجاني (ر.س)" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.freeShippingThreshold || ''} onChange={(e) => setTempSettings({...tempSettings, freeShippingThreshold: Number(e.target.value)})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <input type="text" placeholder="وقت التوصيل المتوقع" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.deliveryTime || ''} onChange={(e) => setTempSettings({...tempSettings, deliveryTime: e.target.value})} />
                         <input type="text" placeholder="سياسة الإرجاع" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.returnPolicy || ''} onChange={(e) => setTempSettings({...tempSettings, returnPolicy: e.target.value})} />
                      </div>
                   </div>

                   <div className="bg-gray-50 p-8 rounded-[2.5rem] space-y-6">
                      <h4 className="font-extrabold text-sm flex items-center gap-2 text-primary border-b pb-2">إعدادات الدفع</h4>
                      <div className="grid grid-cols-2 gap-4">
                         <input type="text" placeholder="Stripe Public Key" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.stripePublicKey || ''} onChange={(e) => setTempSettings({...tempSettings, stripePublicKey: e.target.value})} />
                         <input type="text" placeholder="Stripe Secret Key" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.stripeSecretKey || ''} onChange={(e) => setTempSettings({...tempSettings, stripeSecretKey: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <input type="text" placeholder="PayPal Client ID" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.paypalClientId || ''} onChange={(e) => setTempSettings({...tempSettings, paypalClientId: e.target.value})} />
                         <input type="text" placeholder="PayPal Secret" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.paypalSecret || ''} onChange={(e) => setTempSettings({...tempSettings, paypalSecret: e.target.value})} />
                      </div>
                      <div className="flex items-center gap-4">
                         <label className="flex items-center gap-2">
                           <input type="checkbox" checked={tempSettings.enableCashOnDelivery || false} onChange={(e) => setTempSettings({...tempSettings, enableCashOnDelivery: e.target.checked})} />
                           <span className="text-[10px] font-extrabold">تفعيل الدفع عند الاستلام</span>
                         </label>
                         <label className="flex items-center gap-2">
                           <input type="checkbox" checked={tempSettings.enableOnlinePayment || false} onChange={(e) => setTempSettings({...tempSettings, enableOnlinePayment: e.target.checked})} />
                           <span className="text-[10px] font-extrabold">تفعيل الدفع الإلكتروني</span>
                         </label>
                      </div>
                   </div>

                   <div className="bg-gray-50 p-8 rounded-[2.5rem] space-y-6">
                      <h4 className="font-extrabold text-sm flex items-center gap-2 text-primary border-b pb-2">إعدادات SEO والمحركات</h4>
                      <div className="space-y-4">
                         <input type="text" placeholder="Meta Title" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.metaTitle || ''} onChange={(e) => setTempSettings({...tempSettings, metaTitle: e.target.value})} />
                         <textarea rows={3} placeholder="Meta Description" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none resize-none" value={tempSettings.metaDescription || ''} onChange={(e) => setTempSettings({...tempSettings, metaDescription: e.target.value})} />
                         <input type="text" placeholder="Meta Keywords" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.metaKeywords || ''} onChange={(e) => setTempSettings({...tempSettings, metaKeywords: e.target.value})} />
                         <input type="text" placeholder="Google Analytics ID" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.googleAnalyticsId || ''} onChange={(e) => setTempSettings({...tempSettings, googleAnalyticsId: e.target.value})} />
                      </div>
                   </div>

                   <div className="bg-gray-50 p-8 rounded-[2.5rem] space-y-6">
                      <h4 className="font-extrabold text-sm flex items-center gap-2 text-primary border-b pb-2">إعدادات متقدمة</h4>
                      <div className="grid grid-cols-2 gap-4">
                         <input type="number" placeholder="حد المنتجات في الصفحة" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.productsPerPage || ''} onChange={(e) => setTempSettings({...tempSettings, productsPerPage: Number(e.target.value)})} />
                         <input type="number" placeholder="حد الطلبات في الصفحة" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.ordersPerPage || ''} onChange={(e) => setTempSettings({...tempSettings, ordersPerPage: Number(e.target.value)})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <input type="text" placeholder="العملة الافتراضية" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.defaultCurrency || ''} onChange={(e) => setTempSettings({...tempSettings, defaultCurrency: e.target.value})} />
                         <input type="text" placeholder="اللغة الافتراضية" className="w-full bg-white rounded-xl py-3 px-4 font-bold text-xs shadow-sm outline-none" value={tempSettings.defaultLanguage || ''} onChange={(e) => setTempSettings({...tempSettings, defaultLanguage: e.target.value})} />
                      </div>
                      <div className="flex items-center gap-4">
                         <label className="flex items-center gap-2">
                           <input type="checkbox" checked={tempSettings.enableWishlist || false} onChange={(e) => setTempSettings({...tempSettings, enableWishlist: e.target.checked})} />
                           <span className="text-[10px] font-extrabold">تفعيل قائمة المفضلة</span>
                         </label>
                         <label className="flex items-center gap-2">
                           <input type="checkbox" checked={tempSettings.enableReviews || false} onChange={(e) => setTempSettings({...tempSettings, enableReviews: e.target.checked})} />
                           <span className="text-[10px] font-extrabold">تفعيل التقييمات</span>
                         </label>
                         <label className="flex items-center gap-2">
                           <input type="checkbox" checked={tempSettings.enableNotifications || false} onChange={(e) => setTempSettings({...tempSettings, enableNotifications: e.target.checked})} />
                           <span className="text-[10px] font-extrabold">تفعيل الإشعارات</span>
                         </label>
                      </div>
                      <div className="flex gap-4">
                         <button onClick={() => { if(confirm('تصفير كل البيانات؟')) { localStorage.clear(); window.location.reload(); }}} className="flex-1 bg-white border border-red-100 text-red-500 py-3 rounded-xl font-extrabold text-[9px] hover:bg-red-500 hover:text-white transition-all">مسح الذاكرة</button>
                         <button onClick={() => window.open('/', '_blank')} className="flex-1 bg-white border border-blue-100 text-blue-500 py-3 rounded-xl font-extrabold text-[9px] hover:bg-blue-500 hover:text-white transition-all">معاينة المتجر</button>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({title, value, icon: Icon, color}: any) => (
  <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col items-center text-center gap-5 group hover:shadow-2xl hover:translate-y-[-8px] transition-all duration-700 cursor-default">
     <div className={`w-18 h-18 rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-700 group-hover:rotate-[15deg] ${
       color === 'green' ? 'bg-green-50 text-green-600 shadow-green-100' : 
       color === 'pink' ? 'bg-pink-50 text-primary shadow-pink-100' : 
       color === 'blue' ? 'bg-blue-50 text-blue-600 shadow-blue-100' : 
       'bg-orange-50 text-orange-600 shadow-orange-100'
     }`}>
       <Icon size={36}/>
     </div>
     <div className="space-y-1">
       <h3 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">{title}</h3>
       <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</p>
     </div>
  </div>
);

export default Admin;

