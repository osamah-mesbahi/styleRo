
import React from 'react';
import { Home, Grid, ShoppingBag, Truck, User, Globe } from 'lucide-react';

interface BottomNavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavbar: React.FC<BottomNavbarProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'الرئيسية' },
    { id: 'shop', icon: Grid, label: 'تصفح' },
    { id: 'global-order', icon: Globe, label: 'وساطة' },
    { id: 'tracking', icon: Truck, label: 'طلباتي' },
    { id: 'dashboard', icon: User, label: 'إدارة' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 px-4 py-3 pb-8 flex justify-around items-center z-[55] rounded-t-[2.5rem] shadow-[0_-8px_30px_rgba(0,0,0,0.05)]" dir="rtl">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 relative ${
              isActive ? 'text-brand-accent -translate-y-1' : 'text-gray-400'
            }`}
          >
            <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-orange-50 shadow-sm' : 'bg-transparent'}`}>
              <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[9px] font-black tracking-tighter ${isActive ? 'text-brand-accent' : 'text-gray-400'}`}>
              {tab.label}
            </span>
            {isActive && <div className="absolute -bottom-1 w-1 h-1 bg-brand-accent rounded-full"></div>}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavbar;
