
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Globe, LogOut, LayoutDashboard, User, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { Currency, StoreSettings } from '../types';
import { MAIN_CATEGORIES as DEFAULT_CATEGORIES } from '../constants';
import { getFcmToken, onMessageHandler } from '../firebase';

interface HeaderProps {
  currency: Currency;
  onToggleCurrency: () => void;
  user: any;
  onLogout: () => void;
  cartCount: number;
  settings: StoreSettings;
}

const Header: React.FC<HeaderProps> = ({ currency, onToggleCurrency, user, onLogout, cartCount, settings }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [sseMessage, setSseMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNoti, setShowNoti] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('stylero_noti_sound') === '1'; } catch (e) { return true; }
  });
  const [desktopEnabled, setDesktopEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem('stylero_noti_desktop') === '1'; } catch (e) { return false; }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) {
      navigate('/shop');
      return;
    }
    navigate(`/shop?query=${encodeURIComponent(term)}`);
  };

  useEffect(() => {
    // try to register FCM token when component mounts and user is present
    (async () => {
        const shouldRegister = !!(navigator && 'serviceWorker' in navigator);
        if (!shouldRegister) return;
        const saved = localStorage.getItem('stylero_fcm_token');
        const token = await getFcmToken();
        try {
          if (token && !saved) {
            localStorage.setItem('stylero_fcm_token', token);
          }
          if (token) {
            onMessageHandler((msg: any) => {
              setSseMessage(msg?.notification?.title || 'رسالة جديدة');
            });
          }
        } catch (e) {
          console.warn('FCM registration error', e);
        }
    })();
  }, []);

  // Horizontal scrolling for desktop nav strip
  const navScrollerRef = useRef<HTMLDivElement>(null);
  const scrollNavLeft = () => navScrollerRef.current?.scrollBy({ left: -250, behavior: 'smooth' });
  const scrollNavRight = () => navScrollerRef.current?.scrollBy({ left: 250, behavior: 'smooth' });
  useEffect(() => {
    const el = navScrollerRef.current;
    if (!el) return;
    const id = setInterval(() => {
      if (!el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: 200, behavior: 'smooth' });
      }
    }, 7000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-50 shadow-sm" style={{ height: 'var(--header-height)', top: 'env(safe-area-inset-top)' }}>
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        
        {/* Logo Section */}
        <Link to="/" className="flex flex-col items-center flex-shrink-0 group py-1 logo-large">
          {settings.logo ? (
            <img src={settings.logo} alt={settings.storeName} className="h-8 md:h-10 object-contain" />
          ) : (
            <h1 className="text-lg md:text-xl font-extrabold tracking-tighter text-black uppercase leading-none group-hover:text-primary transition-colors">
              {settings.storeName}
            </h1>
          )}
          <span className="text-[6px] md:text-[7px] tracking-[0.4em] text-primary font-bold uppercase mt-0.5">Yemen Style</span>
        </Link>

        {/* Integrated Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg relative group hidden sm:block">
          <input 
            type="text" 
            placeholder="ابحثي عن جمالك هنا..." 
            className="w-full bg-gray-50 border border-transparent rounded-full py-3 px-12 focus:bg-white focus:border-primary/20 transition-all outline-none text-[12px] font-extrabold text-right"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        </form>

        {/* Compact Actions */}
        <div className="flex items-center gap-1 md:gap-4">
          <button 
            onClick={onToggleCurrency}
            className="hidden lg:flex items-center gap-1 bg-gray-50 hover:bg-gray-100 transition px-3 py-1.5 rounded-lg text-[9px] font-extrabold border border-gray-100"
          >
            <Globe size={11} className="text-primary" />
            <span>{currency === Currency.SAR ? 'SAR' : 'YER'}</span>
          </button>

          <Link to="/login" className="text-gray-400 hover:text-primary transition-colors p-2">
            <User size={20} />
          </Link>
          
          <Link to="/cart" className="relative text-gray-900 hover:text-primary transition-all p-2">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-primary text-white text-[6px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center font-extrabold border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="relative">
            <button onClick={() => setShowNoti(s => !s)} className="relative p-2 text-gray-700 hover:text-primary">
              <Bell size={18} />
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="absolute top-0 right-0 translate-x-1 -translate-y-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-extrabold">{notifications.filter(n => !n.isRead).length}</span>
              )}
            </button>

            {showNoti && (
              <div className="absolute w-72 right-0 mt-2 bg-white border border-gray-100 shadow-lg rounded-lg z-50 text-right">
                <div className="p-2 border-b flex items-center justify-between text-sm font-extrabold">
                  <div>الإشعارات</div>
                  <div className="flex items-center gap-3">
                    <button onClick={toggleSound} className={`text-[11px] px-2 py-1 rounded ${soundEnabled ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>{soundEnabled ? 'صوت ✅' : 'صوت'}</button>
                    <button onClick={toggleDesktop} className={`text-[11px] px-2 py-1 rounded ${desktopEnabled ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>{desktopEnabled ? 'ديسكتوب ✅' : 'ديسكتوب'}</button>
                    <div className="text-[11px]"><Link to="/notifications" className="text-primary font-extrabold">عرض الكل</Link></div>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 && <div className="p-3 text-xs text-gray-400">لا توجد إشعارات</div>}
                  {notifications.map(n => (
                    <div key={n.id} className={`p-3 text-xs border-b hover:bg-gray-50 ${n.isRead ? 'bg-white' : 'bg-gray-50'}`}>
                      <div className="font-bold text-[11px]">{n.title}</div>
                      <div className="text-[10px] text-gray-600 mt-1">{n.message}</div>
                      <div className="mt-2 flex items-center gap-2">
                        {!n.isRead && <button onClick={() => markRead(n.id)} className="text-[10px] text-primary font-extrabold">تم</button>}
                        <div className="text-[9px] text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center text-xs text-gray-500 border-t">
                  <button onClick={() => { setShowNoti(false); }} className="font-extrabold">إغلاق</button>
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center border-r pr-4 border-gray-100 mr-1 py-1">
            {user ? (
              <div className="flex items-center gap-3">
                {user.isAdmin && (
                  <Link to="/admin" className="p-1.5 text-primary bg-pink-50 rounded-lg hover:bg-pink-100 transition">
                    <LayoutDashboard size={14} />
                  </Link>
                )}
                <span className="text-[9px] font-extrabold text-gray-700 truncate max-w-[60px]">{user.name}</span>
                <button onClick={onLogout} className="text-gray-300 hover:text-red-500 transition-colors"><LogOut size={14}/></button>
              </div>
            ) : (
              <Link to="/login" className="bg-black text-white px-5 py-1.5 rounded-full hover:bg-primary transition text-[9px] font-extrabold">
                دخول
              </Link>
            )}
          </div>
        </div>

      </div>
      {/* spacer to avoid content being hidden under fixed header */}
      <div style={{ height: 'calc(env(safe-area-inset-top) + var(--header-height))' }} />

      {sseMessage && (
        <div className="fixed" style={{ top: 'calc(var(--header-height) + 8px)', right: '1rem', zIndex: 60 }}>
          <div className="bg-primary text-white px-4 py-2 rounded-lg shadow-lg text-sm font-bold">{sseMessage}</div>
        </div>
      )}
      

      {/* Clean & Balanced Category Nav with smooth horizontal movement */}
      <nav className="border-t border-gray-50 hidden md:block bg-white">
        <div className="relative max-w-7xl mx-auto px-4 py-1.5">
          <div ref={navScrollerRef} className="flex overflow-x-auto no-scrollbar scroll-smooth gap-6 items-center text-[9px] font-extrabold uppercase tracking-widest text-gray-400">
            <Link to="/" className={`flex-shrink-0 hover:text-primary transition-colors ${location.pathname === '/' ? 'text-primary' : ''}`}>الرئيسية</Link>
            <Link to="/shop" className={`flex-shrink-0 hover:text-primary transition-colors ${location.pathname === '/shop' && !location.search ? 'text-primary' : ''}`}>جميع المنتجات</Link>
            {categories.map(cat => (
              <Link 
                key={cat.id || cat.name} 
                to={`/shop?cat=${cat.name}`} 
                className={`flex-shrink-0 hover:text-primary transition-colors ${location.search.includes(cat.name) ? 'text-primary' : ''}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
          {/* Scroll controls (desktop) */}
          <button aria-label="scroll left" onClick={scrollNavLeft} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 shadow-sm border border-gray-100 rounded-full p-1.5 hidden lg:flex">
            <ChevronLeft size={14} />
          </button>
          <button aria-label="scroll right" onClick={scrollNavRight} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 shadow-sm border border-gray-100 rounded-full p-1.5 hidden lg:flex">
            <ChevronRight size={14} />
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;

