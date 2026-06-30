import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './db/index.js';
import { products, clients, suppliers, sales, quotes, settings, tenants, users, invoices } from './db/schema.js';
import { eq, and } from 'drizzle-orm';
import { authenticateToken, requireAdmin, requireSubscription } from './middleware/auth.js';

// Charge l'environnement
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Route de base
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend Express is running!' });
});

// --- AUTHENTICATION ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, company, commerceType, phone, city, address, country, selectedProducts, subscription } = req.body;
    
    // Check if user exists
    const existingUsers = await db.select().from(users).where(eq(users.email, email));
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Un compte existe déjà avec cet e-mail.' });
    }

    // Create Tenant
    const newTenant = await db.insert(tenants).values({
      name: company || name + ' (Entreprise)',
      commerceType: commerceType || 'Autre',
      subscription: subscription || 'Starter',
      status: 'Actif',
    }).returning();

    // Create User
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.insert(users).values({
      tenantId: newTenant[0].id,
      email,
      passwordHash: hashedPassword,
      name,
      role: 'Admin', // L'utilisateur créateur est Admin de son tenant
    }).returning();

    // Initialize Settings for this tenant
    await db.insert(settings).values({
      tenantId: newTenant[0].id,
      name: company || name + ' (Entreprise)',
      ownerName: name,
      commerceType: commerceType || 'Autre',
      selectedProducts: selectedProducts || [],
      email: email,
      phone: phone || '',
      city: city || '',
      address: address || '',
      country: country || 'sn',
    });

    res.status(201).json({ success: true, message: 'Inscription réussie.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Super Admin static check
    if (email === 'test@nexora.sn' && password === 'Passer@12345') {
      const token = jwt.sign({ userId: 0, tenantId: null, role: 'SuperAdmin' }, JWT_SECRET, { expiresIn: '12h' });
      return res.json({ token, role: 'SuperAdmin', name: 'Super Administrateur' });
    }

    const userArray = await db.select().from(users).where(eq(users.email, email));
    if (userArray.length === 0) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    const user = userArray[0];
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    let subscription = 'Starter';
    if (user.tenantId) {
      const tenantArray = await db.select().from(tenants).where(eq(tenants.id, user.tenantId));
      if (tenantArray.length > 0 && tenantArray[0].subscription) {
        subscription = tenantArray[0].subscription;
      }
    }

    const token = jwt.sign({ userId: user.id, tenantId: user.tenantId, role: user.role, subscription }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, role: user.role, tenantId: user.tenantId, name: user.name, subscription });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN ROUTES ---
app.get('/api/admin/tenants', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const data = await db.select().from(tenants);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/tenants/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const updated = await db.update(tenants).set({ status }).where(eq(tenants.id, id)).returning();
    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- MULTI-TENANT HELPERS ---
const requireTenant = (req: any, res: any, next: any) => {
  if (!req.user || !req.user.tenantId) {
    return res.status(403).json({ error: 'Accès refusé. Entreprise non trouvée.' });
  }
  next();
};

// --- PRODUCTS ---
app.get('/api/products', authenticateToken, requireTenant, async (req, res) => {
  try {
    const data = await db.select().from(products).where(eq(products.tenantId, req.user!.tenantId!));
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', authenticateToken, requireTenant, async (req, res) => {
  try {
    const newProduct = await db.insert(products).values({ ...req.body, tenantId: req.user!.tenantId! }).returning();
    res.json(newProduct[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', authenticateToken, requireTenant, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db.update(products)
      .set(req.body)
      .where(and(eq(products.id, id), eq(products.tenantId, req.user!.tenantId!)))
      .returning();
    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', authenticateToken, requireTenant, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(products).where(and(eq(products.id, id), eq(products.tenantId, req.user!.tenantId!)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- CLIENTS ---
app.get('/api/clients', authenticateToken, requireTenant, async (req, res) => {
  try {
    const data = await db.select().from(clients).where(eq(clients.tenantId, req.user!.tenantId!));
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', authenticateToken, requireTenant, async (req, res) => {
  try {
    const newItem = await db.insert(clients).values({ ...req.body, tenantId: req.user!.tenantId! }).returning();
    res.json(newItem[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clients/:id', authenticateToken, requireTenant, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db.update(clients)
      .set(req.body)
      .where(and(eq(clients.id, id), eq(clients.tenantId, req.user!.tenantId!)))
      .returning();
    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clients/:id', authenticateToken, requireTenant, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(clients).where(and(eq(clients.id, id), eq(clients.tenantId, req.user!.tenantId!)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- SUPPLIERS ---
app.get('/api/suppliers', authenticateToken, requireTenant, requireSubscription(['Business', 'Enterprise']), async (req, res) => {
  try {
    const data = await db.select().from(suppliers).where(eq(suppliers.tenantId, req.user!.tenantId!));
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/suppliers', authenticateToken, requireTenant, requireSubscription(['Business', 'Enterprise']), async (req, res) => {
  try {
    const newItem = await db.insert(suppliers).values({ ...req.body, tenantId: req.user!.tenantId! }).returning();
    res.json(newItem[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/suppliers/:id', authenticateToken, requireTenant, requireSubscription(['Business', 'Enterprise']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updated = await db.update(suppliers)
      .set(req.body)
      .where(and(eq(suppliers.id, id), eq(suppliers.tenantId, req.user!.tenantId!)))
      .returning();
    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/suppliers/:id', authenticateToken, requireTenant, requireSubscription(['Business', 'Enterprise']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(suppliers).where(and(eq(suppliers.id, id), eq(suppliers.tenantId, req.user!.tenantId!)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- SALES ---
app.get('/api/sales', authenticateToken, requireTenant, async (req, res) => {
  try {
    const data = await db.select().from(sales).where(eq(sales.tenantId, req.user!.tenantId!));
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sales', authenticateToken, requireTenant, async (req, res) => {
  try {
    const payload = { ...req.body, tenantId: req.user!.tenantId! };
    if (payload.date) {
      payload.date = new Date(payload.date);
    }
    const newItem = await db.insert(sales).values(payload).returning();
    
    // Mettre à jour le stock des produits vendus
    if (payload.cartItems && Array.isArray(payload.cartItems)) {
      for (const item of payload.cartItems) {
        if (item.productId && item.quantity) {
          const productRecords = await db.select().from(products).where(and(eq(products.id, item.productId), eq(products.tenantId, req.user!.tenantId!)));
          if (productRecords.length > 0) {
            const product = productRecords[0];
            const currentStock = product.stock || 0;
            const newStock = Math.max(0, currentStock - item.quantity);
            await db.update(products).set({ stock: newStock }).where(eq(products.id, product.id));
          }
        }
      }
    }

    res.json(newItem[0]);
  } catch (err: any) {
    console.error('Erreur POST /api/sales:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/sales/:id', authenticateToken, requireTenant, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const payload = { ...req.body };
    if (payload.date) {
      payload.date = new Date(payload.date);
    }
    const updated = await db.update(sales)
      .set(payload)
      .where(and(eq(sales.id, id), eq(sales.tenantId, req.user!.tenantId!)))
      .returning();
    res.json(updated[0]);
  } catch (err: any) {
    console.error('Erreur PUT /api/sales:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/sales/:id', authenticateToken, requireTenant, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(sales).where(and(eq(sales.id, id), eq(sales.tenantId, req.user!.tenantId!)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- QUOTES ---
app.get('/api/quotes', authenticateToken, requireTenant, requireSubscription(['Business', 'Enterprise']), async (req, res) => {
  try {
    const data = await db.select().from(quotes).where(eq(quotes.tenantId, req.user!.tenantId!));
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/quotes', authenticateToken, requireTenant, requireSubscription(['Business', 'Enterprise']), async (req, res) => {
  try {
    const payload = { ...req.body, tenantId: req.user!.tenantId! };
    if (payload.date) payload.date = new Date(payload.date);
    if (payload.createdAt) payload.createdAt = new Date(payload.createdAt);
    const newItem = await db.insert(quotes).values(payload).returning();
    res.json(newItem[0]);
  } catch (err: any) {
    console.error("Erreur POST /api/quotes:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/quotes/:id', authenticateToken, requireTenant, requireSubscription(['Business', 'Enterprise']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const payload = { ...req.body };
    if (payload.date) payload.date = new Date(payload.date);
    if (payload.createdAt) payload.createdAt = new Date(payload.createdAt);
    const updated = await db.update(quotes)
      .set(payload)
      .where(and(eq(quotes.id, id), eq(quotes.tenantId, req.user!.tenantId!)))
      .returning();
    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/quotes/:id', authenticateToken, requireTenant, requireSubscription(['Business', 'Enterprise']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(quotes).where(and(eq(quotes.id, id), eq(quotes.tenantId, req.user!.tenantId!)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- INVOICES ---
app.get('/api/invoices', authenticateToken, requireTenant, requireSubscription(['Business', 'Enterprise']), async (req, res) => {
  try {
    const data = await db.select().from(invoices).where(eq(invoices.tenantId, req.user!.tenantId!));
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invoices', authenticateToken, requireTenant, requireSubscription(['Business', 'Enterprise']), async (req, res) => {
  try {
    const payload = { ...req.body, tenantId: req.user!.tenantId! };
    if (payload.date) payload.date = new Date(payload.date);
    if (payload.dueDate) payload.dueDate = new Date(payload.dueDate);
    if (payload.createdAt) payload.createdAt = new Date(payload.createdAt);
    const newItem = await db.insert(invoices).values(payload).returning();
    res.json(newItem[0]);
  } catch (err: any) {
    console.error("Erreur POST /api/invoices:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/invoices/:id', authenticateToken, requireTenant, requireSubscription(['Business', 'Enterprise']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const payload = { ...req.body };
    if (payload.date) payload.date = new Date(payload.date);
    if (payload.dueDate) payload.dueDate = new Date(payload.dueDate);
    if (payload.createdAt) payload.createdAt = new Date(payload.createdAt);
    const updated = await db.update(invoices)
      .set(payload)
      .where(and(eq(invoices.id, id), eq(invoices.tenantId, req.user!.tenantId!)))
      .returning();
    res.json(updated[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/invoices/:id', authenticateToken, requireTenant, requireSubscription(['Business', 'Enterprise']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(invoices).where(and(eq(invoices.id, id), eq(invoices.tenantId, req.user!.tenantId!)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- SETTINGS ---
app.get('/api/settings', authenticateToken, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const data = await db.select().from(settings).where(eq(settings.tenantId, tenantId));
    const tenantData = await db.select({ createdAt: tenants.createdAt, subscription: tenants.subscription }).from(tenants).where(eq(tenants.id, tenantId));
    
    let result = data[0] || {};
    if (tenantData.length > 0) {
      result = { ...result, tenantCreatedAt: tenantData[0].createdAt, tenantSubscription: tenantData[0].subscription };
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', authenticateToken, requireTenant, async (req, res) => {
  try {
    const tenantId = req.user!.tenantId!;
    const allSettings = await db.select().from(settings).where(eq(settings.tenantId, tenantId));
    
    if (allSettings.length > 0) {
      const updated = await db.update(settings).set(req.body).where(eq(settings.id, allSettings[0].id)).returning();
      res.json(updated[0]);
    } else {
      const newItem = await db.insert(settings).values({ ...req.body, tenantId }).returning();
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
