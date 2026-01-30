import React, { useMemo, useState } from 'react';
import { FaTshirt, FaPalette, FaWeightHanging, FaImage } from 'react-icons/fa';
import { GlobalStore, Product, StoreCategory } from '../types';

interface AddProductProps {
  categories: StoreCategory[];
  stores: GlobalStore[];
  onAddProduct: (product: Product) => void;
  language?: 'ar' | 'en';
}

const AddProduct: React.FC<AddProductProps> = ({ categories, stores, onAddProduct, language = 'ar' }) => {
  const [productData, setProductData] = useState({
    name: '',
    category: '',
    subCategory: '',
    storeId: '',
    price: '',
    productLink: '',
    size: '',
    color: '',
    volume: ''
  });
  const [images, setImages] = useState<string[]>([]);
  const isRtl = language === 'ar';
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL'];
  const colorOptions = [
    '#000000', // Black
    '#FFFFFF', // White
    '#FF5733', // Orange
    '#2ECC71', // Green
    '#3498DB', // Blue
    '#9B59B6', // Purple
    '#F1C40F', // Yellow
    '#E91E63', // Pink
    '#795548', // Brown
    '#607D8B'  // Gray
  ];

  const activeCategory = useMemo(
    () => categories.find((c) => c.name === productData.category),
    [categories, productData.category]
  );

  const availableBranches = useMemo(() => {
    if (!activeCategory) return [];
    if (isRtl && activeCategory.branchesAr?.length) return activeCategory.branchesAr;
    return activeCategory.branches || [];
  }, [activeCategory, isRtl]);

  const updateSelection = (field: string, value: string) => {
    setProductData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImagesUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const readers = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || ''));
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((urls) => {
      setImages((prev) => [...prev, ...urls]);
    });
  };

  const handleSubmit = () => {
    if (!productData.name || !productData.category) return;
    const image = images[0] || '';
    const product: Product = {
      id: Date.now(),
      name: productData.name,
      price: Number(productData.price || 0),
      description: '',
      category: productData.category,
      subCategory: productData.subCategory || undefined,
      image,
      images,
      productLink: productData.productLink || undefined,
      storeName: stores.find((s) => s.id === productData.storeId)?.name || undefined,
      sizes: productData.size ? [productData.size] : undefined,
      colors: productData.color ? [productData.color] : undefined
    };
    onAddProduct(product);
    setProductData({
      name: '',
      category: '',
      subCategory: '',
      storeId: '',
      price: '',
      productLink: '',
      size: '',
      color: '',
      volume: ''
    });
    setImages([]);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-50 rounded-2xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6 text-center text-gray-800">تفاصيل المنتج الجديد</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          value={productData.name}
          onChange={(e) => updateSelection('name', e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm"
          placeholder="اسم المنتج"
        />
        <select
          value={productData.category}
          onChange={(e) => updateSelection('category', e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm"
        >
          <option value="">{isRtl ? 'اختر القسم' : 'Select Category'}</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {isRtl ? (cat.nameAr || cat.name) : cat.name}
            </option>
          ))}
        </select>
        <select
          value={productData.subCategory}
          onChange={(e) => updateSelection('subCategory', e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm"
        >
          <option value="">{isRtl ? 'اختر الفرع' : 'Select Branch'}</option>
          {availableBranches.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
        <select
          value={productData.storeId}
          onChange={(e) => updateSelection('storeId', e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm"
        >
          <option value="">{isRtl ? 'اختر المتجر' : 'Select Store'}</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
        <input
          value={productData.productLink}
          onChange={(e) => updateSelection('productLink', e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm"
          placeholder="رابط المنتج"
        />
        <input
          type="number"
          value={productData.price}
          onChange={(e) => updateSelection('price', e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm"
          placeholder="السعر"
        />
      </div>

      <Section title="المقاس" icon={<FaTshirt className="text-blue-500" />}>
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((s) => (
            <OptionButton
              key={s}
              label={s}
              active={productData.size === s}
              onClick={() => updateSelection('size', s)}
            />
          ))}
        </div>
      </Section>

      <Section title="اللون" icon={<FaPalette className="text-purple-500" />}>
        <div className="flex gap-3">
          {colorOptions.map((c) => (
            <ColorDot
              key={c}
              color={c}
              active={productData.color === c}
              onClick={() => updateSelection('color', c)}
            />
          ))}
        </div>
      </Section>

      <Section title="الحجم" icon={<FaWeightHanging className="text-green-500" />}>
        <div className="flex gap-2">
          {['50ml', '100ml', '250ml'].map((v) => (
            <OptionButton
              key={v}
              label={v}
              active={productData.volume === v}
              onClick={() => updateSelection('volume', v)}
            />
          ))}
        </div>
      </Section>

      <Section title="إضافة صورة" icon={<FaImage className="text-amber-500" />}>
        <div className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs text-gray-500 mb-2">
          {images.length > 0 ? `${images.length} ${isRtl ? 'صور مرفوعة' : 'images uploaded'}` : (isRtl ? 'لم يتم رفع صور بعد' : 'No images uploaded yet')}
        </div>
        <label className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-xs font-bold cursor-pointer hover:opacity-90 transition">
          إضافة صورة
          <input type="file" multiple accept="image/*" onChange={(e) => handleImagesUpload(e.target.files)} className="hidden" />
        </label>
        {images.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {images.map((img, idx) => (
              <img key={`${img}-${idx}`} src={img} className="w-full h-20 object-cover rounded-lg border" />
            ))}
          </div>
        )}
      </Section>

      <p className="text-sm text-gray-500">
        المختار حالياً: <span className="font-bold">{productData.size || '—'}</span> /
        <span className="font-bold">{productData.volume || '—'}</span>
        <span style={{ color: productData.color || '#ccc' }}> ●</span>
      </p>

      <button onClick={handleSubmit} className="w-full mt-8 bg-black text-white py-3 rounded-xl font-bold hover:opacity-80 transition">
        إضافة المنتج للمتجر
      </button>
    </div>
  );
};

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <span className="font-semibold text-gray-700">{title}</span>
    </div>
    {children}
  </div>
);

const OptionButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg border-2 transition-all ${
      active ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200 bg-white text-gray-600'
    }`}
  >
    {label}
  </button>
);

const ColorDot: React.FC<{ color: string; active: boolean; onClick: () => void }> = ({ color, active, onClick }) => (
  <button
    onClick={onClick}
    style={{ backgroundColor: color }}
    className={`w-8 h-8 rounded-full border-4 transition-transform ${
      active ? 'border-gray-300 scale-125 shadow-lg' : 'border-transparent'
    }`}
  />
);

export default AddProduct;