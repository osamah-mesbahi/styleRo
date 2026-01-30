const axios = require('axios');
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function importFromSupplier(supplier) {
  try {
    if (!supplier.apiUrl) return;
    const res = await axios.get(supplier.apiUrl, { headers: { 'Authorization': supplier.apiKey || '' } });
    const items = Array.isArray(res.data) ? res.data : res.data.items || [];
    for (const it of items) {
      await prisma.product.upsert({
        where: { sku: it.sku },
        update: { name: it.name, description: it.description, price: it.price, images: it.images || [], inStock: it.inStock || 0 },
        create: { sku: it.sku, name: it.name, description: it.description, price: it.price, images: it.images || [], inStock: it.inStock || 0, supplierId: supplier.id }
      });
    }
  } catch (err) {
    console.error('supplier import error', supplier.name, err.message);
  }
}

async function runSync() {
  const suppliers = await prisma.supplier.findMany();
  for (const s of suppliers) await importFromSupplier(s);
}

// run every hour
cron.schedule('0 * * * *', () => {
  runSync().catch(console.error);
});

module.exports = { runSync };

