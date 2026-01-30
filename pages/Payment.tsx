
import React from 'react';
import { CreditCard, Wallet, Banknote, Upload, Info, CheckCircle } from 'lucide-react';
import { useState } from 'react';

const Payment: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <div className="nice-card bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-black p-8 text-white text-center">
          <h2 className="text-3xl font-extrabold mb-2 text-pink-500">طرق الدفع المتاحة</h2>
          <p className="text-gray-400">نحن نسهل عليك عملية الشراء من خلال توفير طرق دفع محلية موثوقة</p>
        </div>

        <div className="p-8 space-y-8">
          
          {/* Method 1: Al-Kuraimi */}
          <section className="nice-card bg-gray-50 p-6 rounded-2xl border border-gray-100 relative group hover:border-pink-200 transition">
            <div className="absolute top-6 left-6 opacity-10 grayscale group-hover:grayscale-0 transition">
              <img src="https://img.icons8.com/color/96/bank.png" alt="Bank" className="w-16" />
            </div>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <CreditCard size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">بنك الكريمي</h3>
                <p className="text-sm text-gray-500">الإيداع عبر الفروع أو تطبيق كريمي جوال</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm space-y-2 border border-blue-50">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">باسم: مطور البرنامج</p>
                 <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
                   <span className="text-sm font-extrabold">YER 3007692314</span>
                   <button onClick={() => navigator.clipboard.writeText('3007692314')} className="text-[10px] text-blue-600 font-extrabold hover:underline">نسخ</button>
                 </div>
                <div className="flex justify-between items-center bg-green-50 p-2 rounded">
                   <span className="text-sm font-bold">SAR 3018233699</span>
                   <button onClick={() => navigator.clipboard.writeText('3018233699')} className="text-[10px] text-green-600 font-bold hover:underline">نسخ</button>
                </div>
                <div className="pt-3">
                  <label className="text-xs text-gray-500">رقم الطلب</label>
                    <div className="flex gap-2 mt-2">
                    <input value={orderId} onChange={e => setOrderId(e.target.value)} className="w-full p-3 border rounded-lg outline-none" placeholder="أدخل رقم الطلب" />
                    <button onClick={createKuraimi} disabled={loading} className="btn-primary px-4 rounded-lg font-extrabold">{loading ? 'جاري...' : 'اطلب تعليمات'}</button>
                  </div>
                </div>
                {instructions && (
                  <div className="mt-3 p-3 bg-blue-50 rounded">
                    <p className="text-sm font-bold">تعليمات التحويل:</p>
                    <pre className="text-xs whitespace-pre-wrap mt-2">{JSON.stringify(instructions, null, 2)}</pre>
                  </div>
                )}
                {message && <div className="text-sm text-green-600 mt-2">{message}</div>}
              </div>
            </div>
          </section>

          {/* Method 2: E-Wallets */}
          <section className="nice-card bg-gray-50 p-6 rounded-2xl border border-gray-100 relative group hover:border-pink-200 transition">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                <Wallet size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">المحافظ الإلكترونية</h3>
                <p className="text-sm text-gray-500">جوال باي، ون كاش، أو أي محفظة أخرى</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-purple-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-gray-700">الاسم: مطور البرنامج</p>
                  <p className="text-2xl font-extrabold text-purple-600 mt-1 tracking-wider">419137</p>
                </div>
                <div className="flex gap-2">
                   <img src="https://img.icons8.com/color/48/apple-pay.png" className="h-8 grayscale opacity-50" />
                   <img src="https://img.icons8.com/color/48/google-pay.png" className="h-8 grayscale opacity-50" />
                </div>
              </div>
            </div>
          </section>

          {/* Method 3: Local Networks */}
          <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100 group hover:border-pink-200 transition">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                <Banknote size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">الحوالات عبر الشبكات المحلية</h3>
                <p className="text-sm text-gray-500">النجم، الامتياز، يمن اكسبرس، إلخ</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-50 space-y-2">
              <p className="text-sm text-gray-500">يرجى إرسال الحوالة بالاسم الكامل:</p>
              <p className="text-lg font-extrabold text-gray-900 bg-orange-50 p-3 rounded-lg border border-orange-100">مطور البرنامج</p>
              <p className="text-xs text-gray-400 font-bold">رقم الهاتف: 772728311</p>
            </div>
          </section>

          {/* Verification Section */}
          <div className="nice-card bg-yellow-50 border-2 border-dashed border-yellow-200 p-8 rounded-[2rem] text-center space-y-6">
            <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center text-yellow-500 shadow-sm">
              <Upload size={30} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">تأكيد عملية التحويل</h3>
              <p className="text-sm text-yellow-800 max-w-md mx-auto leading-relaxed">
                بعد إتمام عملية التحويل، يرجى تصوير "سند التحويل" وإرساله فوراً عبر الواتساب لتأكيد طلبك وبدء التنفيذ.
              </p>
            </div>
            <div className="flex justify-center gap-4 pt-4">
               <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
                  <CheckCircle size={16} className="text-green-500" /> يتم التأكيد خلال ساعة
               </div>
               <div className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-white px-4 py-2 rounded-full shadow-sm">
                  <CheckCircle size={16} className="text-green-500" /> ضمان كامل للمبالغ
               </div>
            </div>
            <div className="mt-4 flex flex-col items-center gap-3">
              <a href="https://wa.me/967772728311" target="_blank" rel="noreferrer" className="inline-block btn-primary text-white px-6 py-3 rounded-2xl font-extrabold text-base hover:opacity-95 transition shadow-lg">إرسال عبر واتساب</a>
              <div className="w-full max-w-md bg-white p-4 rounded-lg">
                <label className="text-sm font-bold">أو ارفع سند التحويل هنا</label>
                <input type="file" accept="image/*,application/pdf" onChange={onFile} className="mt-2" />
                <div className="flex gap-2 mt-3">
                  <button onClick={uploadProof} disabled={loading} className="btn-primary px-4 py-2 rounded text-sm font-extrabold">{loading ? 'جاري...' : 'رفع الإثبات'}</button>
                  <button onClick={() => { setProofFile(null); setMessage(null); setInstructions(null); }} className="bg-gray-100 px-4 py-2 rounded text-sm">مسح</button>
                </div>
                {message && <div className="text-sm text-green-600 mt-2">{message}</div>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-blue-50 p-6 rounded-2xl text-blue-800 border-l-4 border-blue-500">
            <Info className="shrink-0" />
            <p className="text-xs leading-relaxed">
              <strong>تنبيه هام:</strong> لن يتم البدء في تنفيذ أي طلب (محلي أو خارجي) إلا بعد وصول المبلغ وتأكيد عملية التحويل من قبل الإدارة. يرجى الاحتفاظ بنسخة من السند دائماً.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;

