
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, ShoppingCart, Package } from 'lucide-react';

interface MobileNavProps {
  cartCount: number;
}

const MobileNav: React.FC<MobileNavProps> = ({ cartCount }) => {
  const location = useLocation();
  const activeClass = "text-primary scale-110";
  const inactiveClass = "text-gray-400";

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-t border-gray-100 flex justify-around items-center py-3 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <Link to="/" className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/' ? activeClass : inactiveClass}`}>
        <Home size={20} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
        <span className="text-[9px] font-bold">الرئيسية</span>
      </Link>
      <Link to="/shop" className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/shop' ? activeClass : inactiveClass}`}>
        <Package size={20} strokeWidth={location.pathname === '/shop' ? 2.5 : 2} />
        <span className="text-[9px] font-bold">المنتجات</span>
      </Link>
      <Link to="/cart" className={`flex flex-col items-center gap-1 transition-all relative ${location.pathname === '/cart' ? activeClass : inactiveClass}`}>
        <ShoppingCart size={20} strokeWidth={location.pathname === '/cart' ? 2.5 : 2} />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-[7px] w-4 h-4 rounded-full flex items-center justify-center font-extrabold border-2 border-white shadow-sm">
            {cartCount}
          </span>
        )}
        <span className="text-[9px] font-bold">السلة</span>
      </Link>
      {/* Nice One link removed as requested */}
      <Link to="/login" className={`flex flex-col items-center gap-1 transition-all ${location.pathname === '/login' ? activeClass : inactiveClass}`}>
        <User size={20} strokeWidth={location.pathname === '/login' ? 2.5 : 2} />
        <span className="text-[9px] font-bold">حسابي</span>
      </Link>
    </div>
  );
};

export default MobileNav;

