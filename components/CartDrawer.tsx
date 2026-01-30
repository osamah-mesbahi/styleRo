import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Banknote, Landmark, Smartphone, CreditCard, Trash2, MapPin, User, Phone, CheckCircle2, Copy, Loader2 } from 'lucide-react';
import { CartItem, PaymentMethod, DeliveryRule, User as UserType, Order, StoreSettings } from '../types';
import { Button } from './Button';
import { createOrder } from '../services/firestoreService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onRemove: (cartItemId: string) => void;
  formatPrice: (price: number) => string;
  language: 'en' | 'ar';
  deliveryRules: DeliveryRule[];
  user: UserType | null;
  onClearCart: () => void;
  onOrderSuccess: () => void;
  settings: StoreSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, onClose, items, onUpdateQuantity, onRemove, formatPrice, language, deliveryRules, user, onClearCart, onOrderSuccess, settings
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [shippingInfo, setShippingInfo] = useState({ name: '', phone: '', address: '' });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');

  useEffect(() => {
    if (user) setShippingInfo({ name: user.name || '', phone: user.phone || '', address: user.address || '' });
    if (deliveryRules.length > 0 && !selectedCity) setSelectedCity(deliveryRules[0].city);
  }, [user, deliveryRules]);

  useEffect(() => {
    if (!isOpen) {
        setTimeout(() => { if (step !== 'success') setStep('cart'); }, 300);
    }
  }, [isOpen]);

  const subtotal = items.reduce((acc, item) => {
    const price = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price;
    return acc + (price * item.quantity);
  }, 0);
  
  const deliveryFee = deliveryRules.find(r => r.city === selectedCity)?.fee || 0;
  const total = subtotal + deliveryFee;
  
  const t = {
    en: {
      title: "My Bag", empty: "Your shopping bag is empty.", start: "Start Shopping", checkout: "Checkout", subtotal: "Subtotal", total: "Total", note: "Shipping calculated at checkout.",
      payment: "Payment Method", shipping: "Shipping Details", name: "Full Name", phone: "Phone Number", city: "Select City", address: "Detailed Address",
      confirm: "Confirm Order", success: "Order Placed!", successMsg: "Thank you for shopping with us. Your order id is:", continue: "Continue Shopping",
      delivery: "Delivery Fee", methods: { COD: "Cash on Delivery", KURIMI: "Al-Kurimi", WALLET: "E-Wallet" },
      transferTitle: "Transfer Details", transferHint: "Please transfer the amount and send a screenshot to our WhatsApp.",
      accName: "Account Name", accNumber: "Account Number", copy: "Copy"
    },
    ar: {
      title: "حقيبة التسوق", empty: "حقيبة التسوق فارغة حالياً.", start: "تصفح المنتجات", checkout: "إتمام الشراء", subtotal: "المجموع الفرعي", total: "الإجمالي", note: "يتم احتساب التوصيل عند الدفع.",
      payment: "طريقة الدفع", shipping: "بيانات الشحن", name: "الاسم الكامل", phone: "رقم الهاتف", city: "اختر المدينة", address: "العنوان التفصيلي",
      confirm: "تأكيد الطلب", success: "تم إرسال الطلب بنجاح!", successMsg: "شكراً لتسوقك معنا. رقم طلبك هو:", continue: "العودة للمتجر",
      delivery: "رسوم التوصيل", methods: { COD: "الدفع عند الاستلام", KURIMI: "بنك الكريمي", WALLET: "محفظة إلكترونية" },
      transferTitle: "تفاصيل التحويل", transferHint: "يرجى تحويل المبلغ وإرسال صورة الحوالة عبر الواتساب لتأكيد طلبك.",
      accName: "اسم الحساب", accNumber: "رقم الحساب", copy: "نسخ"
    }
  };

  const txt = t[language];
  const isRtl = language === 'ar';

  const handlePlaceOrder = async () => {
    if (!shippingInfo.name || !shippingInfo.phone || !shippingInfo.address || !selectedCity) {
        alert(isRtl ? "يرجى إكمال جميع بيانات الشحن" : "Please complete shipping details");
        return;
    }
    setIsPlacingOrder(true);
    const orderId = `ORD-${Date.now()}`;
    
    try {
        await createOrder(user?.id || 'guest', {
            items: items.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price,
                name: item.name
            })),
            total: total,
            shippingAddress: {
                name: shippingInfo.name,
                phone: shippingInfo.phone,
                address: shippingInfo.address,
                city: selectedCity
            },
            paymentMethod: paymentMethod,
            deliveryFee: deliveryFee
        });
        setLastOrderId(orderId);
        setStep('success');
        onClearCart();
        onOrderSuccess();
    } catch (e) {
        console.error('Error creating order:', e);
        alert(isRtl ? "حدث خطأ أثناء إنشاء الطلب" : "Error placing order. Please try again.");
    } finally {
        setIsPlacingOrder(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const PAYMENT_OPTIONS = [
    { id: 'COD', icon: Banknote, label: txt.methods.COD },
    { id: 'KURIMI', icon: Landmark, label: txt.methods.KURIMI },
    { id: 'WALLET', icon: Smartphone, label: txt.methods.WALLET },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity duration-300" onClick={onClose} />}
      <div dir={isRtl ? 'rtl' : 'ltr'} className={`fixed inset-y-0 ${isRtl ? 'left-0' : 'right-0'} z-[70] w-full max-w-[420px] bg-white shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : (isRtl ? '-translate-x-full' : 'translate-x-full')}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <div className="bg-black text-white p-2 rounded-xl"><ShoppingBag size={20} /></div>
             <h2 className="font-bold text-xl tracking-tight">{step === 'cart' ? txt.title : (step === 'checkout' ? txt.shipping : txt.success)}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><X size={22} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#fafafa]">
          {step === 'cart' && (
             items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-2 animate-pulse"><ShoppingBag size={40} className="text-gray-300" /></div>
                  <div><p className="text-gray-900 text-lg font-bold">{txt.empty}</p><p className="text-gray-400 text-sm mt-1">Looks like you haven't added anything yet.</p></div>
                  <Button onClick={onClose} className="rounded-full px-8 shadow-xl">{txt.start}</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => {
                        const effectivePrice = item.discountPrice && item.discountPrice > 0 ? item.discountPrice : item.price;
                        return (
                            <div key={item.cartItemId} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                                <div className="w-20 h-24 bg-gray-50 shrink-0 overflow-hidden rounded-xl border border-gray-100"><img src={item.image} className="w-full h-full object-cover mix-blend-multiply" /></div>
                                <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1">{item.name}</h3>
                                        <button onClick={() => onRemove(item.cartItemId)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                    <div className="flex justify-between items-end mt-3">
                                        <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                                            <button onClick={() => onUpdateQuantity(item.cartItemId, -1)} disabled={item.quantity <= 1} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-all"><Minus size={12} /></button>
                                            <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                                            <button onClick={() => onUpdateQuantity(item.cartItemId, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded-md transition-all"><Plus size={12} /></button>
                                        </div>
                                        <p className="font-black text-brand-black text-sm">{formatPrice(effectivePrice * item.quantity)}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )
          )}

          {step === 'checkout' && (
             <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><User size={12}/> {txt.name}</label>
                        <input value={shippingInfo.name} onChange={e => setShippingInfo({...shippingInfo, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-1 focus:ring-brand-accent transition-all" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><Phone size={12}/> {txt.phone}</label>
                        <input value={shippingInfo.phone} onChange={e => setShippingInfo({...shippingInfo, phone: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-1 focus:ring-brand-accent transition-all" placeholder="777..." />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><MapPin size={12}/> {txt.city}</label>
                        <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-1 focus:ring-brand-accent transition-all">
                            {deliveryRules.map(r => <option key={r.city} value={r.city}>{isRtl ? (r.cityAr || r.city) : r.city}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1"><MapPin size={12}/> {txt.address}</label>
                        <textarea value={shippingInfo.address} onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm h-20 resize-none focus:ring-1 focus:ring-brand-accent transition-all" />
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2"><CreditCard size={16} className="text-brand-accent"/> {txt.payment}</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {PAYMENT_OPTIONS.map((opt) => (
                            <button key={opt.id} onClick={() => setPaymentMethod(opt.id as PaymentMethod)} className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-[10px] font-bold ${paymentMethod === opt.id ? 'border-brand-black bg-brand-black text-white shadow-md' : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                                <opt.icon size={16} /><span className="whitespace-nowrap">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
          )}

          {step === 'success' && (
            <div className="h-full flex flex-col items-center py-6 text-center space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center animate-bounce shadow-inner"><CheckCircle2 size={36} /></div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-gray-900">{txt.success}</h3>
                    <p className="text-sm text-gray-500">{txt.successMsg}</p>
                    <div className="bg-gray-100 p-2 rounded-lg font-mono text-xs font-bold text-brand-accent inline-block">{lastOrderId}</div>
                </div>

                {/* Transfer Details Section */}
                {(paymentMethod === 'KURIMI' || paymentMethod === 'WALLET') && (
                  <div className="w-full bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4 animate-in slide-in-from-bottom-4 delay-150">
                     <h4 className="font-bold text-gray-900 flex items-center justify-center gap-2 border-b border-gray-50 pb-3">
                        <Smartphone size={18} className="text-brand-accent" />
                        {txt.transferTitle}
                     </h4>
                     <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">{txt.transferHint}</p>
                     
                     <div className="space-y-3 pt-2">
                        {paymentMethod === 'KURIMI' && settings.paymentInstructions?.kurimi && (
                          <div className="space-y-2">
                              <button type="button" onClick={() => copyToClipboard(settings.paymentInstructions!.kurimi!.name)} className="w-full text-right flex flex-col items-start bg-gray-50 p-3 rounded-2xl relative group hover:bg-gray-100">
                                <span className="text-[9px] uppercase font-bold text-gray-400 mb-1">{txt.accName}</span>
                                <span className="text-sm font-bold text-gray-900">{settings.paymentInstructions.kurimi.name}</span>
                              </button>
                              <button type="button" onClick={() => copyToClipboard(settings.paymentInstructions!.kurimi!.account)} className="w-full text-right flex flex-col items-start bg-gray-50 p-3 rounded-2xl relative group hover:bg-gray-100">
                                <span className="text-[9px] uppercase font-bold text-gray-400 mb-1">{txt.accNumber}</span>
                                <div className="w-full flex justify-between items-center">
                                  <span className="text-sm font-mono font-black text-brand-accent">+{settings.paymentInstructions.kurimi.account}</span>
                                  <span className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-gray-100 transition-colors">
                                    <Copy size={14} className="text-gray-400" />
                                  </span>
                                </div>
                              </button>
                          </div>
                        )}

                        {paymentMethod === 'WALLET' && settings.paymentInstructions?.wallet && (
                          <div className="space-y-2">
                            <button type="button" onClick={() => copyToClipboard(settings.paymentInstructions!.wallet!.name)} className="w-full text-right flex flex-col items-start bg-gray-50 p-3 rounded-2xl relative group hover:bg-gray-100">
                              <span className="text-[9px] uppercase font-bold text-gray-400 mb-1">{txt.accName}</span>
                              <span className="text-sm font-bold text-gray-900">{settings.paymentInstructions.wallet.name}</span>
                            </button>
                            <button type="button" onClick={() => copyToClipboard(settings.paymentInstructions!.wallet!.number)} className="w-full text-right flex flex-col items-start bg-gray-50 p-3 rounded-2xl relative group hover:bg-gray-100">
                              <span className="text-[9px] uppercase font-bold text-gray-400 mb-1">{settings.paymentInstructions.wallet.type}</span>
                              <div className="w-full flex justify-between items-center">
                                <span className="text-sm font-mono font-black text-brand-accent">+{settings.paymentInstructions.wallet.number}</span>
                                <span className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-gray-100 transition-colors">
                                  <Copy size={14} className="text-gray-400" />
                                </span>
                              </div>
                            </button>
                          </div>
                        )}
                     </div>

                     <a 
                      href={`https://wa.me/967772728311?text=${encodeURIComponent(isRtl ? `مرحباً ستايلرو، أود إرسال صورة حوالة الطلب: ${lastOrderId}` : `Hi Stylero, I want to send a screenshot for order: ${lastOrderId}`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-full py-3 bg-[#25D366] text-white rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-transform"
                     >
                        <Smartphone size={16}/> {isRtl ? "إرسال صورة الحوالة" : "Send Screenshot"}
                     </a>
                  </div>
                )}

                <Button fullWidth onClick={() => { setStep('cart'); onClose(); }} className="rounded-2xl h-14">{txt.continue}</Button>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && step !== 'success' && (
          <div className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] z-20">
            <div className="space-y-2">
              {step === 'checkout' && (
                <div className="flex justify-between items-center text-gray-500 text-sm">
                  <span>{txt.delivery}</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-brand-black font-black text-lg pt-1 border-t border-gray-50">
                <span>{txt.total}</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {step === 'cart' && (
              <button onClick={() => setStep('checkout')} className="w-full bg-brand-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-xl group">
                <span>{txt.checkout}</span>
                <ArrowRight size={18} className={`${isRtl ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
              </button>
            )}

            {step === 'checkout' && (
              <Button fullWidth onClick={handlePlaceOrder} disabled={isPlacingOrder} className="rounded-2xl h-14 flex items-center gap-2">
                {txt.confirm}
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
};