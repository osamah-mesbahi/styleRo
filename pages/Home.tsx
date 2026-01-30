
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, ArrowRight
} from 'lucide-react';
import { MAIN_CATEGORIES as DEFAULT_CATEGORIES } from '../constants';
import { StoreSettings, Product } from '../types';
import CategoriesSection from '../components/CategoriesSection';

interface HomeProps {
  settings: StoreSettings;
}

const Home: React.FC<HomeProps> = ({ settings }) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState(settings.banners || []);
  const [bannerIndex, setBannerIndex] = useState(0);
  const placeholderImg = 'https://via.placeholder.com/600x800?text=No+Image';
  const getImg = (p?: Product) => p?.images && p.images.length > 0 ? p.images[0] : placeholderImg;

  const safeParse = <T,>(key: string, fallback: T): T => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw) as T;
    } catch (e) {
      localStorage.removeItem(key);
      return fallback;
    }
  };

  useEffect(() => {
    const savedCats = safeParse<any[]>('stylero_categories', DEFAULT_CATEGORIES);
    setCategories(savedCats);
    
    const savedProducts = safeParse<Product[]>('stylero_products', []);
    if (savedProducts.length) setProducts(savedProducts.slice(0, 15));
    if (settings.banners) setBanners(settings.banners);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pb-24" dir="rtl">



      <CategoriesSection />



      {/* Call to Action */}
      <section className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
            جاهز للتسوق؟
          </h2>
          <p className="text-primary-foreground/90 mb-6 max-w-md mx-auto">
            استكشفي مجموعتنا الكاملة من المنتجات الجمالية والعناية الشخصية
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-3 bg-white text-primary px-8 py-3 rounded-full font-extrabold hover:bg-gray-50 transition-colors shadow-lg"
          >
            ابدأ التسوق <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;

