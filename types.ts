
export type Category = string;

export interface ProductSpec {
  name: string;
  value: string;
}

export interface ProductOption {
  id: string;
  color?: string;
  size?: string;
  price: number;
  stock: number;
}

export interface Story {
  id: string;
  image: string;
  type: 'image' | 'video';
  createdAt: any;
}

export interface StoryGroup {
  id: string;
  name: string;
  thumbnail: string;
  stories: Story[];
  createdAt: any;
}

export interface GlobalStore {
  id: string;
  name: string;
  url: string;
  image: string;
  description?: string;
  createdAt?: any;
}

export interface Product {
  id: number;
  name: string;
  category: Category;
  brand?: string;
  price: number; // السعر الأصلي
  discountPrice?: number; // السعر بعد الخصم
  image: string;
  images?: string[];
  description: string;
  specs?: ProductSpec[];
  options?: ProductOption[];
  isGlobalOrder?: boolean;
  globalStoreId?: string; // معرف المتجر العالمي المرتبط
  createdAt?: any;
  sizes?: string[];
  colors?: string[];
  material?: string; // المكونات أو الخامة
  dimensions?: string; // الحجم أو الأبعاد
  stock?: number;
}

export interface CartItem extends Product {
  quantity: number;
  cartItemId: string;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Currency {
  id: string;
  name: string;
  symbol: string;
  rate: number;
  active: boolean;
  isBase?: boolean;
}

export interface DeliveryCity {
  id: string;
  name: string;
  fee: number;
  time: string;
  active: boolean;
}

export interface PaymentMethod {
  id: string;
  type: string;
  provider: string;
  accountName: string;
  accountNumber: string;
  active: boolean;
}

export interface StoreSettings {
  name: string;
  description: string;
  primaryColor: string;
  logo: string;
  notificationBar: {
    enabled: boolean;
    text: string;
    link: string;
    bgColor: string;
    textColor: string;
  };
  features: {
    maintenance: boolean;
    whatsappOrder: boolean;
    sheinOrder: boolean;
    externalStores: boolean;
    trackingPage: boolean;
    reviews: boolean;
    coupons: boolean;
  };
  currencies: Currency[];
  deliveryCities: DeliveryCity[];
  paymentMethods: PaymentMethod[];
  contactInfo: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
  };
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  status: 'new' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  items: any[];
  total: number;
  createdAt: any;
}

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  parent?: string;
  image: string;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  photoURL?: string;
  role?: 'admin' | 'user';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  createdAt: any;
  read?: boolean;
}
