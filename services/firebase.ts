
import { initializeApp } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "stylero-74eb8.firebaseapp.com",
  projectId: "stylero-74eb8",
  storageBucket: "stylero-74eb8.firebasestorage.app",
  messagingSenderId: "721015415335",
  appId: "1:721015415335:web:18be9a3599afdb62dc6402",
  measurementId: "G-CCWNXEF5Y2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

/**
 * تحسين إعدادات Firestore لمعالجة أخطاء الـ 10 ثواني والوصول غير المصرح به:
 * 1. تفعيل experimentalForceLongPolling للالتفاف على مشاكل بروكسي المتصفح.
 * 2. تفعيل التخزين المحلي لضمان عمل التطبيق في حالة عدم توفر اتصال أو رفض الأذونات.
 */
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

export const auth = getAuth(app);
