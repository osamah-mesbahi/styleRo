const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean)
  : null;
app.use(cors({ origin: corsOrigins || true, credentials: true }));
app.use(express.json());

function getJwtSecret() {
  const secret = process.env.JWT_SECRET || (isProd ? '' : 'dev_jwt_secret');
  if (!secret && isProd) console.warn('JWT_SECRET is not set in production.');
  return secret;
}

function signJwt(payload, options, res) {
  const secret = getJwtSecret();
  if (!secret) {
    if (res) res.status(500).json({ error: 'JWT_SECRET is not configured' });
    return null;
  }
  return jwt.sign(payload, secret, options);
}

const prisma = new PrismaClient();
// Stripe integration removed (handled via manual/local providers)
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const nodemailer = require('nodemailer');
const Twilio = require('twilio');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
let adminApp = null;
let firebaseAdmin = null;
let getMessagingFn = null;
try {
  // prefer modular imports when available
  const { initializeApp, cert, getApps, getApp } = require('firebase-admin/app');
  const { getMessaging } = require('firebase-admin/messaging');
  const adminCompat = require('firebase-admin');

  firebaseAdmin = adminCompat;
  // Resolve service account path: prefer env var, allow relative paths in .env resolved
  const rawSvcPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  let svcPath;
  if (rawSvcPath) {
    svcPath = path.isAbsolute(rawSvcPath) ? rawSvcPath : path.resolve(path.join(__dirname, '..', rawSvcPath));
  } else {
    svcPath = path.join(__dirname, '..', 'firebase-service-account.json');
  }

  try {
    if (fs.existsSync(svcPath)) {
      if (!getApps || getApps().length === 0) {
        adminApp = initializeApp({ credential: cert(require(svcPath)) });
      } else {
        adminApp = getApp();
      }
      console.log('Firebase Admin (modular) initialized from', svcPath);
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      if (!getApps || getApps().length === 0) {
        adminApp = initializeApp();
      } else {
        adminApp = getApp();
      }
      console.log('Firebase Admin (modular) initialized via GOOGLE_APPLICATION_CREDENTIALS');
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      const key = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
      if (!getApps || getApps().length === 0) {
        adminApp = initializeApp({ credential: cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: key }) });
      } else {
        adminApp = getApp();
      }
      console.log('Firebase Admin (modular) initialized from env variables');
    }
  } catch (initErr) {
    console.warn('Failed to initialize modular firebase-admin:', initErr && initErr.message);
    throw initErr;
  }

  // prefer modular getMessaging bound to the initialized app
  getMessagingFn = (app) => getMessaging(app || adminApp);

} catch (e) {
  try {
    // fallback to classic admin SDK usage
    firebaseAdmin = require('firebase-admin');
    const rawSvcPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    let svcPath = rawSvcPath ? (path.isAbsolute(rawSvcPath) ? rawSvcPath : path.resolve(path.join(__dirname, '..', rawSvcPath))) : path.join(__dirname, '..', 'firebase-service-account.json');
    if (fs.existsSync(svcPath)) {
      if (!firebaseAdmin.getApps || firebaseAdmin.getApps().length === 0) {
        adminApp = firebaseAdmin.initializeApp({ credential: firebaseAdmin.credential.cert(require(svcPath)) });
      } else {
        adminApp = firebaseAdmin.getApp();
      }
      console.log('Firebase Admin initialized from', svcPath);
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
      if (!firebaseAdmin.getApps || firebaseAdmin.getApps().length === 0) {
        adminApp = firebaseAdmin.initializeApp();
      } else {
        adminApp = firebaseAdmin.getApp();
      }
      console.log('Firebase Admin initialized via GOOGLE_APPLICATION_CREDENTIALS');
    } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      const key = (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
      if (!firebaseAdmin.getApps || firebaseAdmin.getApps().length === 0) {
        adminApp = firebaseAdmin.initializeApp({ credential: firebaseAdmin.credential.cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: key }) });
      } else {
        adminApp = firebaseAdmin.getApp();
      }
      console.log('Firebase Admin initialized from env variables');
    }
    // compat messaging
    getMessagingFn = (app) => firebaseAdmin.messaging(app);
  } catch (err) {
    console.warn('firebase-admin not available or init failed', err && err.message);
  }
}

const FCM_TOKENS_FILE = path.join(__dirname, '..', 'fcm_tokens.json');
function loadFcmTokens() {
  try {
    if (!fs.existsSync(FCM_TOKENS_FILE)) return {};
    return JSON.parse(fs.readFileSync(FCM_TOKENS_FILE, 'utf8') || '{}');
  } catch (e) { return {}; }
}
function saveFcmTokens(obj) {
  try { fs.writeFileSync(FCM_TOKENS_FILE, JSON.stringify(obj, null, 2), 'utf8'); } catch (e) { console.error('saveFcmTokens err', e.message); }
}

async function sendFcmToTokens(tokens, payload) {
  if (!firebaseAdmin || !adminApp || !Array.isArray(tokens) || tokens.length === 0) return;
  try {
    const message = { notification: { title: payload.title || 'إشعار المتجر', body: payload.body || payload.message || '' }, tokens };
    let resp = null;
    if (typeof getMessagingFn === 'function') {
      resp = await getMessagingFn(adminApp).sendMulticast(message);
    } else if (firebaseAdmin && firebaseAdmin.messaging) {
      resp = await firebaseAdmin.messaging().sendMulticast(message);
    }
    if (resp) console.log('FCM sent', resp.successCount, '/', resp.failureCount);
  } catch (e) { console.error('sendFcm err', e.message); }
}

// notification helpers
async function sendEmail(from, to, subject, text) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return;
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    await transporter.sendMail({ from: from || process.env.NOTIFY_FROM, to, subject, text });
  } catch (err) { console.error('sendEmail err', err.message); }
}

async function sendTelegram(message) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return;
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await axios.post(url, { chat_id: chatId, text: message });
  } catch (err) { console.error('sendTelegram err', err.message); }
}

async function sendSms(to, body) {
  try {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_SMS;
    if (!sid || !token || !from) return;
    const client = Twilio(sid, token);
    await client.messages.create({ body: body, from, to });
  } catch (err) { console.error('sendSms err', err.message); }
}

async function sendWhatsapp(to, body) {
  try {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;
    if (!sid || !token || !from) return;
    const client = Twilio(sid, token);
    await client.messages.create({ body: body, from, to: `whatsapp:${to}` });
  } catch (err) { console.error('sendWhatsapp err', err.message); }
}

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// basic auth endpoint to issue JWT for admin (for demo use ADMIN_USERNAME/ADMIN_PASSWORD or env)
app.post('/auth/login', async (req, res) => {
  try {
    const { username, password, phone, email } = req.body || {};

    // legacy admin login by username/password
    if (username && password) {
      const adminUser = process.env.ADMIN_USERNAME || (isProd ? '' : 'admin');
      const adminPass = process.env.ADMIN_PASSWORD || (isProd ? '' : 'password');
      if (!adminUser || !adminPass) {
        return res.status(500).json({ error: 'ADMIN_USERNAME/ADMIN_PASSWORD not configured' });
      }
      if (username === adminUser && password === adminPass) {
        const token = signJwt({ username, isAdmin: true }, { expiresIn: '8h' }, res);
        if (!token) return;
        return res.json({ token, user: { username, isAdmin: true } });
      }
      return res.status(401).json({ error: 'invalid credentials' });
    }

    // user login with email + password
    if (email && password) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash) return res.status(401).json({ error: 'invalid email or password' });
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ error: 'invalid email or password' });
      const token = signJwt({ userId: user.id, isAdmin: user.isAdmin || false }, { expiresIn: '7d' }, res);
      if (!token) return;
      return res.json({ token, user: { id: user.id, phone: user.phone, name: user.name, email: user.email, isAdmin: user.isAdmin || false } });
    }

    // user login with phone + password
    if (phone && password) {
      const user = await prisma.user.findUnique({ where: { phone } });
      if (!user || !user.passwordHash) return res.status(401).json({ error: 'invalid phone or password' });
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ error: 'invalid phone or password' });
      const token = signJwt({ userId: user.id, isAdmin: user.isAdmin || false }, { expiresIn: '7d' }, res);
      if (!token) return;
      return res.json({ token, user: { id: user.id, phone: user.phone, name: user.name, email: user.email, isAdmin: user.isAdmin || false } });
    }

    return res.status(400).json({ error: 'missing credentials' });
  } catch (e) { console.error('auth login err', e); res.status(500).json({ error: e.message }); }
});

// Register endpoint for phone-based users
app.post('/auth/register', async (req, res) => {
  try {
    const { phone, password, name, email } = req.body || {};
    if (!password || (!phone && !email)) return res.status(400).json({ error: 'phone or email and password required' });

    if (phone) {
      const exists = await prisma.user.findUnique({ where: { phone } });
      if (exists) return res.status(409).json({ error: 'user already exists' });
    }
    if (email) {
      const existsEmail = await prisma.user.findUnique({ where: { email } });
      if (existsEmail) return res.status(409).json({ error: 'user already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { phone, passwordHash: hash, name, email } });
    const token = signJwt({ userId: user.id, isAdmin: user.isAdmin || false }, { expiresIn: '7d' }, res);
    if (!token) return;
    res.json({ token, user: { id: user.id, phone: user.phone, name: user.name, email: user.email, isAdmin: user.isAdmin || false } });
  } catch (e) { console.error('auth register err', e); res.status(500).json({ error: e.message }); }
});

function verifyJwt(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : (req.cookies && req.cookies.token) || null;
  if (!token) return next();
  try {
    const secret = getJwtSecret();
    if (!secret) return next();
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
  } catch (e) { console.error('jwt verify', e.message); }
  next();
}

// helper to read admin key stored on server
function readAdminKey() {
  try {
    const f = path.join(__dirname, '..', 'admin.json');
    if (fs.existsSync(f)) {
      const j = JSON.parse(fs.readFileSync(f, 'utf8'));
      return j.apiKey;
    }
  } catch (e) { console.error('readAdminKey', e.message); }
  return process.env.API_KEY || null;
}

// apply JWT verification to all incoming requests so req.user is available
app.use(require('cookie-parser')());
app.use(verifyJwt);

const SETTINGS_FILE = path.join(__dirname, '..', 'store-settings.json');
function readSettingsFile() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) return null;
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8') || '{}');
  } catch (e) { return null; }
}
function writeSettingsFile(data) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data || {}, null, 2), { encoding: 'utf8' });
}

app.get('/products', async (req, res) => {
  const products = await prisma.product.findMany({});
  res.json(products);
});

app.post('/products', async (req, res) => {
  const { sku, name, description, price, images, inStock, supplierId, category, subCategory, productLink, sizes, sizeIcons, colors, colorIcons } = req.body;
  try {
    const parseArray = (value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try { return JSON.parse(value); } catch { return value ? [value] : []; }
      }
      return [];
    };
    const list = parseArray(images);
    const product = await prisma.product.create({
      data: {
        sku,
        name,
        description,
        price: Number(price),
        images: JSON.stringify(list || []),
        inStock: Number(inStock || 0),
        supplierId,
        category: category || null,
        subCategory: subCategory || null,
        productLink: productLink || null,
        sizes: JSON.stringify(parseArray(sizes) || []),
        sizeIcons: JSON.stringify(parseArray(sizeIcons) || []),
        colors: JSON.stringify(parseArray(colors) || []),
        colorIcons: JSON.stringify(parseArray(colorIcons) || [])
      }
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Stripe payment intent endpoint removed. Payment provider not configured on this server.
app.post('/create-payment-intent', async (req, res) => {
  res.status(501).json({ error: 'Payment provider not configured on this server.' });
});

// ----- Cart & Orders endpoints -----

async function recalcOrderTotal(orderId) {
  const items = await prisma.orderItem.findMany({ where: { orderId } });
  const total = items.reduce((s, it) => s + Number(it.price) * Number(it.quantity), 0);
  await prisma.order.update({ where: { id: orderId }, data: { total } });
  return total;
}

async function createNotification(type, title, message, data = null) {
  try {
    const n = await prisma.notification.create({ data: { type, title, message, data } });
    // send SSE and return created notification
    try { sendSseEvent({ type: 'notification', notification: n }); } catch (e) {}
    // attempt to send FCM if tokens known for user
    try {
      const tokensMap = loadFcmTokens();
      if (data && data.userId) {
        const t = tokensMap[String(data.userId)];
        if (t && t.length) await sendFcmToTokens(t, { title, message });
      } else if (Object.keys(tokensMap).length) {
        // broadcast to all tokens
        const all = Object.values(tokensMap).flat();
        await sendFcmToTokens(all, { title, message });
      }
    } catch (e) { console.error('fcm notify err', e.message); }
    return n;
  } catch (e) { console.error('createNotification err', e.message); }
}

app.get('/cart/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  let order = await prisma.order.findFirst({ where: { userId, status: 'cart' }, include: { items: { include: { product: true } } } });
  if (!order) {
    order = await prisma.order.create({ data: { userId, total: 0, status: 'cart' }, include: { items: true } });
  }
  res.json(order);
});

app.post('/cart/:userId/add', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { productId, quantity = 1 } = req.body;
    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    let order = await prisma.order.findFirst({ where: { userId, status: 'cart' } });
    if (!order) order = await prisma.order.create({ data: { userId, total: 0, status: 'cart' } });

    const existing = await prisma.orderItem.findFirst({ where: { orderId: order.id, productId: product.id } });
    if (existing) {
      await prisma.orderItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + Number(quantity), price: product.price } });
    } else {
      await prisma.orderItem.create({ data: { orderId: order.id, productId: product.id, quantity: Number(quantity), price: product.price } });
    }

    await recalcOrderTotal(order.id);
    const updated = await prisma.order.findUnique({ where: { id: order.id }, include: { items: { include: { product: true } } } });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/cart/:userId/remove', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const { productId, quantity = 1 } = req.body;
    const order = await prisma.order.findFirst({ where: { userId, status: 'cart' } });
    if (!order) return res.status(404).json({ error: 'Cart not found' });

    const existing = await prisma.orderItem.findFirst({ where: { orderId: order.id, productId: Number(productId) } });
    if (!existing) return res.status(404).json({ error: 'Item not in cart' });

    if (existing.quantity > Number(quantity)) {
      await prisma.orderItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity - Number(quantity) } });
    } else {
      await prisma.orderItem.delete({ where: { id: existing.id } });
    }

    await recalcOrderTotal(order.id);
    const updated = await prisma.order.findUnique({ where: { id: order.id }, include: { items: { include: { product: true } } } });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/cart/:userId/checkout', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const currency = req.body.currency || 'usd';
    const order = await prisma.order.findFirst({ where: { userId, status: 'cart' }, include: { items: true } });
    if (!order || !order.items.length) return res.status(400).json({ error: 'Cart empty' });

    const total = await recalcOrderTotal(order.id);

    // Stripe not configured: mark order as pending_payment and return order details
    await prisma.order.update({ where: { id: order.id }, data: { status: 'pending_payment', total } });

    res.json({ orderId: order.id, total, message: 'Payment provider not configured. Use manual payment methods.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create order directly from frontend (local cart)
app.post('/orders/create', async (req, res) => {
  try {
    const { userId, items = [], total, status = 'pending' } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'missing items' });
    const order = await prisma.order.create({ data: { userId: userId ? Number(userId) : null, total: Number(total || 0), status } });
    for (const it of items) {
      const productId = Number(it.productId);
      const quantity = Number(it.quantity || 1);
      const price = Number(it.price || 0);
      if (!productId) continue;
      await prisma.orderItem.create({ data: { orderId: order.id, productId, quantity, price } });
    }
    const full = await prisma.order.findUnique({ where: { id: order.id }, include: { items: { include: { product: true } } } });
    res.json(full);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/orders/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  const orders = await prisma.order.findMany({ where: { userId, status: { not: 'cart' } }, include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } });
  res.json(orders);
});

app.get('/orders/order/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const order = await prisma.order.findUnique({ where: { id }, include: { items: { include: { product: true } }, user: true } });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Simple supplier import endpoint (manual trigger)
app.post('/suppliers/import', async (req, res) => {
  const { supplierId, items } = req.body; // optional items array to upsert
  try {
    if (Array.isArray(items)) {
      for (const it of items) {
        await prisma.product.upsert({
          where: { sku: it.sku },
          update: { name: it.name, description: it.description, price: it.price, images: it.images || [], inStock: it.inStock || 0, supplierId },
          create: { sku: it.sku, name: it.name, description: it.description, price: it.price, images: it.images || [], inStock: it.inStock || 0, supplierId }
        });
      }
    }
    res.json({ status: 'imported' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// serve uploaded proofs
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// SSE clients
const sseClients = new Set();
function sendSseEvent(data) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch (e) {
      console.error('sse write err', e.message);
    }
  }
}

app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write('retry: 10000\n\n');
  sseClients.add(res);
  req.on('close', () => { sseClients.delete(res); });
});

// Notifications API
// notifications with pagination and filters
app.get('/notifications', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(200, Number(req.query.limit || 50));
    const skip = (page - 1) * limit;

    const where = {};
    if (req.query.unread === '1' || req.query.unread === 'true') where.isRead = false;
    if (req.query.type) where.type = String(req.query.type);
    if (req.query.since) {
      const d = new Date(String(req.query.since));
      if (!isNaN(d.getTime())) where.createdAt = { gte: d };
    }
    if (req.query.userId) where.userId = Number(req.query.userId);

    // admin mode requires API key or admin JWT
    if (req.query.admin === '1') {
      const key = req.headers['x-api-key'] || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
      const serverKey = readAdminKey();
      if (req.user && req.user.isAdmin) {
        // ok
      } else if (!serverKey || key !== serverKey) {
        return res.status(401).json({ error: 'unauthorized' });
      }
    }

    const [items, total] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.notification.count({ where })
    ]);

    res.json({ items, total, page, limit });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

function requireApiKey(req, res, next) {
  // allow admin JWT
  if (req.user && req.user.isAdmin) return next();
  const key = req.headers['x-api-key'] || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  const serverKey = readAdminKey();
  if (!serverKey) return res.status(500).json({ error: 'API key not configured' });
  if (key !== serverKey) return res.status(401).json({ error: 'unauthorized' });
  next();
}

// Store settings endpoints
app.get('/settings', async (req, res) => {
  const data = readSettingsFile();
  res.json(data || {});
});

app.post('/settings', requireApiKey, async (req, res) => {
  try {
    writeSettingsFile(req.body || {});
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// User profile endpoints (self or admin)
app.get('/users/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!req.user || (!req.user.isAdmin && req.user.userId !== id)) return res.status(401).json({ error: 'unauthorized' });
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, phone: true, email: true, isAdmin: true } });
    if (!user) return res.status(404).json({ error: 'not found' });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/users/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!req.user || (!req.user.isAdmin && req.user.userId !== id)) return res.status(401).json({ error: 'unauthorized' });
    const { name, email, phone } = req.body || {};
    const user = await prisma.user.update({ where: { id }, data: { name, email, phone } });
    res.json({ id: user.id, name: user.name, phone: user.phone, email: user.email, isAdmin: user.isAdmin });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/notifications/:id/read', requireApiKey, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const n = await prisma.notification.update({ where: { id }, data: { isRead: true } });
    // broadcast change
    try { sendSseEvent({ type: 'notification_read', id }); } catch (e) {}
    res.json(n);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/notifications/mark-all-read', requireApiKey, async (req, res) => {
  try {
    await prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
    // notify clients to refresh
    try { sendSseEvent({ type: 'notifications_marked_read' }); } catch (e) {}
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// store admin api key on server (writes backend/admin.json), requires admin JWT
app.post('/admin/store-key', async (req, res) => {
  try {
    if (!req.user || !req.user.isAdmin) return res.status(401).json({ error: 'unauthorized' });
    const { apiKey } = req.body || {};
    if (!apiKey) return res.status(400).json({ error: 'missing apiKey' });
    const f = path.join(__dirname, '..', 'admin.json');
    fs.writeFileSync(f, JSON.stringify({ apiKey }, null, 2), { encoding: 'utf8' });
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: list all orders (requires API key or admin JWT)
app.get('/admin/orders', requireApiKey, async (req, res) => {
  try {
    const items = await prisma.order.findMany({ include: { items: { include: { product: true } }, user: true }, orderBy: { createdAt: 'desc' } });
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: update order status
app.post('/admin/orders/:id/status', requireApiKey, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ error: 'missing status' });
    const updated = await prisma.order.update({ where: { id }, data: { status: String(status) } });
    res.json(updated);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: list users (requires API key or admin JWT)
app.get('/admin/users', requireApiKey, async (req, res) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, phone: true, email: true, isAdmin: true, createdAt: true } });
    res.json(users);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DEV: send a test notification (creates persistent notification and attempts FCM/SSE)
app.post('/dev/send-notification', async (req, res) => {
  try {
    const { title = 'اختبار إشعار', message = 'هذا إشعار تجريبي من الخادم', userId = null } = req.body || {};
    const data = userId ? { userId } : null;
    const n = await createNotification('test', title, message, data);
    if (!n) return res.status(500).json({ error: 'failed to create notification' });
    res.json({ ok: true, notification: n });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// FCM token registration endpoints (simple file-backed store)
app.post('/fcm/register', async (req, res) => {
  try {
    const { token, userId } = req.body;
    if (!token) return res.status(400).json({ error: 'missing token' });
    const map = loadFcmTokens();
    const key = userId ? String(userId) : '_anon';
    map[key] = map[key] || [];
    if (!map[key].includes(token)) map[key].push(token);
    saveFcmTokens(map);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/fcm/unregister', async (req, res) => {
  try {
    const { token, userId } = req.body;
    if (!token) return res.status(400).json({ error: 'missing token' });
    const map = loadFcmTokens();
    const key = userId ? String(userId) : '_anon';
    if (map[key]) map[key] = map[key].filter(t => t !== token);
    saveFcmTokens(map);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Upload proof of payment (accepts base64 or a proofUrl)
app.post('/orders/:id/upload-proof', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { method = 'bank_transfer', amount, proofBase64, proofFilename, proofUrl, providerReference } = req.body;
    const order = await prisma.order.findUnique({ where: { id }, include: { user: true } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    let savedUrl = proofUrl || null;
    if (proofBase64) {
      const filename = proofFilename || `${Date.now()}_${Math.random().toString(36).slice(2,9)}.png`;
      const filePath = path.join(uploadsDir, filename);
      const buffer = Buffer.from(proofBase64, 'base64');
      fs.writeFileSync(filePath, buffer);
      savedUrl = `/uploads/${filename}`;
    }

    const payment = await prisma.payment.create({ data: { orderId: id, method, amount: Number(amount || order.total), status: 'pending', proofUrl: savedUrl, providerReference } });

    await prisma.order.update({ where: { id }, data: { status: 'pending_payment' } });

    // send notifications
    try {
      const adminMsg = `دفعة واردة — طلب #${order.id}\nالمبلغ: ${payment.amount}\nPayment ID: ${payment.id}\nمرجع العميل: ${payment.providerReference || '-'}\nرابط الإثبات: ${savedUrl || '-'} `;
      await sendTelegram(adminMsg);
      await sendEmail(process.env.NOTIFY_FROM, process.env.NOTIFY_FROM, 'دفعة واردة — تحقق', adminMsg);
          // notify admin via SMS/WhatsApp if configured
          if (process.env.ADMIN_PHONE) {
            await sendSms(process.env.ADMIN_PHONE, `دفعة واردة لطلب #${order.id} — المبلغ: ${payment.amount}`);
            await sendWhatsapp(process.env.ADMIN_PHONE, `دفعة واردة لطلب #${order.id} — المبلغ: ${payment.amount}`);
          }
      if (order.user && order.user.email) {
        const userMsg = `استلمنا سند الدفع لطلبك #${order.id}. سنتحقق منه خلال ساعة عمل.`;
        await sendEmail(process.env.NOTIFY_FROM, order.user.email, 'استلام سند الدفع', userMsg);
            if (order.user.phone) {
              await sendSms(order.user.phone, `استلمنا سند الدفع لطلبك #${order.id}. سنعلمك عند التأكيد.`);
              await sendWhatsapp(order.user.phone, `استلمنا سند الدفع لطلبك #${order.id}. سنعلمك عند التأكيد.`);
            }
      }
    } catch (e) {
      console.error('notify error', e.message);
    }

    // create persistent notification (also broadcasts via SSE)
    try { await createNotification('payment_proof_uploaded', 'دفعة واردة', `دفعة واردة لطلب #${order.id}`, { orderId: order.id, paymentId: payment.id, amount: payment.amount }); } catch(e){}

    res.json({ status: 'uploaded', payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin confirms payment (mark payment and order as paid)
app.post('/admin/orders/:id/confirm-payment', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { paymentId, providerReference } = req.body;
    const payment = paymentId ? await prisma.payment.findUnique({ where: { id: Number(paymentId) } }) : await prisma.payment.findFirst({ where: { orderId: id }, orderBy: { createdAt: 'desc' } });
    if (!payment) return res.status(404).json({ error: 'Payment record not found' });

    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'paid', providerReference: providerReference || payment.providerReference } });
    await prisma.order.update({ where: { id }, data: { status: 'paid' } });

    // notify
    try {
      const order = await prisma.order.findUnique({ where: { id }, include: { user: true } });
      const adminMsg = `تم تأكيد الدفع لطلب #${id}. Payment ID: ${payment.id}`;
      await sendTelegram(adminMsg);
      await sendEmail(process.env.NOTIFY_FROM, process.env.NOTIFY_FROM, 'تم تأكيد دفعة', adminMsg);
      // notify admin via SMS/WhatsApp
      if (process.env.ADMIN_PHONE) {
        await sendSms(process.env.ADMIN_PHONE, `تم تأكيد الدفع لطلب #${id} — Payment ID: ${payment.id}`);
        await sendWhatsapp(process.env.ADMIN_PHONE, `تم تأكيد الدفع لطلب #${id} — Payment ID: ${payment.id}`);
      }
      if (order && order.user && order.user.email) {
        const userMsg = `تم تأكيد استلام الدفعة لطلب #${id}. سنباشر تجهيز طلبك الآن.`;
        await sendEmail(process.env.NOTIFY_FROM, order.user.email, 'تم تأكيد الدفع', userMsg);
        if (order.user.phone) {
          await sendSms(order.user.phone, `تم تأكيد استلام الدفعة لطلب #${id}. شكراً لك.`);
          await sendWhatsapp(order.user.phone, `تم تأكيد استلام الدفعة لطلب #${id}. شكراً لك.`);
        }
      }
    } catch (e) { console.error('notify error', e.message); }

    // create persistent notification (also broadcasts via SSE)
    try { await createNotification('payment_confirmed', 'تم تأكيد الدفع', `تم تأكيد الدفع لطلب #${id}`, { orderId: id, paymentId: payment.id }); } catch(e){}

    res.json({ status: 'confirmed', paymentId: payment.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- Al Kuraimi integration -----

// Create a Kuraimi payment request or return manual transfer instructions
app.post('/payments/kuraimi/create', async (req, res) => {
  try {
    const { orderId, serviceCode, walletCode } = req.body; // serviceCode e.g. 1204213, walletCode e.g. 419137
    const order = await prisma.order.findUnique({ where: { id: Number(orderId) }, include: { items: { include: { product: true } } } });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // If API credentials present, call Kuraimi API (note: replace with real API details/spec)
    if (process.env.KURAIMI_API_URL && process.env.KURAIMI_API_KEY) {
      try {
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        if (!process.env.BASE_URL && isProd) console.warn('BASE_URL is not set in production; using request host for callbacks.');
        const payload = {
          amount: Math.round(order.total * 100),
          currency: 'YER',
          reference: `ORDER-${order.id}`,
          callback_url: `${baseUrl}/webhooks/kuraimi`,
          service_code: serviceCode || undefined,
          wallet_code: walletCode || undefined
        };
        const resp = await axios.post(process.env.KURAIMI_API_URL + '/payments', payload, { headers: { 'Authorization': `Bearer ${process.env.KURAIMI_API_KEY}` } });
        const providerRef = resp.data && (resp.data.reference || resp.data.providerReference) ? (resp.data.reference || resp.data.providerReference) : null;
        const payment = await prisma.payment.create({ data: { orderId: order.id, method: 'kuraimi', amount: order.total, status: 'pending', providerReference: providerRef } });
        return res.json({ status: 'created', providerResponse: resp.data, paymentId: payment.id });
      } catch (err) {
        console.error('Kuraimi API error', err.message);
        // fallthrough to manual instructions
      }
    }

    // Fallback: return manual bank transfer instructions from env, include service/wallet codes for e-wallet routing
    const instructions = {
      bank: 'Al Kuraimi Bank',
      accountName: process.env.KURAIMI_ACCOUNT_NAME || 'Company Name',
      accountNumber: process.env.KURAIMI_ACCOUNT_KURAIMI || process.env.KURAIMI_ACCOUNT_NUMBER || '3007692314',
      branch: process.env.KURAIMI_BANK_BRANCH || 'Main Branch',
      reference: `ORDER-${order.id}`,
      amount: order.total,
      serviceCode: serviceCode || '1204213',
      walletCode: walletCode || '419137',
      contactName: process.env.KURAIMI_CONTACT_NAME || 'اسامه علي راشد علي المصباحي',
      contactPhone: process.env.KURAIMI_CONTACT_PHONE || '772728311',
      alternateAccounts: {
        kuraimi: process.env.KURAIMI_ACCOUNT_KURAIMI || '3007692314',
        sahadi: process.env.KURAIMI_ACCOUNT_SAHADI || '3024742562'
      }
    };
    const payment = await prisma.payment.create({ data: { orderId: order.id, method: 'bank_transfer', amount: order.total, status: 'pending', providerReference: instructions.serviceCode || undefined } });
    await prisma.order.update({ where: { id: order.id }, data: { status: 'pending_payment' } });
    res.json({ status: 'manual_instructions', instructions, paymentId: payment.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Webhook endpoint for Kuraimi to notify payment status
app.post('/webhooks/kuraimi', async (req, res) => {
  try {
    // Basic secret check (adjust header name to provider spec)
    const sig = req.headers['x-kuraimi-signature'] || req.headers['x-signature'];
    if (process.env.KURAIMI_WEBHOOK_SECRET && sig !== process.env.KURAIMI_WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'invalid signature' });
    }

    const { reference, status, providerReference, amount } = req.body;
    // reference expected like ORDER-<id>
    const m = (reference || '').match(/ORDER-(\d+)/);
    if (!m) return res.status(400).json({ error: 'invalid reference' });
    const orderId = Number(m[1]);

    // create or update payment record
    const payment = await prisma.payment.create({ data: { orderId, method: 'kuraimi', amount: Number(amount || 0), status: status === 'paid' ? 'paid' : 'pending', providerReference } });
    if (status === 'paid') {
      await prisma.order.update({ where: { id: orderId }, data: { status: 'paid' } });
    }

      // notify on webhook paid
      try {
        if (status === 'paid') {
          const adminMsg = `Webhook: تم تأكيد الدفع لطلب #${orderId}. مزود: ${providerReference || '-'} `;
                    // create persistent notification for webhook paid (also broadcasts via SSE)
                    try { await createNotification('payment_confirmed', 'تم تأكيد الدفع', `تم تأكيد الدفع لطلب #${orderId} عبر webhook`, { orderId, paymentId: payment.id }); } catch(e){}
          await sendTelegram(adminMsg);
          await sendEmail(process.env.NOTIFY_FROM, process.env.NOTIFY_FROM, 'Webhook - دفعة مؤكدة', adminMsg);
          // notify admin via SMS/WhatsApp
          if (process.env.ADMIN_PHONE) {
            await sendSms(process.env.ADMIN_PHONE, `تم تأكيد الدفع لطلب #${orderId}`);
            await sendWhatsapp(process.env.ADMIN_PHONE, `تم تأكيد الدفع لطلب #${orderId}`);
          }
          const order = await prisma.order.findUnique({ where: { id: orderId }, include: { user: true } });
          if (order && order.user && order.user.email) {
            const userMsg = `تم تأكيد استلام الدفعة لطلب #${orderId}. شكراً.`;
            await sendEmail(process.env.NOTIFY_FROM, order.user.email, 'تم تأكيد الدفع', userMsg);
            if (order.user.phone) {
              await sendSms(order.user.phone, `تم تأكيد استلام الدفعة لطلب #${orderId}. شكراً.`);
              await sendWhatsapp(order.user.phone, `تم تأكيد استلام الدفعة لطلب #${orderId}. شكراً.`);
            }
          }
        }
      } catch (e) { console.error('webhook notify error', e.message); }

    res.json({ received: true });
  } catch (err) {
    console.error('kuraimi webhook error', err.message);
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, '0.0.0.0', () => console.log(`Backend running on http://0.0.0.0:${port}`));

