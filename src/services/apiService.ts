const API_URL = 'http://localhost:3001/api';

// ==========================================
// Service CRUD générique pour API REST
// ==========================================

export async function getAll<T>(endpoint: string): Promise<(T & { id: string })[]> {
  try {
    const res = await fetch(`${API_URL}/${endpoint}`);
    if (!res.ok) throw new Error(`Erreur lors de la lecture de ${endpoint}`);
    return await res.json();
  } catch (error) {
    console.error(`Erreur GET /api/${endpoint}:`, error);
    return [];
  }
}

export async function getById<T>(endpoint: string, id: string | number): Promise<(T & { id: string }) | null> {
  try {
    // Dans Express, l'endpoint settings n'a pas besoin de /:id
    const url = endpoint === 'settings' ? `${API_URL}/${endpoint}` : `${API_URL}/${endpoint}/${id}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erreur lors de la lecture de ${endpoint}/${id}`);
    const data = await res.json();
    return data ? data : null;
  } catch (error) {
    console.error(`Erreur GET /api/${endpoint}/${id}:`, error);
    return null;
  }
}

export async function add<T>(endpoint: string, data: T): Promise<string> {
  try {
    const res = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Erreur lors de l'ajout dans ${endpoint}`);
    const newItem = await res.json();
    return newItem.id.toString();
  } catch (error) {
    console.error(`Erreur POST /api/${endpoint}:`, error);
    throw error;
  }
}

export async function update(endpoint: string, id: string | number, data: any): Promise<void> {
  try {
    const url = endpoint === 'settings' ? `${API_URL}/${endpoint}` : `${API_URL}/${endpoint}/${id}`;
    const method = endpoint === 'settings' ? 'POST' : 'PUT'; // Pour les settings on utilise POST (upsert)
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`Erreur lors de la mise à jour de ${endpoint}/${id}`);
  } catch (error) {
    console.error(`Erreur PUT /api/${endpoint}/${id}:`, error);
    throw error;
  }
}

export async function set<T>(endpoint: string, id: string | number, data: T): Promise<void> {
  // Pour le backend SQL, `set` est équivalent à `update` dans la plupart des cas, ou à POST pour settings
  await update(endpoint, id, data);
}

export async function remove(endpoint: string, id: string | number): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/${endpoint}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`Erreur lors de la suppression de ${endpoint}/${id}`);
  } catch (error) {
    console.error(`Erreur DELETE /api/${endpoint}/${id}:`, error);
    throw error;
  }
}

// ==========================================
// Services spécifiques par collection
// ==========================================

export const productsService = {
  getAll: () => getAll<any>('products'),
  getById: (id: string | number) => getById<any>('products', id),
  add: (data: any) => add('products', data),
  update: (id: string | number, data: any) => update('products', id, data),
  remove: (id: string | number) => remove('products', id),
};

export const clientsService = {
  getAll: () => getAll<any>('clients'),
  getById: (id: string | number) => getById<any>('clients', id),
  add: (data: any) => add('clients', data),
  update: (id: string | number, data: any) => update('clients', id, data),
  remove: (id: string | number) => remove('clients', id),
};

export const salesService = {
  getAll: () => getAll<any>('sales'),
  add: (data: any) => add('sales', data),
  update: (id: string | number, data: any) => update('sales', id, data),
  remove: (id: string | number) => remove('sales', id),
};

export const suppliersService = {
  getAll: () => getAll<any>('suppliers'),
  getById: (id: string | number) => getById<any>('suppliers', id),
  add: (data: any) => add('suppliers', data),
  update: (id: string | number, data: any) => update('suppliers', id, data),
  remove: (id: string | number) => remove('suppliers', id),
};

export const quotesService = {
  getAll: () => getAll<any>('quotes'),
  getById: (id: string | number) => getById<any>('quotes', id),
  add: (data: any) => add('quotes', data),
  update: (id: string | number, data: any) => update('quotes', id, data),
  remove: (id: string | number) => remove('quotes', id),
};

export const settingsService = {
  get: () => getById<any>('settings', 'company'),
  save: (data: any) => add('settings', data), // on utilise POST pour upsert les settings
};
