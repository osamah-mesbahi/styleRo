# Firebase + Netlify Migration - Next Steps

## ✅ What's Done:
1. Created `services/firestoreService.ts` - Firestore CRUD operations
2. Created `FIREBASE_MIGRATION.md` - Complete migration guide
3. Updated `.env.example` - Firestore configuration
4. Updated `src/api.ts` - Marked as deprecated

## 🔄 What Needs To Be Done:

### Phase 1: Update Components to Use Firestore

**Priority 1 (Critical):**
1. `components/ProductCard.tsx` - Query products from Firestore
2. `components/CartDrawer.tsx` - Manage cart with Firestore
3. `pages/Home.tsx` - Load products from Firestore
4. `pages/Shop.tsx` - Load and filter products from Firestore

**Priority 2 (High):**
5. `components/AdminDashboard.tsx` - Admin operations
6. `components/UserLogin.tsx` - User auth with Firebase
7. `pages/Admin.tsx` - Admin page with Firestore queries

**Priority 3 (Medium):**
8. `components/StripeCheckout.tsx` - Payment handling
9. `pages/Payment.tsx` - Payment page
10. `pages/Tracking.tsx` - Order tracking

### Phase 2: Firebase Setup Required
1. Go to https://console.firebase.google.com
2. Create/Select your project
3. Enable Firestore Database
4. Enable Authentication (Email/Password, Google)
5. Enable Storage
6. Create collections with initial data:
   - `products/`
   - `orders/`
   - `users/`
   - `payments/`
   - `notifications/`

### Phase 3: Security Rules Setup
Copy the rules from `FIREBASE_MIGRATION.md` to Firestore Rules tab

### Phase 4: Cloud Functions (Optional but Recommended)
For sensitive operations:
- Order confirmation
- Payment processing
- Email/SMS notifications
- Admin operations

### Phase 5: Deployment
1. Add Firebase env vars to Netlify
2. Deploy from GitHub
3. Test all functionality

## 🛠️ Technical Decisions:

**Backend Approach:**
- ✅ No Express.js server (Firebase handles it)
- ✅ Direct Firestore queries from frontend
- ✅ Cloud Functions for sensitive ops (optional)

**Database:**
- ✅ Firestore (real-time, scalable)
- ✅ No SQL (Document-based)

**Auth:**
- ✅ Firebase Authentication
- ✅ No JWT (Firebase handles tokens)

**Storage:**
- ✅ Firebase Storage for product images
- ✅ No server uploads

## ⚠️ Important Notes:

1. **Security**: Update Firestore rules ASAP (public read is open)
2. **Costs**: Monitor Firestore usage (free tier has limits)
3. **Offline**: Firestore offline support requires extra setup
4. **Real-time**: Add real-time listeners for orders/notifications
5. **Admin**: Use custom claims for admin role

## 📋 Files to Modify:

```
Core Components:
- components/ProductCard.tsx (use getProduct/searchProducts)
- components/CartDrawer.tsx (use createOrder)
- pages/Shop.tsx (use getProductsByCategory)
- pages/Home.tsx (use getProducts)

Admin Features:
- components/AdminDashboard.tsx (use admin queries)
- pages/Admin.tsx (use admin data)

User Features:
- components/UserLogin.tsx (use Firebase Auth)
- pages/Tracking.tsx (use getUserOrders)

Payments:
- components/StripeCheckout.tsx (use payment functions)
- pages/Payment.tsx (use payment functions)
```

## 🎯 Quick Start Example:

```typescript
// Instead of API call:
// const response = await fetch('/api/products');

// Use Firestore:
import { getProducts } from '../services/firestoreService';

function ProductList() {
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    getProducts().then(data => setProducts(data.products));
  }, []);
  
  return <div>{products.map(p => <ProductCard key={p.id} product={p} />)}</div>;
}
```

## 🚀 Next Action:
Ready to update the components? Let me know which file you'd like to start with!
