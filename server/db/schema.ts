import { pgTable, serial, text, timestamp, varchar, integer, boolean, jsonb, decimal } from 'drizzle-orm/pg-core';

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }),
  unit: varchar('unit', { length: 50 }),
  stock: integer('stock').default(0),
  minStock: integer('min_stock').default(5),
  achat: varchar('achat', { length: 100 }),
  vente: varchar('vente', { length: 100 }),
  priceValue: integer('price_value').default(0),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  location: text('location'),
  initial: varchar('initial', { length: 10 }),
  debt: varchar('debt', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  location: text('location'),
  products: text('products'), // Description of what they supply
  createdAt: timestamp('created_at').defaultNow(),
});

export const sales = pgTable('sales', {
  id: serial('id').primaryKey(),
  ticketId: varchar('ticket_id', { length: 100 }).notNull().unique(),
  date: timestamp('date').defaultNow(),
  amount: integer('amount').notNull(),
  tendered: integer('tendered'),
  change: integer('change'),
  itemsCount: integer('items_count'),
  method: varchar('method', { length: 50 }),
  status: varchar('status', { length: 50 }),
  cartItems: jsonb('cart_items'), // To keep it simple, we store the cart array as JSON
  createdAt: timestamp('created_at').defaultNow(),
});

export const quotes = pgTable('quotes', {
  id: serial('id').primaryKey(),
  quoteNumber: varchar('quote_number', { length: 100 }).notNull().unique(),
  client: varchar('client', { length: 255 }),
  date: timestamp('date').defaultNow(),
  totalHT: integer('total_ht'),
  tva: integer('tva'),
  totalTTC: integer('total_ttc'),
  status: varchar('status', { length: 50 }),
  lines: jsonb('lines'), // JSON array of quote items
  createdAt: timestamp('created_at').defaultNow(),
});

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  ownerName: varchar('owner_name', { length: 255 }),
  name: varchar('name', { length: 255 }), // Company name
  commerceType: varchar('commerce_type', { length: 100 }),
  selectedProducts: jsonb('selected_products'),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  address: text('address'),
  country: varchar('country', { length: 10 }),
  city: varchar('city', { length: 100 }),
  logo: text('logo'),
  subscription: varchar('subscription', { length: 50 }).default('Free'),
  updatedAt: timestamp('updated_at').defaultNow(),
});
