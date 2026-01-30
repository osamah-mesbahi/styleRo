# Stylero Backend (Express + Prisma)

Run locally:

1. Install dependencies

```bash
cd backend
npm install
```

2. Configure `.env` (copy from `.env.example`)

3. Initialize Prisma and DB (Postgres must be running)

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Start dev server

```bash
npm run dev
```

Run with Docker Compose (starts Postgres + backend):

```bash
cd backend
docker compose up --build
```

Notes:
- Add `STRIPE_SECRET` to environment for payment intents.
- Supplier sync runs hourly via `src/sync.js` (node-cron) and can be triggered manually via `/suppliers/import`.

Al Kuraimi bank integration
--------------------------

This project supports two modes for Al Kuraimi payments:

- API mode: if you have API credentials from Al Kuraimi, set `KURAIMI_API_URL` and `KURAIMI_API_KEY` in your environment. The server will attempt to create a payment via the bank API and store a `Payment` record.
- Manual mode: if no API is configured, the server returns manual bank transfer instructions (account name/number from env) and creates a pending `Payment` record. The customer should transfer and then upload proof.

Endpoints:

- `POST /payments/kuraimi/create` — create a payment request for an order (returns provider data or manual instructions).
- `POST /webhooks/kuraimi` — webhook endpoint for the bank to notify payment status (verify `KURAIMI_WEBHOOK_SECRET`).

````markdown
# Stylero Backend (Express + Prisma)

Run locally:

1. Install dependencies

```bash
cd backend
npm install
```

2. Configure `.env` (copy from `.env.example`)

3. Initialize Prisma and DB (Postgres must be running)

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Start dev server

```bash
npm run dev
```

Run with Docker Compose (starts Postgres + backend):

```bash
cd backend
docker compose up --build
```

Notes:
- Add `STRIPE_SECRET` to environment for payment intents.
- Supplier sync runs hourly via `src/sync.js` (node-cron) and can be triggered manually via `/suppliers/import`.

Al Kuraimi bank integration
--------------------------

This project supports two modes for Al Kuraimi payments:

- API mode: if you have API credentials from Al Kuraimi, set `KURAIMI_API_URL` and `KURAIMI_API_KEY` in your environment. The server will attempt to create a payment via the bank API and store a `Payment` record.
- Manual mode: if no API is configured, the server returns manual bank transfer instructions (account name/number from env) and creates a pending `Payment` record. The customer should transfer and then upload proof.

Endpoints:

- `POST /payments/kuraimi/create` — create a payment request for an order (returns provider data or manual instructions).
- `POST /webhooks/kuraimi` — webhook endpoint for the bank to notify payment status (verify `KURAIMI_WEBHOOK_SECRET`).

Notes on service/wallet codes
----------------------------

You can pass `serviceCode` and `walletCode` when calling `/payments/kuraimi/create`. Example:

```json
{ "orderId": 1, "serviceCode": "1204213", "walletCode": "419137" }
```

If the Kuraimi API is not configured the server will return manual instructions including default service/wallet codes (defaults: serviceCode=1204213, walletCode=419137). These codes are included in the `instructions` object returned to the frontend and stored as part of the `Payment` record.

Manual transfer details and network-contact
----------------------------------------

Manual instructions also include an on-the-ground contact and alternate account numbers. Configure these in your `.env` or use the defaults shown in `.env.example`:

- `KURAIMI_CONTACT_NAME` — contact person (example: اسامه علي راشد علي المصباحي)
- `KURAIMI_CONTACT_PHONE` — contact phone (example: 772728311)
- `KURAIMI_ACCOUNT_KURAIMI` — primary Kuraimi account (example: 3007692314)
- `KURAIMI_ACCOUNT_SAHADI` — alternate account (example: 3024742562)

The `instructions` response from `/payments/kuraimi/create` will include `contactName`, `contactPhone` and `alternateAccounts` keys for frontend display.

Manual-run workflow:

1. Customer chooses bank transfer at checkout. Frontend calls `/payments/kuraimi/create`.
2. Server returns bank details and `paymentId` for the pending payment.
3. Customer transfers and uploads proof via `/orders/:id/upload-proof` (or sends provider reference).
4. Admin confirms payment via `/admin/orders/:id/confirm-payment` or bank sends a webhook to `/webhooks/kuraimi`.


Firebase setup
--------------

Short notes to get Firebase working for web/backend/Android in this repo:

- Backend (Admin SDK): place your service account JSON and set `FIREBASE_SERVICE_ACCOUNT_PATH` in this file or environment. The backend expects an admin credential to perform server-side actions.

- Web (frontend): set Vite env variables for the web configuration (example in your project root `.env` or CI):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
VITE_FIREBASE_VAPID_KEY=...   # required for Web FCM
```

- Android (Capacitor): download the `google-services.json` from Firebase Console for the Android app whose package name matches the Android `applicationId` declared in `android/app/build.gradle` (this repo currently uses `com.stylero.app`). Place the file at `android/app/google-services.json` before building.

- WARNING: the current `android/app/google-services.json` in the repo has `package_name=stylero.online` which does not match `com.stylero.app`. You must either (A) download the correct `google-services.json` for `com.stylero.app` or (B) change your `applicationId` intentionally — do not keep mismatched files or FCM will fail.

If you want, I can (A) remove the mismatched file from the repo, or (B) keep it and wait for the correct `google-services.json` from your Firebase Console. Tell me which you prefer.

````

