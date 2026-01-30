import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch,
  Query,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../src/firebase';

// ============ PRODUCTS ============

export async function getProducts(pageSize: number = 20, lastVisible?: any) {
  try {
    let q: Query = collection(db, 'products');
    const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc'), limit(pageSize + 1)];

    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }

    const snapshot = await getDocs(query(collection(db, 'products'), ...constraints));
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    return {
      products: products.slice(0, pageSize),
      hasMore: products.length > pageSize,
      lastVisible: products[pageSize - 1],
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

export async function getProductsByCategory(category: string, pageSize: number = 20) {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'products'),
        where('category', '==', category),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      )
    );
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
}

export async function searchProducts(searchTerm: string) {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'products'),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff'),
        limit(50)
      )
    );
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

export async function getProduct(productId: string) {
  try {
    const docSnap = await getDoc(doc(db, 'products', productId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

export async function createProduct(productData: any) {
  try {
    const productRef = doc(collection(db, 'products'));
    await setDoc(productRef, {
      ...productData,
      createdAt: Timestamp.now(),
    });
    return productRef.id;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

export async function updateProduct(productId: string, updates: any) {
  try {
    await updateDoc(doc(db, 'products', productId), {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// ============ ORDERS ============

export async function createOrder(userId: string, orderData: any) {
  try {
    const orderRef = doc(collection(db, 'orders'));
    await setDoc(orderRef, {
      userId,
      ...orderData,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return orderRef.id;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function getUserOrders(userId: string) {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
    );
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
}

export async function getOrder(orderId: string) {
  try {
    const docSnap = await getDoc(doc(db, 'orders', orderId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    await updateDoc(doc(db, 'orders', orderId), {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// ============ PAYMENTS ============

export async function createPayment(paymentData: any) {
  try {
    const paymentRef = doc(collection(db, 'payments'));
    await setDoc(paymentRef, {
      ...paymentData,
      status: 'pending',
      createdAt: Timestamp.now(),
    });
    return paymentRef.id;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
}

export async function getOrderPayments(orderId: string) {
  try {
    const snapshot = await getDocs(
      query(collection(db, 'payments'), where('orderId', '==', orderId))
    );
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
}

export async function updatePaymentStatus(paymentId: string, status: string) {
  try {
    await updateDoc(doc(db, 'payments', paymentId), {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
}

// ============ NOTIFICATIONS ============

export async function createNotification(userId: string | null, notificationData: any) {
  try {
    const notifRef = doc(collection(db, 'notifications'));
    await setDoc(notifRef, {
      ...(userId && { userId }),
      ...notificationData,
      isRead: false,
      createdAt: Timestamp.now(),
    });
    return notifRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function getUserNotifications(userId: string) {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
    );
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: true,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// ============ USERS ============

export async function getUserProfile(userId: string) {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, updates: any) {
  try {
    await updateDoc(doc(db, 'users', userId), updates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function createUserProfile(userId: string, userData: any) {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      createdAt: Timestamp.now(),
      isAdmin: false,
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}
