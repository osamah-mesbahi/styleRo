
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomeView from './components/HomeView';
import ShopView from './components/ShopView';
import Dashboard from './components/Dashboard';
import OrderTracking from './components/OrderTracking';
import ProductDetails from './components/ProductDetails';
import BottomNavbar from './components/BottomNavbar';
import ChatWidget from './components/ChatWidget';
import CartView from './components/CartView';
import CheckoutView from './components/CheckoutView';
import OrderSuccess from './components/OrderSuccess';
import LoginPage from './components/LoginPage';
import SideMenu from './components/SideMenu';
import ContactView from './components/ContactView';
import GlobalOrderView from './components/GlobalOrderView';
import { Product, CartItem, StoreSettings } from './types';
import { MOCK_PRODUCTS, fetchProducts } from './services/db';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { initializeChat } from './services/geminiService';

const ADMIN_EMAIL = 'osamah.mesbahi@gmail.com';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [lastOrderId, setLastOrderId] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<Product[]>(MOCK_PRODUCTS);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    
    // تحميل المنتجات وتهيئة الدردشة
    fetchProducts().then(prods => {
      setAllProducts(prods);
      initializeChat(prods);
    });

    return () => unsubscribe();
  }, []);

  const [settings, setSettings] = useState<StoreSettings>({
    name: 'ستايل رو',
    description: 'متجرك الأول للتسوق الإلكتروني والأناقة العصرية',
    primaryColor: '#FF4500',
    logo: 'https://stylero.online/logo.png',
    notificationBar: {
      enabled: true,
      text: 'توصيل مجاني لفترة محدودة داخل صنعاء 🚚',
      link: '',
      bgColor: '#FF4500',
      textColor: '#FFFFFF'
    },
    features: {
      maintenance: false,
      whatsappOrder: true,
      sheinOrder: true,
      externalStores: true,
      trackingPage: true,
      reviews: true,
      coupons: true
    },
    currencies: [
      { id: '1', name: 'ريال يمني', symbol: 'ر.ي', rate: 1, active: true, isBase: true },
    ],
    deliveryCities: [
      { id: '1', name: 'صنعاء', fee: 500, time: '2-3 أيام', active: true }
    ],
    paymentMethods: [
      { id: '1', type: 'bank', provider: 'الكريمي', accountName: 'متجر ستايل رو', accountNumber: '123456', active: true }
    ],
    contactInfo: {
      phone: '+967 772728311',
      whatsapp: '967772728311',
      email: 'stylero.online@gmail.com',
      address: 'صنعاء، اليمن'
    }
  });

  const handleDashboardAccess = () => {
    if (user?.email === ADMIN_EMAIL) setActiveTab('dashboard');
    else setActiveTab('login');
  };

  const handleAddToCart = (product: Product, qty: number, size?: string, color?: string) => {
    const cartItemId = `${product.id}-${size || 'no'}-${color || 'no'}`;
    const existingItem = cart.find(item => item.cartItemId === cartItemId);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + qty } : item
      ));
    } else {
      const newItem: CartItem = { ...product, quantity: qty, cartItemId, selectedSize: size, selectedColor: color };
      setCart([...cart, newItem]);
    }
    setActiveTab('cart'); 
    setSelectedProduct(null);
  };

  const isNavHidden = ['details', 'cart', 'checkout', 'success', 'dashboard', 'login', 'global-order'].includes(activeTab);

  return (
    <div className="min-h-screen bg-[#FDFDFD] selection:bg-orange-100" dir="rtl">
      {!isNavHidden && <Header onMenuOpen={() => setIsMenuOpen(true)} />}
      
      {!isNavHidden && (
        <SideMenu 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === 'dashboard') handleDashboardAccess();
            else setActiveTab(tab);
          }}
          cartCount={cart.length}
        />
      )}

      <main className={`${isNavHidden ? '' : 'pt-20 pb-32'} transition-all duration-300`}>
        {activeTab === 'home' && (
          <HomeView 
            onProductClick={(p) => { setSelectedProduct(p); setActiveTab('details'); }} 
            onViewAll={() => setActiveTab('shop')}
            onGlobalOrder={() => setActiveTab('global-order')}
          />
        )}
        {activeTab === 'shop' && <ShopView onProductClick={(p) => { setSelectedProduct(p); setActiveTab('details'); }} />}
        {activeTab === 'tracking' && <OrderTracking />}
        {activeTab === 'contact' && <ContactView />}
        {activeTab === 'global-order' && <GlobalOrderView onBack={() => setActiveTab('home')} onSuccess={(id) => { setLastOrderId(id); setActiveTab('success'); }} />}
        
        {activeTab === 'dashboard' && (
          <Dashboard 
            products={allProducts} 
            settings={settings}
            onUpdateSettings={setSettings}
            onLogout={() => { auth.signOut(); setActiveTab('home'); }}
            language="ar"
          />
        )}

        {activeTab === 'login' && <LoginPage onSuccess={() => setActiveTab('dashboard')} onBack={() => setActiveTab('home')} />}
        
        {activeTab === 'details' && selectedProduct && (
          <ProductDetails 
            product={selectedProduct} 
            onBack={() => setActiveTab('shop')} 
            onAddToCart={handleAddToCart} 
          />
        )}

        {activeTab === 'cart' && (
          <CartView 
            cartItems={cart} 
            onUpdateQty={(id, d) => setCart(prev => prev.map(item => item.cartItemId === id ? {...item, quantity: Math.max(1, item.quantity + d)} : item))} 
            onRemove={(id) => setCart(prev => prev.filter(item => item.cartItemId !== id))} 
            onCheckout={() => setActiveTab('checkout')}
            onBack={() => setActiveTab('shop')} 
          />
        )}

        {activeTab === 'checkout' && (
          <CheckoutView 
            onBack={() => setActiveTab('cart')} 
            onSuccess={(id) => { setLastOrderId(id); setCart([]); setActiveTab('success'); }}
            totalAmount={cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)} 
          />
        )}

        {activeTab === 'success' && (
          <OrderSuccess orderId={lastOrderId} onGoHome={() => setActiveTab('home')} />
        )}
      </main>

      {!isNavHidden && <ChatWidget />}
      {!isNavHidden && (
        <BottomNavbar 
          activeTab={activeTab} 
          onTabChange={(tab) => tab === 'dashboard' ? handleDashboardAccess() : setActiveTab(tab)} 
        />
      )}
    </div>
  );
};

export default App;
