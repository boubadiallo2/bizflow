import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { db } from './db';
import { products, clients, suppliers, sales, quotes, settings } from './db/schema';
import { eq } from 'drizzle-orm';

// Charge l'environnement
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes de base
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend Express is running!' });
});

// Route pour tester la connexion à Neon
app.get('/api/test-db', async (req, res) => {
  try {
    const allProducts = await db.select().from(products).limit(5);
    res.json({
      success: true,
      message: 'Connexion à Neon réussie !',
      data: allProducts,
    });
  } catch (error: any) {
    console.error("Erreur de connexion à la base de données:", error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion à Neon. Vérifiez votre DATABASE_URL.',
      error: error.message
    });
  }
});

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
  try {
    const data = await db.select().from(products);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const newProduct = await db.insert(products).values(req.body).returning();
    res.json(newProduct[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db.update(products).set(req.body).where(eq(products.id, id)).returning();
    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(products).where(eq(products.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- CLIENTS ---
app.get('/api/clients', async (req, res) => {
  try {
    const data = await db.select().from(clients);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const newItem = await db.insert(clients).values(req.body).returning();
    res.json(newItem[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clients/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db.update(clients).set(req.body).where(eq(clients.id, id)).returning();
    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clients/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(clients).where(eq(clients.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- SUPPLIERS ---
app.get('/api/suppliers', async (req, res) => {
  try {
    const data = await db.select().from(suppliers);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/suppliers', async (req, res) => {
  try {
    const newItem = await db.insert(suppliers).values(req.body).returning();
    res.json(newItem[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/suppliers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db.update(suppliers).set(req.body).where(eq(suppliers.id, id)).returning();
    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/suppliers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(suppliers).where(eq(suppliers.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- SALES ---
app.get('/api/sales', async (req, res) => {
  try {
    const data = await db.select().from(sales);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sales', async (req, res) => {
  try {
    const newItem = await db.insert(sales).values(req.body).returning();
    res.json(newItem[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/sales/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db.update(sales).set(req.body).where(eq(sales.id, id)).returning();
    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sales/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(sales).where(eq(sales.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- QUOTES ---
app.get('/api/quotes', async (req, res) => {
  try {
    const data = await db.select().from(quotes);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/quotes', async (req, res) => {
  try {
    const newItem = await db.insert(quotes).values(req.body).returning();
    res.json(newItem[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/quotes/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db.update(quotes).set(req.body).where(eq(quotes.id, id)).returning();
    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/quotes/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(quotes).where(eq(quotes.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- SETTINGS ---
app.get('/api/settings', async (req, res) => {
  try {
    const data = await db.select().from(settings);
    // Usually settings is a singleton, return first element if it exists
    res.json(data[0] || null);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    // Upsert logic for settings: usually we just update ID 1 or create it if not exists.
    const allSettings = await db.select().from(settings);
    if (allSettings.length > 0) {
      const updated = await db.update(settings).set(req.body).where(eq(settings.id, allSettings[0].id)).returning();
      res.json(updated[0]);
    } else {
      const newItem = await db.insert(settings).values(req.body).returning();
      res.json(newItem[0]);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Démarre le serveur localement (sauf sur Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running at http://localhost:${PORT}`);
  });
}

export default app;
