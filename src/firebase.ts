import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as fbSignOut, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';

// Read Firebase config from Vite env variables.
const env = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
  console.warn('Firebase config is missing. Set VITE_FIREBASE_* variables in .env');
}

const app = initializeApp(firebaseConfig);
try { if (typeof window !== 'undefined') getAnalytics(app); } catch { /* ignore */ }
const db = getFirestore(app);

import type { Messaging } from 'firebase/messaging';
import type { Auth } from 'firebase/auth';

const isNativePlatform = () => {
  try {
    return typeof Capacitor?.isNativePlatform === 'function' ? Capacitor.isNativePlatform() : (Capacitor.getPlatform?.() !== 'web');
  } catch {
    return false;
  }
};

let messaging: Messaging | null = null;
try {
  if (!isNativePlatform() && typeof window !== 'undefined') messaging = getMessaging(app);
} catch (e) { console.warn('firebase messaging init failed', e && e.message); }

// Initialize native push (Capacitor) handlers dynamically. Safe no-op on web.
export async function initNativePushHandlers(onRegistration?: (token: string) => void, onNotification?: (payload: any) => void) {
  try {
    const capPlatform = typeof Capacitor?.getPlatform === 'function' ? Capacitor.getPlatform() : 'web';
    if (capPlatform === 'web') return false;

    // dynamic import via eval to avoid bundlers resolving the module for web builds
    // @ts-ignore
    const { PushNotifications } = await eval('import("@capacitor/push-notifications")');

    const perm = await PushNotifications.requestPermissions();
    if (perm.receive === 'granted') {
      await PushNotifications.register();
    }

    PushNotifications.addListener('registration', (token: any) => {
      try { if (onRegistration) onRegistration(token?.value || token?.token || ''); } catch (e) { /* ignore */ }
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
      try { if (onNotification) onNotification(notification); } catch (e) { /* ignore */ }
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (action: any) => {
      try { if (onNotification) onNotification(action); } catch (e) { /* ignore */ }
    });

    return true;
  } catch (e) {
    console.warn('initNativePushHandlers failed', e && e.message);
    return false;
  }
}

// Auth
let auth: Auth | null = null;
try {
  if (typeof window !== 'undefined') auth = getAuth(app);
} catch (e) { console.warn('firebase auth init failed', e && (e as any).message); }

export async function firebaseRegisterWithPhone(phone: string, password: string) {
  if (!auth) throw new Error('Firebase auth not initialized');
  const email = `${phone}@stylero.local`;
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

export async function firebaseLoginWithPhone(phone: string, password: string) {
  if (!auth) throw new Error('Firebase auth not initialized');
  const email = `${phone}@stylero.local`;
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

export async function firebaseSignOut() {
  if (!auth) return;
  try { await fbSignOut(auth); } catch (e) { /* ignore */ }
}

// Phone SMS Auth helpers
export function initRecaptcha(containerId = 'recaptcha-container') {
  if (!auth) throw new Error('Firebase auth not initialized');
  try {
    // @ts-ignore
    if (!window.recaptchaVerifier) {
      // @ts-ignore
      window.recaptchaVerifier = new RecaptchaVerifier(containerId, { size: 'invisible' }, auth);
    }
    // @ts-ignore
    return window.recaptchaVerifier;
  } catch (e) {
    throw new Error('Failed to init reCAPTCHA: ' + (e && e.message));
  }
}

export async function sendSmsCode(phone: string, containerId = 'recaptcha-container') {
  if (!auth) throw new Error('Firebase auth not initialized');
  const verifier = initRecaptcha(containerId);
  // ensure phone in E.164 format by caller; if user passes local number like 772123456 we'll not modify here
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phone, verifier);
    // @ts-ignore
    window.confirmationResult = confirmationResult;
    return true;
  } catch (err: any) {
    throw new Error(err?.message || 'Failed to send SMS');
  }
}

export async function verifySmsCode(code: string) {
  try {
    // @ts-ignore
    if (!window.confirmationResult) throw new Error('No confirmation result available');
    // @ts-ignore
    const userCred = await window.confirmationResult.confirm(code);
    return userCred.user;
  } catch (err: any) {
    throw new Error(err?.message || 'Failed to verify code');
  }
}

export async function getFcmToken(vapidKey?: string) {
  if (!messaging) return null;
  try {
    const key = vapidKey || env.VITE_FIREBASE_VAPID_KEY;
    const currentToken = await getToken(messaging, { vapidKey: key });
    return currentToken || null;
  } catch (err) { console.error('getFcmToken err', err); return null; }
}

export function onMessageHandler(cb: (payload: any) => void) {
  if (!messaging) return () => {};
  try {
    const unsub = onMessage(messaging, (payload) => cb(payload));
    return typeof unsub === 'function' ? unsub : () => {};
  } catch (e) { return () => {}; }
}

export async function fetchProductsFromFirestore() {
  try {
    const snap = await getDocs(collection(db, 'products'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn('fetchProductsFromFirestore failed', (e as any)?.message || e);
    return [];
  }
}

export async function upsertProductToFirestore(product: any) {
  try {
    if (!product?.id) throw new Error('product.id is required');
    const ref = doc(db, 'products', String(product.id));
    await setDoc(ref, product, { merge: true });
    return true;
  } catch (e) {
    console.warn('upsertProductToFirestore failed', (e as any)?.message || e);
    return false;
  }
}

export async function deleteProductFromFirestore(id: string | number) {
  try {
    const ref = doc(db, 'products', String(id));
    await deleteDoc(ref);
    return true;
  } catch (e) {
    console.warn('deleteProductFromFirestore failed', (e as any)?.message || e);
    return false;
  }
}

export function subscribeProductsFromFirestore(onChange: (items: any[]) => void) {
  try {
    const q = query(collection(db, 'products'));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      onChange(items);
    });
    return typeof unsub === 'function' ? unsub : () => {};
  } catch (e) {
    console.warn('subscribeProductsFromFirestore failed', (e as any)?.message || e);
    return () => {};
  }
}

