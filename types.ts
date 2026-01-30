
export type Category = string;

export interface StoreCategory {
  id: string;
  name: string;
  nameAr?: string; // Arabic Name
  image: string;
  icon?: string;
  branches: string[];
  branchesAr?: string[]; // Arabic Branches
}

export interface GlobalStore {
  id: string;
  name: string;
  image: string;
  icon?: string;
  url: string;
}

export interface ExternalStore {
  id?: string;
  name: string;
  logo: string;
  url: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED'
}

export interface Banner {
  id: string;
  title?: string;
  subtitle?: string;
  image?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

export interface DeliveryFee {
  city: string;
  fee: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isAdmin?: boolean;
}

export type PaymentMethod = 'COD' | 'KURIMI' | 'WALLET' | 'TRANSFER';

export interface Product {
  id: number;
  name: string;
  category: Category;
  subCategory?: string;
  storeName?: string; 
  productLink?: string;
  cartLink?: string; 
  price: number;
  discountPrice?: number; 
  image: string;
  images?: string[];
  description: string;
  sizes?: string[];
  sizeIcons?: string[];
  colors?: string[];
  colorIcons?: string[];
  material?: string;
  stock?: number;
  isGlobalOrder?: boolean;
  globalStoreId?: string;
  orderNotes?: string;
  selectedSize?: string;
  selectedColor?: string;
}

export interface CartItem extends Product {
  quantity: number;
  cartItemId: string;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  userId?: string;
  date: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentMethod: PaymentMethod;
  customer?: {
    name: string;
    phone: string;
    address?: string;
    city?: string;
  };
  deliveryFee?: number;
  paymentReceipt?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface DeliveryRule {
  city: string;
  cityAr?: string; // Arabic City Name
  fee: number;
  depositRequired: boolean;
  depositPercentage?: number;
  active: boolean;
}

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  whatsapp?: string;
  email?: string;
}

export interface StoreSettings {
  name: string;
  currency: 'SAR' | 'YER'; 
  exchangeRate: number;
  logo: string;
  colors: {
    primary: string;
    accent: string;
  };
  socialMedia: SocialMedia;
  storeCategories: StoreCategory[];
  globalStores: GlobalStore[]; 
  deliveryRules: DeliveryRule[];
  paymentInstructions?: {
    kurimi?: { name: string; account: string };
    wallet?: { name: string; number: string; type: string };
  };
  paymentMethods?: Array<{
    label: string;
    name: string;
    number: string;
    type?: string;
    icon?: string;
  }>;
  sections: {
    hero: { enabled: boolean; title: string; subtitle: string; image: string };
    categories: { enabled: boolean; womenImage: string; menImage: string };
    featured: { enabled: boolean; title: string };
  };
  storeName?: string;
  primaryColor?: string;
  bgColor?: string;
  fontFamily?: string;
  phone?: string;
  email?: string;
  iconSize?: number;
  iconRadius?: number;
  banners?: Banner[];
  adminApiKey?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

export type ViewState = 'HOME' | 'SHOP' | 'PRODUCT_DETAILS' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD' | 'ORDERS' | 'USER_LOGIN' | 'GLOBAL_ORDER';
