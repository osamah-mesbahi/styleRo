import React, { useState, useEffect, useRef } from 'react';
import { Product, StoreSettings, Order } from '../types';
import { Button } from './Button';
import AddProduct from './AddProduct';
import { createProduct, updateProduct, getProducts, updateOrderStatus } from '../services/firestoreService';

import {
  Package, Settings, LogOut, Trash2, Save,
  Truck, Plus, Layout, Image as ImageIcon,
  LayoutDashboard, ShoppingBag,
  Facebook, Instagram, Twitter, MessageCircle, Mail,
  Store, Palette, Share2, Upload, Link as LinkIcon,
  ToggleLeft, ToggleRight, Banknote, Grid
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onRemoveProduct: (id: number) => void;
  settings: StoreSettings;
  onUpdateSettings: (settings: StoreSettings) => void;
  orders: Order[];
  onUpdateOrderStatus: (id: string, status: Order['status']) => void;
  onLogout: () => void;
  language: 'en' | 'ar';
}

const ImageInput = ({ label, value, onChange, placeholder, hideUrlInput = false }: { label: string, value: string, onChange: (v: string) => void, placeholder: string, hideUrlInput?: boolean }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => onChange(reader.result as string);
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><ImageIcon size={12} /> {label}</label>
      <div className="flex gap-4 items-start">
        <div className="relative flex-1 group">
          {!hideUrlInput ? (
            <>
              <input value={value.startsWith('data:') ? 'Image uploaded...' : value} onChange={e => onChange(e.target.value)} className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm outline-none transition-all pl-10 pr-12" placeholder={placeholder} />
              <LinkIcon className="absolute top-3.5 left-3 text-gray-400" size={16} />
            </>
          ) : (
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full bg-white border border-gray-200 p-3 rounded-xl text-sm outline-none transition-all text-gray-600 text-right">
              {value ? (value.startsWith('data:') ? 'Image uploaded...' : value) : placeholder}
            </button>
          )}
          <button type="button" onClick={() => fileInputRef.current?.click()} className={`absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-lg text-gray-500 border border-gray-100 bg-gray-50/50 ${hideUrlInput ? 'static mt-2' : ''}`}>
            <Upload size={18} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
        <div className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden shrink-0 flex items-center justify-center">
          {value ? <img src={value} alt="Preview" className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300" size={20} />}
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products, onAddProduct, onRemoveProduct, settings, onUpdateSettings, 
  orders, onUpdateOrderStatus, onLogout, language
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'categories' | 'settings'>('dashboard');
  const [localSettings, setLocalSettings] = useState<StoreSettings>(settings);
  
  useEffect(() => { setLocalSettings(settings); }, [settings]);
  
  const isRtl = language === 'ar';
  const t = {
    en: {
      dashboard: "Overview", products: "Inventory", orders: "Orders", categories: "Categories", settings: "Configuration",
      save: "Save Changes", transferSettings: "Transfer Instructions",
      kurimiName: "Kurimi Acc Name", kurimiAcc: "Kurimi Acc Number",
      walletName: "Wallet Acc Name", walletNum: "Wallet Number", walletType: "Wallet Type (e.g. OneCash)"
    },
    ar: {
      dashboard: "نظرة عامة", products: "المخزون", orders: "الطلبات", categories: "الأقسام", settings: "الإعدادات",
      save: "حفظ التعديلات", transferSettings: "إعدادات التحويلات",
      kurimiName: "اسم حساب الكريمي", kurimiAcc: "رقم حساب الكريمي",
      walletName: "اسم حساب المحفظة", walletNum: "رقم المحفظة", walletType: "نوع المحفظة (مثلاً ون كاش)"
    }
  }[language];

  const updateLocalSettings = (path: string, value: any) => {
    const newSettings = { ...localSettings };
    const keys = path.split('.');
    let current: any = newSettings;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setLocalSettings(newSettings);
  };

  const updateArrayItem = (path: string, index: number, value: any) => {
    const newSettings = { ...localSettings } as any;
    const keys = path.split('.');
    let current: any = newSettings;
    for (let i = 0; i < keys.length; i++) {
      current = current[keys[i]];
    }
    if (Array.isArray(current)) {
      current[index] = value;
      setLocalSettings({ ...newSettings });
    }
  };

  const addArrayItem = (path: string, value: any) => {
    const newSettings = { ...localSettings } as any;
    const keys = path.split('.');
    let current: any = newSettings;
    for (let i = 0; i < keys.length; i++) {
      current = current[keys[i]];
    }
    if (Array.isArray(current)) {
      current.push(value);
      setLocalSettings({ ...newSettings });
    }
  };

  const removeArrayItem = (path: string, index: number) => {
    const newSettings = { ...localSettings } as any;
    const keys = path.split('.');
    let current: any = newSettings;
    for (let i = 0; i < keys.length; i++) {
      current = current[keys[i]];
    }
    if (Array.isArray(current)) {
      current.splice(index, 1);
      setLocalSettings({ ...newSettings });
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row" dir={isRtl ? 'rtl' : 'ltr'}>
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 shadow-lg md:shadow-none">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-black rounded-xl flex items-center justify-center text-white"><Store size={20} /></div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900">{settings.name}</h2>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[{ id: 'dashboard', icon: LayoutDashboard, label: t.dashboard }, { id: 'products', icon: Package, label: t.products }, { id: 'orders', icon: ShoppingBag, label: t.orders }, { id: 'categories', icon: Grid, label: t.categories }, { id: 'settings', icon: Settings, label: t.settings }].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-brand-black text-white' : 'text-gray-500 hover:bg-gray-50'}`}><item.icon size={18} /><span>{item.label}</span></button>
          ))}
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 mt-10"><LogOut size={18} /><span>Logout</span></button>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black capitalize">{activeTab}</h1>
          {(activeTab === 'settings' || activeTab === 'categories') && (
            <Button onClick={() => onUpdateSettings(localSettings)} className="gap-2 shadow-none hover:shadow-none transition-none"><Save size={16}/> {t.save}</Button>
          )}
        </div>

        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-4xl pb-28">
             <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
               <h3 className="text-sm font-bold text-gray-700 mb-3">{isRtl ? 'تنقل سريع' : 'Quick Access'}</h3>
               <div className="flex flex-wrap gap-2">
                <a href="#settings-general" className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200">{isRtl ? 'الإعدادات العامة' : 'General'}</a>
                <a href="#settings-social" className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200">{isRtl ? 'التواصل' : 'Social'}</a>
                <a href="#settings-payments" className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200">{isRtl ? 'وسائل الدفع' : 'Payments'}</a>
                <a href="#settings-stores" className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200">{isRtl ? 'المتاجر' : 'Stores'}</a>
                <a href="#settings-home" className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200">{isRtl ? 'الصفحة الرئيسية' : 'Homepage'}</a>
                <a href="#settings-delivery" className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200">{isRtl ? 'التوصيل' : 'Delivery'}</a>
               </div>
             </div>

             <div id="settings-general" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <h3 className="text-lg font-bold border-b border-gray-50 pb-4">General Settings</h3>
                <ImageInput label={isRtl ? 'شعار المتجر' : 'Store Logo'} value={localSettings.logo || ''} onChange={v => updateLocalSettings('logo', v)} placeholder={isRtl ? 'ارفع الشعار' : 'Upload logo'} hideUrlInput />
                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500 uppercase">Store Name</label>
                   <input value={localSettings.name} onChange={e => updateLocalSettings('name', e.target.value)} className="w-full border p-3 rounded-xl outline-none focus:ring-1 focus:ring-black" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Palette size={12}/> Primary Color</label>
                    <input type="color" value={localSettings.colors?.primary || '#000000'} onChange={e => updateLocalSettings('colors.primary', e.target.value)} className="w-full h-12 rounded-xl border" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Palette size={12}/> Accent Color</label>
                    <input type="color" value={localSettings.colors?.accent || '#D44D7D'} onChange={e => updateLocalSettings('colors.accent', e.target.value)} className="w-full h-12 rounded-xl border" />
                  </div>
                </div>
             </div>

             <div id="settings-social" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <h3 className="text-lg font-bold border-b border-gray-50 pb-4 flex items-center gap-2"><Share2 size={18}/> Social Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Facebook size={12}/> Facebook</label>
                    <input value={localSettings.socialMedia?.facebook || ''} onChange={e => updateLocalSettings('socialMedia.facebook', e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder="https://facebook.com/..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Instagram size={12}/> Instagram</label>
                    <input value={localSettings.socialMedia?.instagram || ''} onChange={e => updateLocalSettings('socialMedia.instagram', e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder="https://instagram.com/..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Twitter size={12}/> Twitter</label>
                    <input value={localSettings.socialMedia?.twitter || ''} onChange={e => updateLocalSettings('socialMedia.twitter', e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder="https://twitter.com/..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><MessageCircle size={12}/> WhatsApp</label>
                    <input value={localSettings.socialMedia?.whatsapp || ''} onChange={e => updateLocalSettings('socialMedia.whatsapp', e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder="https://wa.me/..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1"><Mail size={12}/> Email</label>
                    <input value={localSettings.socialMedia?.email || ''} onChange={e => updateLocalSettings('socialMedia.email', e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder="support@domain.com" />
                  </div>
                </div>
             </div>

             <div id="settings-payments" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2"><Banknote size={18}/> {isRtl ? 'وسائل الدفع' : 'Payment Methods'}</h3>
                  <Button size="sm" onClick={() => addArrayItem('paymentMethods', { label: 'Method', name: '', number: '', type: '' })}><Plus size={14}/> Add</Button>
                </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                   <p className="text-xs font-bold text-gray-400 uppercase">Kurimi Bank</p>
                   <input value={localSettings.paymentInstructions?.kurimi?.name || ''} onChange={e => updateLocalSettings('paymentInstructions.kurimi.name', e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder={t.kurimiName} />
                   <input value={localSettings.paymentInstructions?.kurimi?.account || ''} onChange={e => updateLocalSettings('paymentInstructions.kurimi.account', e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-mono" placeholder={t.kurimiAcc} />
                 </div>
                 <div className="space-y-4">
                   <p className="text-xs font-bold text-gray-400 uppercase">E-Wallet</p>
                   <input value={localSettings.paymentInstructions?.wallet?.type || ''} onChange={e => updateLocalSettings('paymentInstructions.wallet.type', e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder={t.walletType} />
                   <input value={localSettings.paymentInstructions?.wallet?.name || ''} onChange={e => updateLocalSettings('paymentInstructions.wallet.name', e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder={t.walletName} />
                   <input value={localSettings.paymentInstructions?.wallet?.number || ''} onChange={e => updateLocalSettings('paymentInstructions.wallet.number', e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-mono" placeholder={t.walletNum} />
                 </div>
               </div>
                <div className="space-y-4">
                  {(localSettings.paymentMethods || []).map((m, idx) => (
                    <div key={`${m.label}-${idx}`} className="border border-gray-100 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase">Method #{idx + 1}</span>
                        <button type="button" onClick={() => removeArrayItem('paymentMethods', idx)} className="text-red-500"><Trash2 size={16} /></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={m.label} onChange={e => updateArrayItem('paymentMethods', idx, { ...m, label: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder={isRtl ? 'اسم الوسيلة' : 'Label'} />
                        <input value={m.name} onChange={e => updateArrayItem('paymentMethods', idx, { ...m, name: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder={isRtl ? 'اسم الحساب' : 'Account Name'} />
                        <input value={m.number} onChange={e => updateArrayItem('paymentMethods', idx, { ...m, number: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-mono" placeholder={isRtl ? 'رقم الحساب' : 'Account Number'} />
                        <input value={m.type || ''} onChange={e => updateArrayItem('paymentMethods', idx, { ...m, type: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder={isRtl ? 'نوع الوسيلة' : 'Type'} />
                        <ImageInput label={isRtl ? 'أيقونة الوسيلة' : 'Method Icon'} value={m.icon || ''} onChange={v => updateArrayItem('paymentMethods', idx, { ...m, icon: v })} placeholder={isRtl ? 'ادراج صورة الأيقونة' : 'Upload icon'} hideUrlInput />
                      </div>
                    </div>
                  ))}
                </div>
             </div>

             <div id="settings-stores" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2"><Store size={18}/> {isRtl ? 'المتاجر العالمية' : 'Global Stores'}</h3>
                  <Button size="sm" onClick={() => addArrayItem('globalStores', { id: Date.now().toString(), name: '', image: '', url: '' })}><Plus size={14}/> Add</Button>
                </div>
                <div className="space-y-4">
                  {(localSettings.globalStores || []).map((s, idx) => (
                    <div key={`${s.id}-${idx}`} className="border border-gray-100 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-400 uppercase">Store #{idx + 1}</span>
                        <button type="button" onClick={() => removeArrayItem('globalStores', idx)} className="text-red-500"><Trash2 size={16} /></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={s.name} onChange={e => updateArrayItem('globalStores', idx, { ...s, name: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder={isRtl ? 'اسم المتجر' : 'Store Name'} />
                        <input value={s.url} onChange={e => updateArrayItem('globalStores', idx, { ...s, url: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder={isRtl ? 'رابط المتجر' : 'Store URL'} />
                      </div>
                      <ImageInput label={isRtl ? 'ادراج صورة المتجر' : 'Upload Store Image'} value={s.image || ''} onChange={v => updateArrayItem('globalStores', idx, { ...s, image: v })} placeholder={isRtl ? 'ادراج صورة' : 'Upload image'} hideUrlInput />
                      <ImageInput label={isRtl ? 'أيقونة المتجر' : 'Store Icon'} value={s.icon || ''} onChange={v => updateArrayItem('globalStores', idx, { ...s, icon: v })} placeholder={isRtl ? 'ارفع أيقونة المتجر' : 'Upload store icon'} hideUrlInput />
                    </div>
                  ))}
                </div>
             </div>

              <div id="settings-home" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold border-b border-gray-50 pb-4 flex items-center gap-2"><Layout size={18}/> Homepage Sections</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">Hero Section</span>
                      <button type="button" onClick={() => updateLocalSettings('sections.hero.enabled', !localSettings.sections?.hero?.enabled)} className="text-gray-600">
                        {localSettings.sections?.hero?.enabled ? <ToggleRight /> : <ToggleLeft />}
                      </button>
                    </div>
                    <ImageInput label={isRtl ? 'صورة الهيرو' : 'Hero Image'} value={localSettings.sections?.hero?.image || ''} onChange={v => updateLocalSettings('sections.hero.image', v)} placeholder={isRtl ? 'ارفع صورة الهيرو' : 'Upload hero image'} hideUrlInput />
                    <input value={localSettings.sections?.hero?.title || ''} onChange={e => updateLocalSettings('sections.hero.title', e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder="Hero title" />
                    <input value={localSettings.sections?.hero?.subtitle || ''} onChange={e => updateLocalSettings('sections.hero.subtitle', e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder="Hero subtitle" />

                    <div className="flex items-center justify-between pt-4">
                      <span className="text-sm font-bold">Categories Section</span>
                      <button type="button" onClick={() => updateLocalSettings('sections.categories.enabled', !localSettings.sections?.categories?.enabled)} className="text-gray-600">
                        {localSettings.sections?.categories?.enabled ? <ToggleRight /> : <ToggleLeft />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <span className="text-sm font-bold">Featured Section</span>
                      <button type="button" onClick={() => updateLocalSettings('sections.featured.enabled', !localSettings.sections?.featured?.enabled)} className="text-gray-600">
                        {localSettings.sections?.featured?.enabled ? <ToggleRight /> : <ToggleLeft />}
                      </button>
                    </div>
                    <input value={localSettings.sections?.featured?.title || ''} onChange={e => updateLocalSettings('sections.featured.title', e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder="Featured title" />
                  </div>
               </div>


               <div id="settings-delivery" className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2"><Truck size={18}/> Delivery Rules</h3>
                    <Button size="sm" onClick={() => addArrayItem('deliveryRules', { city: 'City', cityAr: 'مدينة', fee: 0, depositRequired: false, depositPercentage: 0, active: true })}><Plus size={14}/> Add</Button>
                  </div>
                  <div className="space-y-4">
                    {localSettings.deliveryRules?.map((rule, idx) => (
                      <div key={`${rule.city}-${idx}`} className="border border-gray-100 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-400 uppercase">Rule #{idx + 1}</span>
                          <button type="button" onClick={() => removeArrayItem('deliveryRules', idx)} className="text-red-500"><Trash2 size={16} /></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input value={rule.city} onChange={e => updateArrayItem('deliveryRules', idx, { ...rule, city: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder="City" />
                          <input value={rule.cityAr || ''} onChange={e => updateArrayItem('deliveryRules', idx, { ...rule, cityAr: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder="Arabic City" />
                          <input type="number" value={rule.fee} onChange={e => updateArrayItem('deliveryRules', idx, { ...rule, fee: Number(e.target.value) })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder="Fee" />
                          <div className="flex items-center gap-3">
                            <label className="text-xs font-bold text-gray-500 uppercase">Deposit Required</label>
                            <input type="checkbox" checked={rule.depositRequired} onChange={e => updateArrayItem('deliveryRules', idx, { ...rule, depositRequired: e.target.checked })} />
                          </div>
                          <input type="number" value={rule.depositPercentage || 0} onChange={e => updateArrayItem('deliveryRules', idx, { ...rule, depositPercentage: Number(e.target.value) })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder="Deposit %" />
                          <div className="flex items-center gap-3">
                            <label className="text-xs font-bold text-gray-500 uppercase">Active</label>
                            <input type="checkbox" checked={rule.active} onChange={e => updateArrayItem('deliveryRules', idx, { ...rule, active: e.target.checked })} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-8 max-w-4xl pb-20">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                <h3 className="text-lg font-bold flex items-center gap-2"><Grid size={18}/> {isRtl ? 'الأقسام' : 'Categories'}</h3>
                <Button size="sm" onClick={() => addArrayItem('storeCategories', { id: Date.now().toString(), name: 'New', nameAr: 'جديد', image: '', branches: [], branchesAr: [] })}><Plus size={14}/> Add</Button>
              </div>
              <div className="space-y-4">
                {localSettings.storeCategories?.map((cat, idx) => (
                  <div key={cat.id || idx} className="border border-gray-100 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-400 uppercase">Category #{idx + 1}</span>
                      <button type="button" onClick={() => removeArrayItem('storeCategories', idx)} className="text-red-500"><Trash2 size={16} /></button>
                    </div>
                    <input value={cat.name} onChange={e => updateArrayItem('storeCategories', idx, { ...cat, name: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder="Name" />
                    <input value={cat.nameAr || ''} onChange={e => updateArrayItem('storeCategories', idx, { ...cat, nameAr: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm" placeholder="Arabic Name" />
                    <ImageInput label={isRtl ? 'ادراج صورة القسم' : 'Upload Category Image'} value={cat.image || ''} onChange={v => updateArrayItem('storeCategories', idx, { ...cat, image: v })} placeholder={isRtl ? 'ادراج صورة' : 'Upload image'} hideUrlInput />
                    <ImageInput label={isRtl ? 'أيقونة القسم' : 'Category Icon'} value={cat.icon || ''} onChange={v => updateArrayItem('storeCategories', idx, { ...cat, icon: v })} placeholder={isRtl ? 'ارفع أيقونة القسم' : 'Upload category icon'} hideUrlInput />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'settings' || activeTab === 'categories') && (
          <div className="fixed bottom-4 left-4 right-4 md:left-72 md:right-8 bg-white/95 backdrop-blur border border-gray-200 rounded-2xl shadow-lg px-5 py-3 flex items-center justify-between z-50">
            <span className="text-sm font-bold text-gray-700">{t.save}</span>
            <Button onClick={() => onUpdateSettings(localSettings)} className="gap-2 shadow-none hover:shadow-none transition-none"><Save size={16}/> {t.save}</Button>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><ShoppingBag /></div>
                <div><p className="text-xs text-gray-400 font-bold uppercase">Total Orders</p><p className="text-2xl font-black">{orders.length}</p></div>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><Package /></div>
                <div><p className="text-xs text-gray-400 font-bold uppercase">Products</p><p className="text-2xl font-black">{products.length}</p></div>
             </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-8 max-w-4xl pb-20">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between gap-4 border-b border-gray-50 pb-4">
                <h3 className="text-lg font-bold">{isRtl ? 'قائمة المنتجات' : 'Products List'}</h3>
                <span className="text-xs font-bold text-gray-400">{products.length} {isRtl ? 'منتج' : 'items'}</span>
              </div>
              {products.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">
                  {isRtl ? 'لا توجد منتجات بعد' : 'No products yet'}
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => {
                    const categoryMatch = localSettings.storeCategories?.find(c => c.name === product.category);
                    const categoryLabel = isRtl ? (categoryMatch?.nameAr || product.category) : product.category;
                    return (
                      <div key={product.id} className="flex flex-col md:flex-row md:items-center gap-4 border border-gray-100 rounded-2xl p-4 hover:shadow-sm transition">
                        <div className="w-full md:w-16 h-32 md:h-16 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-4">
                            <h4 className="font-bold text-gray-900">{product.name}</h4>
                            <span className="text-sm font-bold text-gray-900">{product.price} {localSettings.currency || 'YER'}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="font-semibold">{categoryLabel}</span>
                            {product.subCategory ? <span> • {product.subCategory}</span> : null}
                          </div>
                          {product.description ? (
                            <p className="text-xs text-gray-400 line-clamp-2">{product.description}</p>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button onClick={() => onRemoveProduct(product.id)} className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-100">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h3 className="text-lg font-bold border-b border-gray-50 pb-4">{isRtl ? 'إضافة منتج' : 'Add Product'}</h3>
              <AddProduct
                categories={localSettings.storeCategories || []}
                stores={localSettings.globalStores || []}
                onAddProduct={onAddProduct}
                language={language}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};