import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { id: 1, name: 'عناية', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=200', slug: 'skincare' },
  { id: 2, name: 'عطور', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=200', slug: 'perfumes' },
  { id: 3, name: 'مكياج', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=200', slug: 'makeup' },
];

const CategoriesSection: React.FC = () => {
  return (
    // تم تصغير py-12 إلى py-4 لتصغير الارتفاع الكلي للقسم
    <section className="py-4 bg-white"> 
      <div className="max-w-7xl mx-auto px-4 text-right">
        <h2 className="text-lg font-bold text-gray-800 mb-4">أبرز الأقسام</h2>
        
        <div className="flex justify-start gap-6 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((category) => (
            <Link key={category.id} to={`/shop?category=${category.slug}`} className="flex-shrink-0 flex flex-col items-center">
              {/* تم تصغير حجم الدائرة من w-full إلى w-16 لتقليل الارتفاع */}
              <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="mt-2 text-xs font-medium text-gray-600">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;