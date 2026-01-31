// Script to add isAdmin field using Firestore REST API
const projectId = 'stylero-74eb8';
const uid = process.argv[2];

if (!uid) {
  console.error('❌ يرجى توفير UID');
  console.log('الاستخدام: node add-admin-rest.js <uid>');
  process.exit(1);
}

async function addAdmin() {
  try {
    console.log('جاري إضافة isAdmin للمستخدم:', uid);
    
    // Update document using REST API
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}?updateMask.fieldPaths=isAdmin`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            isAdmin: { booleanValue: true }
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    const result = await response.json();
    console.log('✅ تم بنجاح إضافة isAdmin: true');
    console.log('يمكنك تسجيل الدخول الآن بـ:');
    console.log('البريد: admin@stylero.online');
    console.log('الكلمة: 366399Ro');
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

addAdmin();
