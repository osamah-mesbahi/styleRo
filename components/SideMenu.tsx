
import React from 'react';
import { X, ShoppingCart, ChevronDown, User, Heart, Package, ShoppingBag, Layers, Home, Info, MessageSquare, Globe } from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  cartCount: number;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, activeTab, onTabChange, cartCount }) => {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'home', label: 'الرئيسية', icon: <Home size={20}/> },
    { id: 'categories', label: 'الأقسام', icon: <Layers size={20}/> },
    { id: 'shop', label: 'المنتجات', icon: <ShoppingBag size={20}/> },
    { id: 'shein', label: 'وساطة شي إن', icon: <Globe size={20}/> },
    { id: 'special', label: 'طلبات خاصة', icon: <Sparkles size={20}/> },
    { id: 'tracking', label: 'تتبع الطلب', icon: <Package size={20}/> },
    { id: 'contact', label: 'تواصل معنا', icon: <MessageSquare size={20}/> },
    { id: 'favorites', label: 'المفضلة', icon: <Heart size={20}/> },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar" dir="rtl">
      {/* Top Bar Header */}
      <header className="px-6 py-4 flex justify-between items-center bg-white sticky top-0 z-10 border-b border-gray-50/50">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-50 rounded-xl transition-all">
            <X size={24} />
          </button>
          <div className="w-10 h-10 rounded-full bg-red-50 text-[#FF4500] flex items-center justify-center font-black text-sm">
            S
          </div>
          <div className="relative">
             <ShoppingCart size={22} className="text-gray-400" />
             {cartCount > 0 && (
               <span className="absolute -top-2 -right-2 bg-[#FF4500] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                 {cartCount}
               </span>
             )}
          </div>
          <button className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl text-[10px] font-black text-gray-500 border border-gray-100">
            USD <ChevronDown size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2">
           <h2 className="text-xl font-black italic tracking-tighter text-slate-900">ستايل رو</h2>
           <div className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center shadow-sm">
              <img src="https://stylero.online/logo.png" className="w-6 h-6 object-contain" alt="Logo" />
           </div>
        </div>
      </header>

      {/* User Profile Button */}
      <div className="px-6 pt-6 mb-10">
        <button className="w-full bg-[#FFF5F5] py-4 rounded-2xl flex items-center justify-center gap-3 border border-red-50 group hover:shadow-md transition-all">
          <User size={18} className="text-[#FF4500]" />
          <span className="text-sm font-black text-[#8B1A1A]">حسابي</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="px-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onTabChange(item.id);
              onClose();
            }}
            className={`w-full text-right py-4 px-4 rounded-2xl transition-all font-black text-sm flex items-center justify-end gap-4 ${
              activeTab === item.id 
              ? 'bg-gray-50 text-slate-900 shadow-sm' 
              : 'text-gray-400 hover:text-slate-900'
            }`}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Extra spacing for bottom */}
      <div className="h-32"></div>
    </div>
  );
};

const Sparkles = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
  </svg>
);

export default SideMenu;
