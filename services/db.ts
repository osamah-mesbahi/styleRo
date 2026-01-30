import { Product, StoreSettings, Order, User } from '../types';
import { fetchJson, authFetch } from '../src/api';

const safeJsonParse = <T,>(value: any, fallback: T): T => {
  try {
    if (typeof value === 'string') return JSON.parse(value) as T;
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const normalizeProduct = (p: any): Product => {
  const images = Array.isArray(p.images) ? p.images : safeJsonParse<string[]>(p.images, []);
  const sizes = safeJsonParse<string[]>(p.sizes, []);
  const sizeIcons = safeJsonParse<string[]>(p.sizeIcons, []);
  const colors = safeJsonParse<string[]>(p.colors, []);
  const colorIcons = safeJsonParse<string[]>(p.colorIcons, []);
  return {
    id: Number(p.id || 0),
    name: p.name || '',
    description: p.description || '',
    price: Number(p.price || 0),
    image: p.image || images[0] || 'https://via.placeholder.com/300x400?text=No+Image',
    images,
    category: p.category || 'General',
    subCategory: p.subCategory || undefined,
    productLink: p.productLink || undefined,
    sizes: sizes.length ? sizes : undefined,
    sizeIcons: sizeIcons.length ? sizeIcons : undefined,
    colors: colors.length ? colors : undefined,
    colorIcons: colorIcons.length ? colorIcons : undefined,
    stock: typeof p.inStock !== 'undefined' ? Number(p.inStock) : Number(p.stock || 0),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : undefined
  } as Product;
};

const normalizeOrderStatus = (status: string): Order['status'] => {
  const map: Record<string, Order['status']> = {
    pending: 'Pending',
    pending_payment: 'Pending',
    cart: 'Pending',
    paid: 'Processing',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };
  return map[status] || 'Pending';
};

const normalizeOrder = (o: any): Order => {
  const items = Array.isArray(o.items) ? o.items.map((it: any) => {
    const product = normalizeProduct(it.product || {});
    return {
      ...product,
      quantity: Number(it.quantity || 1),
      cartItemId: `${it.productId || product.id}-${it.id || Math.random().toString(36).slice(2, 7)}`
    };
  }) : [];

  return {
    id: String(o.id),
    userId: o.userId ? String(o.userId) : undefined,
    date: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
    items,
    total: Number(o.total || 0),
    status: normalizeOrderStatus(o.status || 'pending'),
    paymentMethod: 'COD'
  };
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const res = await fetchJson('/products');
    const list = Array.isArray(res) ? res : [];
    return list.map(normalizeProduct);
  } catch (error) {
    console.warn('Failed to fetch products:', error);
    return [];
  }
};

export const addProductToDb = async (p: Product) => {
  const sku = (p as any).sku || `SKU-${p.id || Date.now()}`;
  const images = p.images && p.images.length ? p.images : (p.image ? [p.image] : []);
  const payload = {
    sku,
    name: p.name,
    description: p.description || '',
    price: Number(p.price || 0),
    images,
    inStock: Number(p.stock || 0),
    category: p.category || '',
    subCategory: p.subCategory || '',
    productLink: p.productLink || '',
    sizes: p.sizes || [],
    sizeIcons: p.sizeIcons || [],
    colors: p.colors || [],
    colorIcons: p.colorIcons || []
  };
  const res = await authFetch('/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to add product');
};

export const removeProductFromDb = async (id: number) => {
  const res = await authFetch(`/products/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to remove product');
};

export const fetchSettings = async (): Promise<StoreSettings | null> => {
  try {
    const res = await fetchJson('/settings');
    return res && typeof res === 'object' ? (res as StoreSettings) : null;
  } catch (error) {
    console.warn('Failed to fetch settings:', error);
    return null;
  }
};

export const saveSettingsToDb = async (s: StoreSettings) => {
  const res = await authFetch('/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(s)
  });
  if (!res.ok) throw new Error('Failed to save settings');
};

export const fetchOrders = async (userId?: string, isAdmin?: boolean): Promise<Order[]> => {
  try {
    if (isAdmin) {
      const res = await fetchJson('/admin/orders');
      return Array.isArray(res) ? res.map(normalizeOrder) : [];
    }
    if (!userId) return [];
    const res = await fetchJson(`/orders/${userId}`);
    return Array.isArray(res) ? res.map(normalizeOrder) : [];
  } catch (error) {
    console.warn('Failed to fetch orders:', error);
    return [];
  }
};

export const addOrderToDb = async (o: Order) => {
  const items = o.items.map(i => ({ productId: Number(i.id), quantity: Number(i.quantity || 1), price: Number(i.discountPrice || i.price || 0) }));
  const payload = {
    userId: o.userId ? Number(o.userId) : null,
    items,
    total: Number(o.total || 0),
    paymentMethod: o.paymentMethod,
    customer: o.customer,
    status: 'pending'
  };
  const res = await authFetch('/orders/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to place order');
};

export const updateOrderStatusInDb = async (id: string, status: Order['status']) => {
  const res = await authFetch(`/admin/orders/${id}/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update order status');
};

// --- USER PROFILE FUNCTIONS (backend) ---
export const saveUserProfile = async (user: User) => {
  const res = await authFetch(`/users/${user.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  if (!res.ok) throw new Error('Failed to save user profile');
};

export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const res = await fetchJson(`/users/${userId}`);
    return res && typeof res === 'object' ? (res as User) : null;
  } catch {
    return null;
  }
};