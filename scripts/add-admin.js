import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firebase Auth UID for admin@stylero.online - يجب الحصول عليه من Firebase Console
const adminEmail = 'admin@stylero.online';
const adminUID = process.argv[2]; // Pass UID as argument

if (!adminUID) {
  console.error('❌ يرجى توفير Firebase UID للمستخدم');
  console.log('الاستخدام: node add-admin.js <uid>');
  console.log('\nللحصول على UID:');
  console.log('1. اذهب إلى Firebase Console');
  console.log('2. Authentication -> Users');
  console.log('3. اضغط على admin@stylero.online');
  console.log('4. انسخ UID من القسم الأول');
  process.exit(1);
}

async function addAdmin() {
  try {
    const userRef = doc(db, 'users', adminUID);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      console.log('✓ المستخدم موجود:', userDoc.data());
      
      // Update with isAdmin
      await updateDoc(userRef, { isAdmin: true });
      console.log('✅ تم إضافة isAdmin: true');
    } else {
      // Create new document
      await setDoc(userRef, {
        email: adminEmail,
        name: 'مدير ستايلرو',
        isAdmin: true,
        createdAt: new Date().toISOString()
      });
      console.log('✅ تم إنشاء مستند المدير');
    }

    console.log('\n✅ تم بنجاح! يمكنك تسجيل الدخول الآن.');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

addAdmin();
