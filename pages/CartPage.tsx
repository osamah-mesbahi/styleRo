
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, MessageCircle, User, Phone, MapPin, Info, Truck, ChevronDown, LogIn } from 'lucide-react';
import { Currency, Order, OrderStatus } from '../types';
import { SAR_TO_YER_RATE, STORE_NAME, PHONE, YEMEN_GOVERNORATES } from '../constants';

interface CartPageProps {
  cart: any[];
  currency: Currency;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, newQty: number) => void;
}

const CartPage: React.FC<CartPageProps> = ({ cart, currency, removeFromCart, updateQuantity }) => {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerLocation, setCustomerLocation] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [step, setStep] = useState(1); // 1: Cart, 2: Delivery

  useEffect(() => {
    const savedUser = localStorage.getItem('stylero_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setIsLoggedIn(true);
      setCustomerName(user.name || '');
      setCustomerPhone(user.phone || '');
    }
  }, []);

  const totalSAR = cart.reduce((acc, item) => acc + (item.priceSAR * item.quantity), 0);
  
  const getShipping = () => {
    if (!selectedRegion) return { feeYER: 0, label: 'اختر المحافظة' };
    if (selectedRegion.includes('صنعاء')) return { feeYER: 800, label: '800 ر.ي' };
    return { feeYER: 0, label: 'يحدد حسب شركة الشحن' };
  };

  const { feeYER, label: shippingLabel } = getShipping();
  const shippingFeeSAR = feeYER / SAR_TO_YER_RATE;
  const grandTotalSAR = totalSAR + shippingFeeSAR;
  
  const formatPrice = (priceSAR: number) => {
    if (currency === Currency.SAR) return `${Math.round(priceSAR)} ر.س`;
    return `${Math.round(priceSAR * SAR_TO_YER_RATE).toLocaleString()} ر.ي`;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: boolean } = {};
    if (!customerName.trim()) newErrors.name = true;
    if (!customerPhone.trim()) newErrors.phone = true;
    if (!customerLocation.trim()) newErrors.location = true;
    if (!selectedRegion) newErrors.region = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveOrderToAdmin = () => {
    const newOrder: Order = {
      id: `RO-${Math.floor(100000 + Math.random() * 899999)}`,
      customerName,
      phoneNumber: customerPhone,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        priceSAR: item.priceSAR,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor,
        volume: item.selectedVolume,
        image: item.images[0]
      })),
      totalSAR: grandTotalSAR,
      totalYER: grandTotalSAR * SAR_TO_YER_RATE,
      status: OrderStatus.PENDING,
      paymentMethod: 'WhatsApp Order',
      createdAt: new Date().toISOString(),
      trackingCode: ''
    };

    const existingOrders = JSON.parse(localStorage.getItem('stylero_orders') || '[]');
    const updatedOrders = [newOrder, ...existingOrders];
    localStorage.setItem('stylero_orders', JSON.stringify(updatedOrders));
    window.dispatchEvent(new Event('storage'));
  };

  const handleOrderCompletion = () => {
    if (!isLoggedIn) {
      alert('يرجى تسجيل الدخول أولاً لتأكيد طلبك وتتبع شحنتك.');
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      alert('يرجى إكمال بيانات التوصيل');
      return;
    }

    saveOrderToAdmin();

    let message = `*طلب جديد من متجر ${STORE_NAME}*\n\n`;
    message += `👤 *العميلة:* ${customerName}\n`;
    message += `📞 *الهاتف:* ${customerPhone}\n`;
    message += `📍 *المحافظة:* ${selectedRegion}\n`;
    message += `🏠 *العنوان:* ${customerLocation}\n\n`;
    message += `🛍️ *الطلبات:* (${cart.length} منتجات)\n`;
    cart.forEach((item, idx) => {
      message += `${idx + 1}. ${item.name} | ${item.selectedSize || item.selectedVolume || ''} (x${item.quantity})\n`;
    });
    message += `\n💰 *الإجمالي:* ${formatPrice(grandTotalSAR)}\n`;
    message += `🚚 *الشحن:* ${shippingLabel}\n\n`;
    message += `بانتظار التأكيد لبدء التنفيذ..`;

    window.open(`https://wa.me/967${PHONE}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200">
          <ShoppingBag size={50} />
        </div>
        <h2 className="text-3xl font-extrabold mb-8 italic">سلتك فارغة حالياً</h2>
        <Link to="/shop" className="btn-primary px-12 py-4 rounded-2xl font-extrabold shadow-xl transition-all">ابدأي التسوق</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24 mt-8 text-right" dir="rtl">
      {/* Checkout Steps Header */}
      <div className="flex items-center justify-center gap-6 mb-12">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold border-2 transition ${step >= 1 ? 'border-primary bg-pink-50 text-primary' : 'border-gray-200 text-gray-300'}`}>1</div>
          <div className={`text-[11px] font-extrabold ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>حقيبة التسوق</div>
        </div>
        <div className="w-16 h-0.5 bg-gray-100"></div>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold border-2 transition ${step >= 2 ? 'border-primary bg-pink-50 text-primary' : 'border-gray-200 text-gray-300'}`}>2</div>
          <div className={`text-[11px] font-extrabold ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>التوصيل والدفع</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-zoom-in">
        <div className="lg:col-span-2 space-y-8">
          {step === 1 ? (
            <div className="nice-card bg-white rounded-[2.5rem] p-8 space-y-6 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-extrabold mb-6">المنتجات المختارة ({cart.length})</h3>
              <div className="divide-y divide-gray-50">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-6 items-center py-6 group">
                      <div className="relative w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden">
                        <img src={item.images[0]} className="w-full h-full object-cover rounded-2xl shadow-sm group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-bold text-sm text-gray-800 leading-tight">{item.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold">{item.selectedSize || item.selectedVolume || 'بدون إضافات'}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-2xl">
                            <button onClick={() => updateQuantity(index, item.quantity - 1)} className="text-gray-500 hover:text-black p-2 bg-white rounded-full shadow-sm"><Minus size={14}/></button>
                            <span className="font-extrabold text-sm w-8 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(index, item.quantity + 1)} className="text-gray-500 hover:text-black p-2 bg-white rounded-full shadow-sm"><Plus size={14}/></button>
                          </div>
                        <span className="font-extrabold text-primary text-sm">{formatPrice(item.priceSAR * item.quantity)}</span>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(index)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={20}/></button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="nice-card bg-white rounded-[2.5rem] p-8 space-y-8 shadow-sm border border-gray-100 animate-slide-in-right">
              <div className="flex justify-between items-center border-b pb-4">
                 <h3 className="text-xl font-extrabold flex items-center gap-2"><MapPin size={22} className="text-primary"/> معلومات الاستلام والتوصيل</h3>
                 {!isLoggedIn && (
                   <Link to="/login" className="flex items-center gap-2 text-pink-600 font-extrabold text-[10px] bg-pink-50 px-5 py-2.5 rounded-full hover:bg-primary hover:text-white transition-all">
                     <LogIn size={14} /> سجلي دخولك للحفظ
                   </Link>
                 )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">الاسم الكامل</label>
                  <input type="text" placeholder="مثال: سارة محمد" className={`w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold outline-none border-2 transition-all ${errors.name ? 'border-red-200 bg-red-50' : 'border-transparent focus:border-primary/20'}`} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">رقم الواتساب للتواصل</label>
                  <input type="tel" placeholder="77XXXXXXX" className={`w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold outline-none border-2 transition-all ${errors.phone ? 'border-red-200 bg-red-50' : 'border-transparent focus:border-primary/20'}`} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">المحافظة</label>
                  <div className="relative">
                    <select className={`w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold outline-none border-2 appearance-none transition-all ${errors.region ? 'border-red-200 bg-red-50' : 'border-transparent focus:border-primary/20'}`} value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
                      <option value="">اختر المحافظة...</option>
                      {YEMEN_GOVERNORATES.map(gov => <option key={gov} value={gov}>{gov}</option>)}
                    </select>
                    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-gray-400 mr-2 uppercase">العنوان التفصيلي</label>
                  <input type="text" placeholder="الحي، اسم الشارع، معلم بارز" className={`w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold outline-none border-2 transition-all ${errors.location ? 'border-red-200 bg-red-50' : 'border-transparent focus:border-primary/20'}`} value={customerLocation} onChange={(e) => setCustomerLocation(e.target.value)} />
                </div>
              </div>
              
                <div className="bg-pink-50 p-6 rounded-[1.5rem] flex gap-4 border border-pink-100">
                  <Info size={24} className="text-primary shrink-0" />
                  <p className="text-[11px] text-pink-900 font-bold leading-relaxed">
                   * رسوم التوصيل داخل صنعاء 800 ريال تدفع عند الاستلام.
                   <br />
                   * بقية المحافظات: يتم شحن الطلب وتحديد السعر حسب شركة الشحن المفضلة لديك.
                 </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Order Summary */}
        <div className="lg:col-span-1">
            <div className="nice-card bg-white rounded-[2.5rem] p-8 shadow-2xl sticky top-32 space-y-8 border border-gray-100">
            <h3 className="text-2xl font-extrabold mb-6">ملخص الحساب</h3>
            <div className="space-y-5">
              <div className="flex justify-between text-gray-400 font-bold text-xs"><span>مجموع المنتجات:</span><span className="text-black">{formatPrice(totalSAR)}</span></div>
              <div className="flex justify-between text-gray-400 font-bold text-xs"><span>تكلفة التوصيل:</span><span className="text-primary font-extrabold">{shippingLabel}</span></div>
              <div className="pt-6 border-t flex justify-between items-center">
                 <span className="text-lg font-extrabold">الإجمالي:</span>
                 <span className="text-2xl font-extrabold text-primary">{formatPrice(grandTotalSAR)}</span>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              {step === 1 ? (
                <button 
                  onClick={() => setStep(2)} 
                  className="w-full btn-primary py-4 rounded-[1.5rem] font-extrabold text-base flex items-center justify-center gap-3 shadow-xl hover:opacity-95 transition-all"
                >
                  الاستمرار للدفع <ArrowRight size={18} />
                </button>
              ) : (
                <button 
                  onClick={handleOrderCompletion} 
                  className="w-full bg-[#25D366] text-white py-4 rounded-[1.5rem] font-extrabold text-base flex items-center justify-center gap-3 shadow-xl shadow-green-100 hover:scale-[1.02] transition-all"
                >
                  <MessageCircle size={24} /> إتمام الطلب عبر واتساب
                </button>
              )}
              
              <Link to="/shop" className="w-full btn-secondary py-4 rounded-[1.5rem] font-extrabold text-[10px] flex items-center justify-center gap-2 transition-all">
                <Plus size={14} /> إضافة المزيد من المنتجات
              </Link>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
               <Truck size={20} className="text-gray-400" />
               <p className="text-[10px] text-gray-400 font-bold leading-tight">شحن سريع وآمن لكافة محافظات الجمهورية اليمنية.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

