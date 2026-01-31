import React, { useState, useEffect } from 'react';
import { Product, StoreSettings } from '../types';
import { ProductCard } from './ProductCard';

interface ShopProps {
  products: Product[];
  storeSettings: StoreSettings;
  selectedCategory: string | null;
  searchQuery: string;
  onAddToCart: (product: Product, size?: string, color?: string) => void;
  onProductClick: (product: Product) => void;
  language: 'ar' | 'en';
}

const Shop: React.FC<ShopProps> = ({
  products,
  storeSettings,
  selectedCategory,
  searchQuery,
  onAddToCart,
  onProductClick,
  language
}) => {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const isRtl = language === 'ar';

  const t = {
    en: {
      shop: "Categories",
      addToCart: "Add to Bag"
    },
    ar: {
      shop: "الأقسام",
      addToCart: "إضافة للسلة"
    }
  }[language];

  // Filter products based on category and search
  let displayedProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory || (storeSettings.storeCategories.find(c => c.name === selectedCategory)?.nameAr === p.category))
    : products;

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    displayedProducts = products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }

  // Banner rotation effect
  useEffect(() => {
    if (!storeSettings.banners || storeSettings.banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % storeSettings.banners.length);
    }, 5000); // Change banner every 5 seconds

    return () => clearInterval(interval);
  }, [storeSettings.banners]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-8">
      {/* Banners Section */}
      {storeSettings.banners && storeSettings.banners.length > 0 && (
        <div className="mb-8">
          <div className="relative rounded-2xl overflow-hidden bg-gray-200 aspect-[3/1] shadow-lg">
            {storeSettings.banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentBannerIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {banner.image && (
                  <img
                    src={banner.image}
                    alt={banner.title || 'Banner'}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
                  <div className="px-8 md:px-12 text-white max-w-md">
                    {banner.title && (
                      <h3 className="text-2xl md:text-3xl font-bold mb-2">{banner.title}</h3>
                    )}
                    {banner.subtitle && (
                      <p className="text-white/90 mb-4">{banner.subtitle}</p>
                    )}
                    {banner.ctaLabel && banner.ctaLink && (
                      <a
                        href={banner.ctaLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-white text-black px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                      >
                        {banner.ctaLabel}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Banner indicators */}
            {storeSettings.banners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {storeSettings.banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBannerIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentBannerIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          {searchQuery ? `"${searchQuery}"` : (selectedCategory || t.shop)}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {displayedProducts.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={onAddToCart}
              onClick={onProductClick}
              formattedPrice={
                <span className="font-bold">
                  {p.discountPrice || p.price} {isRtl ? 'ر.ي' : 'YER'}
                </span>
              }
              addToCartLabel={t.addToCart}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
