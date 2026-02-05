
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { Product, StoreSettings, Order, User, ContactMessage } from '../types';

const COLLECTIONS = {
  PRODUCTS: 'products',
  SETTINGS: 'settings',
  ORDERS: 'orders',
  USERS: 'users',
  MESSAGES: 'messages'
};

// بيانات افتراضية
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 101,
    name: "فستان سهرة كلاسيك - أسود",
    category: "فساتين",
    price: 12500,
    image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80&w=800",
    description: "فستان سهرة أنيق بتصميم كلاسيكي يناسب جميع المناسبات الخاصة."
  },
  {
    id: 102,
    name: "حقيبة يد جلدية فاخرة",
    category: "حقائب",
    price: 8500,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
    description: "حقيبة مصنوعة من الجلد الطبيعي 100% مع لمسات ذهبية."
  },
  {
    id: 103,
    name: "حذاء كعب عالي - ذهبي",
    category: "أحذية",
    price: 6400,
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800",
    description: "حذاء مريح وأنيق للسهرات."
  }
];

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    if (snap.empty) return MOCK_PRODUCTS;
    return snap.docs.map(d => ({ ...d.data(), id: d.data().id || parseInt(d.id) } as Product));
  } catch (error: any) { 
    console.warn("Firestore access error, using mock data:", error.message);
    return MOCK_PRODUCTS;
  }
};

export const addProductToDb = async (p: Product) => {
  try {
    await setDoc(doc(db, COLLECTIONS.PRODUCTS, p.id.toString()), p);
  } catch (e) {
    console.error("Error adding product:", e);
    throw e;
  }
};

export const removeProductFromDb = async (id: number) => {
  await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id.toString()));
};

export const fetchSettings = async (): Promise<StoreSettings | null> => {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'main'));
    return docSnap.exists() ? docSnap.data() as StoreSettings : null;
  } catch (e) {
    return null;
  }
};

export const saveSettingsToDb = async (s: StoreSettings) => {
  await setDoc(doc(db, COLLECTIONS.SETTINGS, 'main'), s);
};

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const q = query(collection(db, COLLECTIONS.ORDERS), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as Order));
  } catch (e) {
    return [];
  }
};

export const addOrderToDb = async (o: Order) => {
  await setDoc(doc(db, COLLECTIONS.ORDERS, o.id), o);
};

export const updateOrderStatusInDb = async (id: string, status: Order['status']) => {
  await updateDoc(doc(db, COLLECTIONS.ORDERS, id), { status });
};

export const saveUserProfile = async (user: User) => {
  await setDoc(doc(db, COLLECTIONS.USERS, user.id), user, { merge: true });
};

export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  const docSnap = await getDoc(doc(db, COLLECTIONS.USERS, userId));
  return docSnap.exists() ? docSnap.data() as User : null;
};
