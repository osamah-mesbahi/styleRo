
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Truck, Tag, Layers, ImageIcon, MessageCircle, 
  Sliders, LogOut, Package, Plus, Trash2, X, RefreshCw, 
  Save, User, Users, UploadCloud, PlusCircle, Menu, Camera,
  Hash, DollarSign, List, Ruler, Palette, Box, ShoppingCart, Check,
  Globe, ExternalLink, Edit, Link as LinkIcon, ChevronDown, Play,
  BarChart, Sparkles, Image as LucideImage
} from 'lucide-react';
import { db } from '../services/firebase';
import { 
  collection, onSnapshot, query, orderBy, 
  doc, deleteDoc, addDoc, serverTimestamp, setDoc, updateDoc, arrayUnion
} from 'firebase/firestore';
import { Product, StoreSettings, Order, StoreCategory, ContactMessage, GlobalStore, StoryGroup, Story } from '../types';

const COMMON_SIZES = ['XXS',"XS", "S", "M", "L", "XL", "XXL",'XXXL','Free Size', '16', "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "38", "39", "40", "41", "42", "43", "44", "45"];
const COMMON_NUMBER = [ "16", "17", "18", "19", "20", "21", "22", "23"];

const COMMON_COLORS = [
  { name: "أسود", hex: "#000000" },
  { name: "أبيض", hex: "#FFFFFF" },
  { name: "أحمر", hex: "#FF0000" },
  { name: "أزرق", hex: "#0000FF" },
  { name: "أخضر", hex: "#008000" },
  { name: "أصفر", hex: "#FFFF00" },
  { name: "رمادي", hex: "#808080" },
  { name: "وردي", hex: "#FFC0CB" },
  { name: "بنفسجي", hex: "#800080" },
  { name: "كحلي", hex: "#000080" },
  { name: "بيج", hex: "#F5F5DC" },
  { name: "بني", hex: "#A52A2A" }
];

interface DashboardProps {
  products: Product[];
  settings: StoreSettings;
  onUpdateSettings: (s: StoreSettings) => void;
  onLogout: () => void;
  language: 'ar' | 'en';
}

const Dashboard: React.FC<DashboardProps> = ({ settings, onUpdateSettings, onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('STATS');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [globalStores, setGlobalStores] = useState<GlobalStore[]>([]);
  const [stories, setStories] = useState<StoryGroup[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsubP = onSnapshot(query(collection(db, "products"), orderBy("createdAt", "desc")), (s) => {
      setProducts(s.docs.map(d => ({id: d.id, ...d.data()} as any)));
    });

    const unsubO = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc")), (s) => {
      setOrders(s.docs.map(d => ({id: d.id, ...d.data()} as any)));
    });

    const unsubC = onSnapshot(query(collection(db, "categories"), orderBy("name", "asc")), (s) => {
      setCategories(s.docs.map(d => ({id: d.id, ...d.data()} as any)));
    });

    const unsubM = onSnapshot(query(collection(db, "messages"), orderBy("createdAt", "desc")), (s) => {
      setMessages(s.docs.map(d => ({id: d.id, ...d.data()} as any)));
    });

    const unsubB = onSnapshot(query(collection(db, "banners"), orderBy("createdAt", "desc")), (s) => {
      setBanners(s.docs.map(d => ({id: d.id, ...d.data()} as any)));
    });

    const unsubGS = onSnapshot(query(collection(db, "global_stores"), orderBy("name", "asc")), (s) => {
      setGlobalStores(s.docs.map(d => ({id: d.id, ...d.data()} as any)));
    });

    const unsubS = onSnapshot(query(collection(db, "stories"), orderBy("createdAt", "desc")), (s) => {
      setStories(s.docs.map(d => ({id: d.id, ...d.data()} as any)));
    });

    return () => { unsubP(); unsubO(); unsubC(); unsubM(); unsubB(); unsubGS(); unsubS(); };
  }, []);

  const menuItems = [
    { id: 'STATS', label: 'الرئيسية', icon: <BarChart3 size={20}/> },
    { id: 'ORDERS', label: 'الطلبات', icon: <Truck size={20}/> },
    { id: 'PRODUCTS', label: 'المنتجات', icon: <Tag size={20}/> },
    { id: 'CATEGORIES', label: 'الأقسام', icon: <Layers size={20}/> },
    { id: 'STORIES', label: 'قصص المتجر', icon: <Sparkles size={20}/> },
    { id: 'STORES', label: 'المتاجر العالمية', icon: <Globe size={20}/> },
    { id: 'BANNERS', label: 'الإعلانات', icon: <ImageIcon size={20}/> },
    { id: 'MESSAGES', label: 'الرسائل', icon: <MessageCircle size={20}/> },
    { id: 'SETTINGS', label: 'الإعدادات', icon: <Sliders size={20}/> },
  ];

  const handleMenuClick = (id: string) => {
    setActiveMenu(id);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] font-sans text-slate-800 relative" dir="rtl">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`w-72 bg-white shadow-2xl lg:shadow-xl flex flex-col fixed h-full z-50 border-l border-gray-100 overflow-y-auto no-scrollbar transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter text-slate-900">Style<span className="text-[#FF4500]">Ro</span></h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">لوحة التحكم</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-400"><X size={24} /></button>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mb-8">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => handleMenuClick(item.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-black text-sm ${activeMenu === item.id ? 'bg-[#FFF5F5] text-[#FF4500] shadow-sm' : 'text-slate-500 hover:bg-gray-50'}`}>
              <span className={activeMenu === item.id ? 'text-[#FF4500]' : 'text-slate-400'}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50 bg-white sticky bottom-0">
          <button onClick={onLogout} className="text-red-500 text-xs font-black flex items-center gap-3 w-full p-3 hover:bg-red-50 rounded-xl transition-all"><LogOut size={18}/> تسجيل خروج</button>
        </div>
      </aside>

      <main className="flex-1 lg:mr-72 p-4 md:p-10 w-full overflow-hidden">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-[#FF4500]"><Menu size={24} /></button>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter">{menuItems.find(m => m.id === activeMenu)?.label}</h2>
          </div>
          <button onClick={() => { setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 1000); }} className={`p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 hover:text-[#FF4500] ${isRefreshing ? 'animate-spin' : ''}`}><RefreshCw size={20} /></button>
        </header>

        <div className="space-y-8">
          {activeMenu === 'STATS' && <StatsOverview products={products} orders={orders} categories={categories} />}
          {activeMenu === 'ORDERS' && <OrdersManager orders={orders} />}
          {activeMenu === 'CATEGORIES' && <CategoriesManager categories={categories} />}
          {activeMenu === 'STORIES' && <StoriesManager stories={stories} />}
          {activeMenu === 'STORES' && <GlobalStoresManager stores={globalStores} />}
          {activeMenu === 'PRODUCTS' && <ProductsManager products={products} categories={categories} globalStores={globalStores} />}
          {activeMenu === 'SETTINGS' && <SettingsView settings={settings} onSave={onUpdateSettings} />}
          {activeMenu === 'MESSAGES' && <MessagesManager messages={messages} />}
          {activeMenu === 'BANNERS' && <BannersManager banners={banners} />}
        </div>
      </main>
    </div>
  );
};

const StoriesManager = ({ stories }: { stories: StoryGroup[] }) => {
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showAddStory, setShowAddStory] = useState<string | null>(null);
  const [newGroup, setNewGroup] = useState({ name: '', thumbnail: '' });
  const [newStory, setNewStory] = useState({ image: '', type: 'image' as 'image' | 'video' });

  const handleGroupThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewGroup({ ...newGroup, thumbnail: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleStoryImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewStory({ ...newStory, image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const addGroup = async () => {
    if (!newGroup.name || !newGroup.thumbnail) return;
    await addDoc(collection(db, "stories"), {
      ...newGroup,
      stories: [],
      createdAt: serverTimestamp()
    });
    setNewGroup({ name: '', thumbnail: '' });
    setShowAddGroup(false);
  };

  const addStory = async (groupId: string) => {
    if (!newStory.image) return;
    const story: Story = {
      id: Date.now().toString(),
      image: newStory.image,
      type: newStory.type,
      createdAt: new Date()
    };
    await updateDoc(doc(db, "stories", groupId), {
      stories: arrayUnion(story)
    });
    setNewStory({ image: '', type: 'image' });
    setShowAddStory(null);
  };

  const deleteGroup = async (id: string) => {
    if (window.confirm("هل تريد حذف هذه المجموعة نهائياً؟")) {
      await deleteDoc(doc(db, "stories", id));
    }
  };

  return (
    <div className="space-y-10" dir="rtl">
      {/* Header matching screenshot */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-[80px] rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10 flex-1 text-center md:text-right">
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">قصص المتجر (Stories)</h3>
          <p className="text-gray-400 font-bold text-xs">أضف محتوى تفاعلي يظهر في أعلى الصفحة الرئيسية</p>
        </div>
        <button 
          onClick={() => setShowAddGroup(true)}
          className="bg-gradient-to-l from-[#D81B60] to-[#E91E63] text-white px-10 py-6 rounded-[2.5rem] font-black text-sm flex items-center justify-center gap-3 shadow-2xl shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} strokeWidth={3}/> مجموعة جديدة
        </button>
      </div>

      {/* Grid of Story Groups */}
      <div className="grid grid-cols-1 gap-10">
        {stories.map(group => (
          <div key={group.id} className="bg-white p-10 rounded-[3.5rem] border border-gray-50 shadow-sm space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-gray-50 pb-8">
              <div className="flex items-center gap-8 flex-1">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-[3px] border-[#E91E63] p-1.5 shadow-xl shadow-pink-100">
                    <img src={group.thumbnail} className="w-full h-full rounded-full object-cover border-2 border-white" alt="" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white w-8 h-8 rounded-full border-4 border-white flex items-center justify-center font-black text-[10px] shadow-lg">
                    {group.stories?.length || 0}
                  </span>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-2xl font-black text-slate-800 tracking-tighter mb-1">{group.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    تم الإنشاء: {group.createdAt?.toDate ? group.createdAt.toDate().toLocaleDateString('ar-YE') : 'الآن'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                 <button className="bg-[#F8F5FF] text-[#7C4DFF] px-8 py-4 rounded-2xl font-black text-xs flex items-center gap-2 shadow-sm border border-[#F3EDFF]">
                   <BarChart size={16}/> إحصائيات
                 </button>
                 <button 
                   onClick={() => setShowAddStory(group.id)}
                   className="bg-gray-50 text-slate-700 px-8 py-4 rounded-2xl font-black text-xs flex items-center gap-2 shadow-sm border border-gray-100 hover:bg-gray-100"
                 >
                   <Plus size={16}/> قصة
                 </button>
                 <button onClick={() => deleteGroup(group.id)} className="p-4 text-red-100 hover:text-red-500 transition-colors">
                   <Trash2 size={20}/>
                 </button>
              </div>
            </div>

            {/* Stories Grid / Empty State */}
            <div className="pt-2">
              {group.stories && group.stories.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                  {group.stories.map(story => (
                    <div key={story.id} className="w-32 aspect-[9/16] bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100 relative group cursor-pointer">
                      <img src={story.image} className="w-full h-full object-cover" />
                      {story.type === 'video' && <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white"><Play size={24} fill="currentColor"/></div>}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button className="text-white p-2 hover:text-red-500"><Trash2 size={20}/></button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setShowAddStory(group.id)} className="w-32 aspect-[9/16] border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-300 hover:bg-pink-50 hover:border-pink-100 hover:text-[#E91E63] transition-all">
                    <Plus size={24}/>
                    <span className="text-[10px] font-black uppercase">إضافة</span>
                  </button>
                </div>
              ) : (
                <div className="py-20 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200 text-center space-y-2">
                  <p className="text-sm font-black text-gray-300">لا توجد قصص في هذه المجموعة. اضغط على "قصة" للإضافة.</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal - New Group */}
      {showAddGroup && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddGroup(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 space-y-10">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-800">مجموعة قصص جديدة</h3>
                <button onClick={() => setShowAddGroup(false)} className="text-gray-400 hover:text-slate-900"><X size={24}/></button>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <label className="w-32 h-32 rounded-full border-[4px] border-dashed border-gray-100 flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50 hover:bg-pink-50 hover:border-[#E91E63]/30 transition-all">
                    {newGroup.thumbnail ? <img src={newGroup.thumbnail} className="w-full h-full object-cover" /> : <Camera className="text-gray-200" size={32}/>}
                    <input type="file" className="hidden" accept="image/*" onChange={handleGroupThumbnail} />
                  </label>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">أيقونة المجموعة</span>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-gray-500 mr-1 block uppercase">اسم المجموعة</label>
                  <input 
                    placeholder="مثل: عروض العيد، وصل حديثاً..." 
                    value={newGroup.name}
                    onChange={e => setNewGroup({...newGroup, name: e.target.value})}
                    className="w-full bg-gray-50 px-6 py-5 rounded-[1.5rem] border-none outline-none font-bold text-sm focus:ring-2 ring-pink-500/20"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={addGroup} className="flex-1 bg-gradient-to-l from-[#D81B60] to-[#E91E63] text-white py-5 rounded-[1.5rem] font-black text-sm shadow-xl shadow-pink-500/20 active:scale-95 transition-all">إنشاء المجموعة</button>
                <button onClick={() => setShowAddGroup(false)} className="flex-1 bg-gray-50 text-gray-400 py-5 rounded-[1.5rem] font-black text-sm active:scale-95 transition-all">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal - New Story */}
      {showAddStory && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddStory(null)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10 space-y-10">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-800">إضافة قصة للمجموعة</h3>
                <button onClick={() => setShowAddStory(null)} className="text-gray-400 hover:text-slate-900"><X size={24}/></button>
              </div>

              <div className="space-y-8 text-center">
                <div className="flex gap-2 p-1.5 bg-gray-50 rounded-[1.2rem] border border-gray-100">
                  <button 
                    onClick={() => setNewStory({...newStory, type: 'image'})}
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${newStory.type === 'image' ? 'bg-[#E91E63] text-white shadow-lg' : 'text-gray-400'}`}
                  >
                    <LucideImage size={16}/> صورة
                  </button>
                  <button 
                    onClick={() => setNewStory({...newStory, type: 'video'})}
                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${newStory.type === 'video' ? 'bg-[#E91E63] text-white shadow-lg' : 'text-gray-400'}`}
                  >
                    <Play size={16}/> فيديو
                  </button>
                </div>

                <label className="flex flex-col items-center justify-center w-full aspect-[9/16] max-h-[350px] border-[4px] border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50 cursor-pointer overflow-hidden hover:bg-pink-50 transition-all mx-auto">
                   {newStory.image ? (
                     newStory.type === 'video' ? (
                       <video src={newStory.image} className="w-full h-full object-cover" muted />
                     ) : (
                       <img src={newStory.image} className="w-full h-full object-cover" />
                     )
                   ) : (
                     <div className="flex flex-col items-center gap-4">
                       <UploadCloud className="text-gray-200" size={48}/>
                       <p className="text-xs font-black text-gray-400 uppercase tracking-widest">اختر ملف القصة</p>
                     </div>
                   )}
                   <input type="file" className="hidden" accept={newStory.type === 'video' ? 'video/*' : 'image/*'} onChange={handleStoryImage} />
                </label>
              </div>

              <div className="flex gap-4">
                <button onClick={() => addStory(showAddStory)} className="flex-1 bg-gradient-to-l from-[#D81B60] to-[#E91E63] text-white py-5 rounded-[1.5rem] font-black text-sm shadow-xl shadow-pink-500/20 active:scale-95 transition-all">نشر القصة</button>
                <button onClick={() => setShowAddStory(null)} className="flex-1 bg-gray-50 text-gray-400 py-5 rounded-[1.5rem] font-black text-sm active:scale-95 transition-all">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatsOverview = ({ products, orders, categories }: any) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-2">
    <StatCard icon={<Package size={16}/>} label="المنتجات" value={products.length} color="bg-blue-500" />
    <StatCard icon={<Layers size={16}/>} label="الأقسام" value={categories.length} color="bg-purple-500" />
    <StatCard icon={<ShoppingCart size={16}/>} label="طلبات" value={orders.length} color="bg-orange-500" />
    <StatCard icon={<Users size={16}/>} label="عملاء" value="85" color="bg-green-500" />
  </div>
);

const StatCard = ({ label, value, icon, color }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm flex flex-col items-center gap-2">
    <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center shadow-lg shadow-${color.split('-')[1]}-500/20`}>{icon}</div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
    <h4 className="text-xl font-black text-slate-900">{value}</h4>
  </div>
);

const GlobalStoresManager = ({ stores }: { stores: GlobalStore[] }) => {
  const [newStore, setNewStore] = useState<Partial<GlobalStore>>({ name: '', url: '', image: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewStore({ ...newStore, image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!newStore.name || !newStore.image) return;
    if (editingId) {
      await updateDoc(doc(db, "global_stores", editingId), { ...newStore });
    } else {
      await addDoc(collection(db, "global_stores"), { ...newStore, createdAt: serverTimestamp() });
    }
    setNewStore({ name: '', url: '', image: '', description: '' });
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-[3rem] border border-gray-50 shadow-sm space-y-6">
        <h3 className="font-black text-sm text-slate-800 flex items-center gap-2">
          {editingId ? <Edit size={18}/> : <PlusCircle size={18}/>} 
          {editingId ? 'تعديل متجر عالمي' : 'إضافة متجر عالمي جديد'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="aspect-square relative group">
            <label className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50 cursor-pointer overflow-hidden transition-all hover:bg-orange-50">
              {newStore.image ? <img src={newStore.image} className="w-full h-full object-contain" /> : <div className="text-center"><Camera size={24} className="mx-auto text-gray-300"/><p className="text-[8px] font-black text-gray-400 uppercase">اللوجو</p></div>}
              <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
            </label>
          </div>
          <div className="md:col-span-3 space-y-4">
            <input placeholder="اسم المتجر (أمازون، شي إن...)" value={newStore.name} onChange={e => setNewStore({...newStore, name: e.target.value})} className="w-full bg-gray-50 p-5 rounded-2xl border-none ring-1 ring-gray-100 font-bold text-sm" />
            <input placeholder="رابط المتجر (URL)" value={newStore.url} onChange={e => setNewStore({...newStore, url: e.target.value})} className="w-full bg-gray-50 p-5 rounded-2xl border-none ring-1 ring-gray-100 font-bold text-sm" dir="ltr" />
            <textarea placeholder="وصف قصير..." value={newStore.description} onChange={e => setNewStore({...newStore, description: e.target.value})} className="w-full bg-gray-50 p-5 rounded-2xl border-none ring-1 ring-gray-100 font-bold text-sm min-h-[80px]" />
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all">حفظ المتجر</button>
              {editingId && <button onClick={() => {setEditingId(null); setNewStore({name:'', url:'', image:'', description:''})}} className="px-6 bg-gray-100 rounded-2xl text-gray-400"><X/></button>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stores.map(store => (
          <div key={store.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col items-center text-center group transition-all hover:shadow-md">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center p-2 mb-4 border border-gray-50">
              <img src={store.image} className="w-full h-full object-contain" />
            </div>
            <h4 className="font-black text-sm text-slate-800 mb-1">{store.name}</h4>
            <p className="text-[10px] text-gray-400 font-bold truncate w-full mb-4 px-2" dir="ltr">{store.url}</p>
            <div className="flex gap-4">
               <button onClick={() => {setEditingId(store.id); setNewStore(store)}} className="text-gray-300 hover:text-blue-500 transition-colors"><Edit size={16}/></button>
               <button onClick={() => deleteDoc(doc(db, "global_stores", store.id))} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CategoriesManager = ({ categories }: { categories: StoreCategory[] }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [imageType, setImageType] = useState<'upload' | 'url'>('upload');
  const [newCat, setNewCat] = useState<Partial<StoreCategory>>({ 
    name: '', 
    parent: '', 
    slug: '', 
    image: '' 
  });
  
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewCat({ ...newCat, image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const addCategory = async () => {
    if (!newCat.name?.trim()) return;
    const finalSlug = newCat.slug?.trim() || newCat.name.toLowerCase().replace(/\s+/g, '-');
    await addDoc(collection(db, "categories"), {
      ...newCat,
      slug: finalSlug,
      createdAt: serverTimestamp()
    });
    setNewCat({ name: '', parent: '', slug: '', image: '' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-gray-50 shadow-sm">
        <h3 className="font-black text-sm text-slate-800 pr-4">إدارة الأقسام</h3>
        <button onClick={() => setShowAdd(true)} className="bg-[#FF4500] text-white px-8 py-4 rounded-2xl font-black text-xs flex items-center gap-2 shadow-xl">
          <Plus size={18}/> إضافة قسم
        </button>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAdd(false)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="px-8 py-6 flex justify-between items-center border-b border-gray-50">
              <h3 className="text-xl font-black text-slate-900">إضافة قسم جديد</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-slate-900 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto no-scrollbar">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 mr-1 block">اسم القسم</label>
                <input 
                  placeholder="مثال: ملابس رجالية" 
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  className="w-full bg-white px-5 py-4 rounded-2xl border border-gray-100 outline-none font-bold text-sm focus:border-[#FF4500] transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 mr-1 block">القسم الرئيسي (اختياري)</label>
                <div className="relative">
                  <select 
                    value={newCat.parent}
                    onChange={(e) => setNewCat({ ...newCat, parent: e.target.value })}
                    className="w-full bg-white px-5 py-4 rounded-2xl border border-gray-100 outline-none font-bold text-sm appearance-none focus:border-[#FF4500] transition-all"
                  >
                    <option value="">-- قسم رئيسي --</option>
                    {categories.filter(c => !c.parent).map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 mr-1 block">الرابط المختصر (Slug)</label>
                <input 
                  placeholder="اتركه فارغاً للتوليد التلقائي" 
                  value={newCat.slug}
                  onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })}
                  className="w-full bg-white px-5 py-4 rounded-2xl border border-gray-100 outline-none font-bold text-sm focus:border-[#FF4500] transition-all"
                  dir="ltr"
                />
                <p className="text-[9px] text-gray-400 font-bold px-2">سيتم توليد رابط آمن تلقائياً إذا تركته فارغاً.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-black text-slate-500 flex items-center gap-2">
                    <ImageIcon size={14}/> صورة القسم
                  </label>
                </div>
                
                <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 space-y-6">
                  <div className="flex gap-2 p-1 bg-white rounded-xl border border-gray-100">
                    <button 
                      type="button"
                      onClick={() => setImageType('upload')}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${imageType === 'upload' ? 'bg-[#FF4500] text-white shadow-sm' : 'text-gray-400'}`}
                    >
                      رفع صورة
                    </button>
                    <button 
                      type="button"
                      onClick={() => setImageType('url')}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${imageType === 'url' ? 'bg-[#FF4500] text-white shadow-sm' : 'text-gray-400'}`}
                    >
                      رابط خارجي
                    </button>
                  </div>

                  {imageType === 'upload' ? (
                    <label className="flex flex-col items-center justify-center w-full aspect-[2/1] border-2 border-dashed border-gray-200 rounded-2xl bg-white cursor-pointer overflow-hidden hover:bg-orange-50/30 transition-all">
                      {newCat.image && !newCat.image.startsWith('http') ? (
                        <img src={newCat.image} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Camera className="mx-auto text-gray-300 mb-2" size={30} />
                          <p className="text-[10px] font-black text-gray-400 uppercase">اضغط لرفع الصورة</p>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
                    </label>
                  ) : (
                    <div className="relative">
                      <input 
                        placeholder="https://example.com/image.jpg"
                        value={newCat.image}
                        onChange={(e) => setNewCat({ ...newCat, image: e.target.value })}
                        className="w-full bg-white pl-12 pr-4 py-4 rounded-xl border border-gray-200 outline-none font-bold text-xs focus:border-[#FF4500]"
                        dir="ltr"
                      />
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 pt-4 flex gap-4 border-t border-gray-50">
              <button 
                onClick={addCategory} 
                className="flex-1 bg-[#FF4500] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 active:scale-95 transition-all"
              >
                <Check size={20}/> حفظ
              </button>
              <button 
                onClick={() => setShowAdd(false)} 
                className="flex-1 bg-white border border-gray-100 text-slate-500 py-4 rounded-2xl font-black text-sm active:scale-95 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white p-4 rounded-[2.5rem] border border-gray-50 shadow-sm flex flex-col items-center group transition-all hover:shadow-md relative">
            <div className="w-full aspect-square bg-gray-50 rounded-[2rem] overflow-hidden mb-4 border border-gray-50 flex items-center justify-center text-gray-200">
              {cat.image ? <img src={cat.image} className="w-full h-full object-cover" /> : <ImageIcon size={30} />}
            </div>
            <h4 className="font-black text-xs text-slate-700 text-center">{cat.name}</h4>
            {cat.parent && <span className="text-[8px] text-gray-400 font-bold mt-1">فرعي لـ {cat.parent}</span>}
            <div className="mt-4 flex gap-2">
               <button onClick={() => deleteDoc(doc(db, "categories", cat.id!))} className="text-red-100 hover:text-red-500 transition-colors p-2"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductsManager = ({ products, categories, globalStores }: { products: Product[], categories: StoreCategory[], globalStores: GlobalStore[] }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProd, setNewProd] = useState<Partial<Product>>({ 
    name: '', 
    price: 0, 
    discountPrice: 0,
    category: '', 
    description: '', 
    image: '', 
    stock: 10,
    sizes: [],
    colors: [],
    material: '',
    dimensions: '',
    isGlobalOrder: false,
    globalStoreId: ''
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewProd({ ...newProd, image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const toggleSize = (size: string) => {
    setNewProd(prev => ({
      ...prev,
      sizes: prev.sizes?.includes(size) 
        ? prev.sizes.filter(s => s !== size) 
        : [...(prev.sizes || []), size]
    }));
  };

  const toggleColor = (colorName: string) => {
    setNewProd(prev => ({
      ...prev,
      colors: prev.colors?.includes(colorName) 
        ? prev.colors.filter(c => c !== colorName) 
        : [...(prev.colors || []), colorName]
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) { alert("يرجى إكمال بيانات المنتج"); return; }
    
    if (editingId) {
      await updateDoc(doc(db, "products", editingId), { ...newProd });
    } else {
      await addDoc(collection(db, "products"), { 
        ...newProd, 
        id: Date.now(), 
        createdAt: serverTimestamp() 
      });
    }

    setShowAdd(false);
    setEditingId(null);
    setNewProd({ 
      name: '', price: 0, discountPrice: 0, category: '', description: '', 
      image: '', stock: 10, sizes: [], colors: [], material: '', dimensions: '', 
      isGlobalOrder: false, globalStoreId: ''
    });
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id.toString());
    setNewProd(p);
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-gray-50 shadow-sm">
        <h3 className="font-black text-sm text-slate-800 pr-4">إدارة المخزون ({products.length})</h3>
        <button onClick={() => { setShowAdd(!showAdd); setEditingId(null); setNewProd({ name:'', price:0, sizes:[], colors:[] }) }} className="bg-[#FF4500] text-white px-8 py-4 rounded-2xl font-black text-xs flex items-center gap-2 shadow-xl">
          <Plus size={18}/> {showAdd ? 'إلغاء' : 'منتج جديد'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-50 animate-in slide-in-from-top-4">
          <form onSubmit={handleSaveProduct} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
               <label className="flex flex-col items-center justify-center w-full aspect-[4/5] border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50 cursor-pointer overflow-hidden hover:bg-orange-50 transition-all">
                  {newProd.image ? <img src={newProd.image} className="w-full h-full object-cover" /> : (
                    <div className="text-center"><UploadCloud size={40} className="mx-auto text-gray-200 mb-4"/><p className="text-[10px] font-black text-gray-400 uppercase">صورة المنتج</p></div>
                  )}
                  <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
               </label>
            </div>
            
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 mr-2 uppercase">اسم المنتج</label>
                <input type="text" placeholder="اسم المنتج" className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-bold text-sm ring-1 ring-gray-100" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 mr-2 uppercase flex items-center gap-1"><DollarSign size={10}/> السعر الأصلي</label>
                  <input type="number" placeholder="السعر" className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-black text-sm ring-1 ring-gray-100" value={newProd.price || ''} onChange={e => setNewProd({...newProd, price: parseInt(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-orange-400 mr-2 uppercase flex items-center gap-1"><Tag size={10}/> السعر بعد الخصم (اختياري)</label>
                  <input type="number" placeholder="سعر الخصم" className="w-full bg-orange-50/30 p-5 rounded-2xl outline-none font-black text-sm text-[#FF4500] ring-1 ring-orange-100" value={newProd.discountPrice || ''} onChange={e => setNewProd({...newProd, discountPrice: parseInt(e.target.value) || 0})} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 mr-2 uppercase flex items-center gap-1"><List size={10}/> القسم</label>
                  <select className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-black text-xs ring-1 ring-gray-100" value={newProd.category} onChange={e => setNewProd({...newProd, category: e.target.value})}>
                    <option value="">اختر القسم</option>
                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 mr-2 uppercase flex items-center gap-1"><Box size={10}/> الكمية المتاحة</label>
                  <input type="number" placeholder="الكمية في المخزن" className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-black text-sm ring-1 ring-gray-100" value={newProd.stock} onChange={e => setNewProd({...newProd, stock: parseInt(e.target.value) || 0})} />
                </div>
              </div>

              <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-4">
                 <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-2"><Globe size={14}/> هل هذا منتج من متجر عالمي؟</label>
                    <input type="checkbox" checked={newProd.isGlobalOrder} onChange={e => setNewProd({...newProd, isGlobalOrder: e.target.checked})} className="w-5 h-5 accent-blue-600" />
                 </div>
                 {newProd.isGlobalOrder && (
                    <select className="w-full bg-white p-4 rounded-xl outline-none font-black text-xs border border-blue-100" value={newProd.globalStoreId} onChange={e => setNewProd({...newProd, globalStoreId: e.target.value})}>
                      <option value="">اختر المتجر العالمي</option>
                      {globalStores.map(store => <option key={store.id} value={store.id}>{store.name}</option>)}
                    </select>
                 )}
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 mr-2 uppercase flex items-center gap-1"><Ruler size={10}/> اختيار المقاسات المتاحة</label>
                <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  {COMMON_SIZES.map(size => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`min-w-[45px] h-10 px-3 rounded-xl text-[10px] font-black border transition-all ${newProd.sizes?.includes(size) ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 mr-2 uppercase flex items-center gap-1"><Palette size={10}/> اختيار الألوان المتاحة</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  {COMMON_COLORS.map(color => (
                    <button
                      type="button"
                      key={color.name}
                      onClick={() => toggleColor(color.name)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${newProd.colors?.includes(color.name) ? 'bg-white border-[#FF4500] shadow-sm' : 'bg-transparent border-transparent'}`}
                    >
                      <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center" style={{ backgroundColor: color.hex }}>
                         {newProd.colors?.includes(color.name) && <Check size={12} className={color.name === 'أبيض' ? 'text-black' : 'text-white'} />}
                      </div>
                      <span className={`text-[8px] font-black ${newProd.colors?.includes(color.name) ? 'text-[#FF4500]' : 'text-gray-400'}`}>{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="المكونات أو الخامة" className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-bold text-xs ring-1 ring-gray-100" value={newProd.material} onChange={e => setNewProd({...newProd, material: e.target.value})} />
                <input type="text" placeholder="الحجم أو الأبعاد" className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-bold text-xs ring-1 ring-gray-100" value={newProd.dimensions} onChange={e => setNewProd({...newProd, dimensions: e.target.value})} />
              </div>

              <textarea placeholder="وصف المنتج..." className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-bold text-sm ring-1 ring-gray-100 min-h-[120px]" value={newProd.description} onChange={e => setNewProd({...newProd, description: e.target.value})} />

              <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                <Save size={20}/> {editingId ? 'تحديث المنتج' : 'نشر المنتج في المتجر'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-gray-50 overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-right min-w-[800px]">
          <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase">
            <tr><th className="p-6">المنتج</th><th className="p-6 text-center">القسم</th><th className="p-6 text-center">السعر النهائي</th><th className="p-6 text-center">المصدر</th><th className="p-6 text-center">إجراءات</th></tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/10">
                <td className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-50 shrink-0"><img src={p.image} className="w-full h-full object-cover" /></div>
                  <div className="flex flex-col">
                    <p className="font-black text-xs text-slate-800">{p.name}</p>
                    <p className="text-[9px] text-gray-400 font-bold">{p.stock} قطعة في المخزون</p>
                  </div>
                </td>
                <td className="p-6 text-center"><span className="bg-gray-50 px-3 py-1 rounded-full text-[9px] font-black text-gray-400">{p.category}</span></td>
                <td className="p-6 text-center font-black text-[#FF4500] text-sm">{(p.discountPrice || p.price)?.toLocaleString()} ر.ي</td>
                <td className="p-6 text-center">
                  {p.isGlobalOrder ? (
                    <div className="flex flex-col items-center gap-1">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[8px] font-black">عالمي</span>
                      {p.globalStoreId && <span className="text-[8px] text-gray-400 font-bold italic">{globalStores.find(s=>s.id === p.globalStoreId)?.name}</span>}
                    </div>
                  ) : <span className="text-[9px] text-gray-300 font-bold italic">محلي</span>}
                </td>
                <td className="p-6 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => startEdit(p)} className="p-2 text-gray-200 hover:text-blue-500 transition-colors"><Edit size={16}/></button>
                    <button onClick={() => deleteDoc(doc(db, "products", p.id.toString()))} className="p-2 text-gray-200 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SettingsView = ({ settings, onSave }: { settings: StoreSettings, onSave: (s: StoreSettings) => void }) => {
  const [s, setS] = useState<StoreSettings>(settings);
  const [saving, setSaving] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setS({ ...s, logo: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "main"), s);
      onSave(s);
      alert("تم الحفظ والمزامنة مع المتجر");
    } catch (e) { alert("خطأ في الحفظ"); }
    setSaving(false);
  };

  return (
    <div className="bg-white p-10 rounded-[3.5rem] border border-gray-50 shadow-sm space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-gray-50 pb-8">
         <h3 className="text-xl font-black text-slate-900 flex items-center gap-3"><Sliders className="text-[#FF4500]"/> إعدادات الهوية</h3>
         <button onClick={handleSave} disabled={saving} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black shadow-xl flex items-center gap-2">
           {saving ? <RefreshCw size={18} className="animate-spin"/> : <Save size={18}/>} حفظ التغييرات
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-1 space-y-4 text-center">
           <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">شعار المتجر (Logo)</label>
           <label className="mx-auto w-32 h-32 rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-100 flex items-center justify-center cursor-pointer overflow-hidden transition-all hover:bg-orange-50 hover:border-orange-200">
             {s.logo ? <img src={s.logo} className="w-20 h-20 object-contain" /> : <UploadCloud className="text-gray-300" size={30} />}
             <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
           </label>
           <p className="text-[8px] font-bold text-gray-300">يفضل صورة شفافة PNG</p>
        </div>
        <div className="md:col-span-2 space-y-8">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">اسم المتجر</label>
            <input value={s.name} onChange={e => setS({...s, name: e.target.value})} className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-bold text-sm ring-1 ring-gray-100" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">واتساب</label>
              <input value={s.contactInfo.whatsapp} onChange={e => setS({...s, contactInfo: {...s.contactInfo, whatsapp: e.target.value}})} className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-bold text-sm ring-1 ring-gray-100" />
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">البريد</label>
              <input value={s.contactInfo.email} onChange={e => setS({...s, contactInfo: {...s.contactInfo, email: e.target.value}})} className="w-full bg-gray-50 p-5 rounded-2xl outline-none font-bold text-sm ring-1 ring-gray-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrdersManager = ({ orders, compact = false }: { orders: Order[], compact?: boolean }) => {
  const updateStatus = async (id: string, newStatus: string) => { await updateDoc(doc(db, "orders", id), { status: newStatus }); };
  const deleteOrder = async (id: string) => { if (confirm("حذف الطلب؟")) await deleteDoc(doc(db, "orders", id)); };

  return (
    <div className={`bg-white ${compact ? '' : 'p-8 rounded-[3rem] border border-gray-50 shadow-sm'} overflow-x-auto no-scrollbar`}>
      <table className="w-full text-right min-w-[600px]">
        <thead>
          <tr className="bg-gray-50 text-[10px] font-black text-gray-400 border-b border-gray-50 uppercase tracking-widest">
            <th className="p-6">الطلب</th><th className="p-6">العميل</th><th className="p-6 text-center">المبلغ</th><th className="p-6 text-center">الحالة</th>{!compact && <th className="p-6 text-center">إجراء</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id} className="border-b border-gray-50">
              <td className="p-6 font-black text-[10px] text-gray-400 uppercase">#ORD-{o.id.slice(0,5)}</td>
              <td className="p-6"><p className="font-black text-xs text-slate-800">{o.customerName}</p><p className="text-[10px] text-gray-400 font-bold">{o.phone}</p></td>
              <td className="p-6 text-center font-black text-[#FF4500] text-xs">{(o.total || 0).toLocaleString()} ر.ي</td>
              <td className="p-6 text-center">
                 <span className={`px-3 py-1 rounded-full text-[9px] font-black ${o.status === 'new' ? 'bg-blue-50 text-blue-500' : o.status === 'completed' ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'}`}>{o.status === 'new' ? 'جديد' : o.status === 'completed' ? 'مكتمل' : 'جاري'}</span>
              </td>
              {!compact && (
                <td className="p-6 text-center"><button onClick={() => deleteOrder(o.id)} className="p-2 text-red-100 hover:text-red-500"><Trash2 size={16}/></button></td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const BannersManager = ({ banners }: { banners: any[] }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newBanner, setNewBanner] = useState({ title: '', badge: '', description: '', buttonText: '' });
  const addBanner = async () => { await addDoc(collection(db, "banners"), { ...newBanner, createdAt: serverTimestamp() }); setShowAdd(false); };
  return (
    <div className="space-y-8">
      <button onClick={() => setShowAdd(!showAdd)} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs flex items-center gap-2 shadow-xl hover:bg-black">{showAdd ? 'إغلاق' : 'إعلان جديد'}</button>
      {showAdd && (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl space-y-6">
          <div className="grid grid-cols-2 gap-6"><input placeholder="العنوان" value={newBanner.title} onChange={e => setNewBanner({...newBanner, title: e.target.value})} className="bg-gray-50 p-5 rounded-2xl border-none font-bold text-sm" /><input placeholder="الشارة" value={newBanner.badge} onChange={e => setNewBanner({...newBanner, badge: e.target.value})} className="bg-gray-50 p-5 rounded-2xl border-none font-bold text-sm" /></div>
          <button onClick={addBanner} className="w-full bg-[#FF4500] text-white py-5 rounded-2xl font-black shadow-lg">حفظ ونشر</button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map(b => (
          <div key={b.id} className="bg-white p-8 rounded-[3.5rem] border border-gray-50 relative overflow-hidden group shadow-sm">
            <div className="relative z-10 space-y-4">
              <span className="bg-orange-100 text-[#FF4500] px-4 py-1.5 rounded-full text-[9px] font-black">{b.badge}</span>
              <h4 className="text-2xl font-black text-slate-800 tracking-tighter leading-tight">{b.title}</h4>
            </div>
            <button onClick={() => deleteDoc(doc(db, "banners", b.id))} className="absolute top-6 left-6 p-2 text-red-100 hover:text-red-500"><Trash2 size={16}/></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const MessagesManager = ({ messages }: { messages: ContactMessage[] }) => (
  <div className="space-y-6">
    {messages.length === 0 ? <div className="text-center py-20 bg-white rounded-[3.5rem] border border-gray-50 font-black text-gray-300">لا توجد رسائل</div> : (
      messages.map(m => (
        <div key={m.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm flex gap-6 items-start animate-in fade-in">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0"><User size={24}/></div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center"><h4 className="font-black text-sm text-slate-800">{m.name}</h4><span className="text-[10px] text-gray-300 font-bold uppercase">{m.createdAt?.toDate ? m.createdAt.toDate().toLocaleDateString('ar-YE') : 'الآن'}</span></div>
            <p className="text-xs text-gray-500 leading-relaxed font-bold">{m.message}</p>
          </div>
          <button onClick={() => deleteDoc(doc(db, "messages", m.id))} className="text-red-100 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
        </div>
      ))
    )}
  </div>
);

export default Dashboard;
