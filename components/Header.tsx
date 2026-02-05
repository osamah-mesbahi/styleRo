
import React, { useEffect, useState } from 'react';
import { Search, Bell, Info, Menu, ShoppingCart } from 'lucide-react';
import { db } from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { StoreSettings } from '../types';

interface HeaderProps {
  onMenuOpen: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuOpen }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "main"), (snap) => {
      if (snap.exists()) setSettings(snap.data() as StoreSettings);
    });
    return () => unsub();
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[50]" dir="rtl">
      {settings?.notificationBar?.enabled && (
        <div 
          style={{ 
            backgroundColor: settings.notificationBar.bgColor,
            color: settings.notificationBar.textColor
          }}
          className="py-2 px-4 text-center shadow-sm"
        >
          <p className="text-[9px] font-black tracking-tight flex items-center justify-center gap-2">
            <Info size={12} />
            {settings.notificationBar.text}
          </p>
        </div>
      )}

      <header className="bg-white/90 backdrop-blur-md px-5 py-3 flex justify-between items-center border-b border-gray-100">
        <button 
          onClick={onMenuOpen}
          className="p-2.5 bg-gray-50 rounded-2xl text-slate-800 active:scale-90 transition-all"
        >
          <Menu size={22} strokeWidth={2.5} />
        </button>

        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-black italic tracking-tighter text-brand-black leading-none">Style<span className="text-brand-accent">Ro</span></h1>
          <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-1">Smart Elegance</span>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2.5 bg-gray-50 rounded-2xl text-slate-800 active:scale-90 transition-all">
            <Search size={22} strokeWidth={2.5} />
          </button>
        </div>
      </header>
    </div>
  );
};

export default Header;
