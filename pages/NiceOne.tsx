import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Star, Truck, ShieldCheck, ShoppingBag, ArrowRight } from 'lucide-react';

const demoProducts = [
  {
    id: 'n1-1',
    name: 'عطر فاخر بلمسة فانيلا',
    price: '259 ر.س',
    badge: 'الأكثر مبيعاً',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'n1-2',
    name: 'روج مطفي يدوم طويلاً',
    price: '89 ر.س',
    badge: 'حصري',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'n1-3',
    name: 'باليت ظلال ألوان دافئة',
    price: '149 ر.س',
    badge: 'جديد',
    image: 'https://images.unsplash.com/photo-1526045478516-99145907023c?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'n1-4',
    name: 'سيروم فيتامين C لإشراق البشرة',
    price: '120 ر.س',
    badge: 'ترند',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'n1-5',
    name: 'كريم مرطب بتركيبة خفيفة',
    price: '99 ر.س',
    badge: 'موصى به',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'n1-6',
    name: 'مسكارا رموش كثيفة',
    price: '75 ر.س',
    badge: 'عرض خاص',
    image: 'https://images.unsplash.com/photo-1526045478516-99145907023c?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'n1-7',
    name: 'هايلايتر إشراقة ذهبية',
    price: '110 ر.س',
    badge: 'محدود',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'n1-8',
    name: 'مجموعة فرش مكياج ناعمة',
    price: '180 ر.س',
    badge: 'الأكثر طلباً',
    image: 'https://images.unsplash.com/photo-1526045478516-99145907023c?q=80&w=800&auto=format&fit=crop',
  },
];

const categories = [
  'العطور',
  'العناية بالبشرة',
  'المكياج',
  'العناية بالشعر',
  'أدوات الجمال',
  'العناية بالجسم',
];

const NiceOne: React.FC = () => {
  return (
    <div className="bg-[#0b0b0f] min-h-screen text-white" dir="rtl">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-primary/5 to-transparent" />
        <div className="max-w-6xl mx-auto px-4 pt-12 pb-10 flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 space-y-5">
            <div className="inline-flex items-center gap-2 bg-white/10 text-[11px] font-extrabold px-4 py-2 rounded-full border border-white/10">
              <Sparkles size={14} className="text-primary" />
              محاكاة واجهة Nice One
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              تسوقي بستايل نايس وان <span className="text-primary">بلمسة عصرية</span>
            </h1>
            <p className="text-gray-300 text-sm md:text-base max-w-xl leading-relaxed">
              تجربة واجهة شبيهة بـ Nice One: ألوان داكنة، بطاقات أنيقة، شحن سريع، وضمان أصلي.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary text-[12px] px-6 py-3 rounded-full">
                ابدئي التسوق <ArrowRight size={14} />
              </Link>
              <Link to="/" className="text-white/80 hover:text-white text-[12px] font-extrabold underline-offset-4">
                الرئيسية
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3 text-[11px] text-gray-200">
              <div className="flex items-center gap-2"><Truck size={14} className="text-primary"/> شحن سريع</div>
              <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-primary"/> ضمان أصلي</div>
              <div className="flex items-center gap-2"><Star size={14} className="text-primary"/> تقييمات ممتازة</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/5 bg-gradient-to-br from-white/10 to-white/5">
              <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover" alt="Nice One Mock" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-2 font-extrabold"><ShoppingBag size={14}/> سلة أنيقة</div>
                <div className="bg-white text-black px-3 py-1 rounded-full font-extrabold">متجر تجريبي</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 pb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button key={cat} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[11px] font-extrabold hover:border-primary hover:text-primary transition-all">
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Product grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold">منتجات مختارة</h2>
          <Link to="/shop" className="text-[11px] font-extrabold text-primary hover:text-white">عرض الكل</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {demoProducts.map((p) => (
            <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/60 transition-all">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                <span className="absolute top-3 right-3 bg-primary text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow">
                  {p.badge}
                </span>
              </div>
              <div className="p-3 space-y-2">
                <div className="text-[11px] text-gray-300 font-extrabold uppercase tracking-[0.08em]">Nice One</div>
                <h3 className="text-sm font-extrabold leading-snug text-white line-clamp-2">{p.name}</h3>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-primary font-extrabold text-sm">{p.price}</span>
                  <button className="text-[11px] font-extrabold text-black bg-white px-3 py-1.5 rounded-full hover:bg-primary hover:text-white transition-all">
                    أضف للسلة
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default NiceOne;
