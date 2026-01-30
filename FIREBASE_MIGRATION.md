# Firebase + Netlify Migration Guide

## Phase 1: Firestore Collections Design

### Collections Mapping:
```
users/
├── {uid}
│   ├── email: string
│   ├── phone: string
│   ├── name: string
│   ├── isAdmin: boolean
│   ├── createdAt: timestamp
│   └── photoURL: string (optional)

products/
├── {productId}
│   ├── sku: string
│   ├── name: string
│   ├── description: string
│   ├── price: number
│   ├── category: string
│   ├── subCategory: string
│   ├── sizes: array
│   ├── colors: array
│   ├── images: array
│   ├── supplierId: string
│   ├── inStock: number
│   └── createdAt: timestamp

orders/
├── {orderId}
│   ├── userId: string (reference to users/{uid})
│   ├── items: array of {productId, quantity, price, name}
│   ├── total: number
│   ├── status: string (pending, completed, cancelled)
│   ├── shippingAddress: object
│   ├── createdAt: timestamp
│   └── updatedAt: timestamp

payments/
├── {paymentId}
│   ├── orderId: string (reference)
│   ├── userId: string
│   ├── method: string (card, bank, etc)
│   ├── amount: number
│   ├── status: string
│   ├── proofUrl: string
│   ├── providerReference: string
│   └── createdAt: timestamp

suppliers/
├── {supplierId}
│   ├── name: string
│   ├── apiUrl: string
│   ├── apiKey: string (encrypted)
│   └── createdAt: timestamp

notifications/
├── {notificationId}
│   ├── type: string
│   ├── title: string
│   ├── message: string
│   ├── userId: string (optional)
│   ├── isRead: boolean
│   └── createdAt: timestamp
```

## Phase 2: Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users: Only access own data or admin
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId || isAdmin();
      allow create: if request.auth.uid != null;
    }
    
    // Products: Public read, admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Orders: Owner or admin
    match /orders/{orderId} {
      allow read: if belongsToUser(resource.data.userId) || isAdmin();
      allow write: if belongsToUser(resource.data.userId) || isAdmin();
    }
    
    // Payments: Owner or admin
    match /payments/{paymentId} {
      allow read: if belongsToUser(resource.data.userId) || isAdmin();
      allow write: if isAdmin();
    }
    
    // Notifications: Owner or admin
    match /notifications/{notificationId} {
      allow read: if belongsToUser(resource.data.userId) || isAdmin();
      allow write: if isAdmin();
    }
    
    // Helper functions
    function isAdmin() {
      return request.auth.token.admin == true;
    }
    
    function belongsToUser(userId) {
      return request.auth.uid == userId;
    }
  }
}
```

## Phase 3: Cloud Functions

### 1. Order Completion Function
```
createOrder(userId, items, total, shippingAddress)
- Validate items
- Create order document
- Send confirmation email
- Send notification
```

### 2. Payment Processing Function
```
processPayment(orderId, method, amount)
- Verify payment
- Update order status
- Update inventory
- Send notification
```

### 3. Notification Function
```
sendNotification(userId, title, message)
- Save to Firestore
- Send email/SMS/FCM
```

## Phase 4: Frontend Changes

### 1. Update firebase.ts
- Add Firestore imports
- Add collection references
- Add helper functions for CRUD operations

### 2. Update Services
- `services/geminiService.ts` - Keep as is
- Remove `services/db.ts` (Firestore direct access)
- Create new `services/firestoreService.ts`

### 3. Update Components
- AdminDashboard: Query Firestore directly
- UserLogin: Use Firebase Auth
- ProductCard: Query from Firestore
- CartDrawer: Use Redux/Context with Firestore sync

## Phase 5: Netlify Deployment

### Environment Variables:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_GEMINI_API_KEY
```

### Build Configuration:
```
[build]
  command = "npm run build"
  publish = "dist"
```

## Important Notes

⚠️ **Considerations:**
1. No backend = increased Firestore costs
2. Must write proper security rules
3. Cloud Functions for sensitive operations (payments)
4. Need Firebase Project setup (free tier OK)
5. Admin operations require custom claims

✅ **Benefits:**
- Simpler architecture
- No server management
- Auto-scaling
- Real-time updates
- Firebase ecosystem integration
