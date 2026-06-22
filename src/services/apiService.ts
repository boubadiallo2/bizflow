const API_URL = '/api';

// Helper pour récupérer le token depuis le localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('bizflow_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res: Response) => {
  if (res.status === 401 || res.status === 403) {
    // Token expiré ou invalide
    localStorage.removeItem('bizflow_token');
    localStorage.removeItem('bizflow_role');
    localStorage.removeItem('bizflow_tenantId');
    localStorage.removeItem('bizflow_name');
    window.location.href = '/login';
    throw new Error('Session expirée. Veuillez vous reconnecter.');
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Erreur serveur: ${res.status}`);
  }
  return res.json();
};

// ==========================================
// Service CRUD générique pour API REST
// ==========================================

export async function getAll<T>(endpoint: string): Promise<(T & { id: string })[]> {
  try {
    const res = await fetch(`${API_URL}/${endpoint}`, {
      headers: getAuthHeaders(),
    });
    return await handleResponse(res);
  } catch (error) {
    console.error(`Erreur GET /api/${endpoint}:`, error);
    return [];
  }
}

export async function getById<T>(endpoint: string, id: string | number): Promise<(T & { id: string }) | null> {
  try {
    const url = endpoint === 'settings' ? `${API_URL}/${endpoint}` : `${API_URL}/${endpoint}/${id}`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(res);
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
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const newItem = await handleResponse(res);
    return newItem.id ? newItem.id.toString() : '';
  } catch (error) {
    console.error(`Erreur POST /api/${endpoint}:`, error);
    throw error;
  }
}

export async function update(endpoint: string, id: string | number, data: any): Promise<void> {
  try {
    const url = endpoint === 'settings' ? `${API_URL}/${endpoint}` : `${API_URL}/${endpoint}/${id}`;
    const method = endpoint === 'settings' ? 'POST' : 'PUT';
    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    await handleResponse(res);
  } catch (error) {
    console.error(`Erreur ${endpoint === 'settings' ? 'POST' : 'PUT'} /api/${endpoint}/${id}:`, error);
    throw error;
  }
}

export async function set<T>(endpoint: string, id: string | number, data: T): Promise<void> {
  await update(endpoint, id, data);
}

export async function remove(endpoint: string, id: string | number): Promise<void> {
  try {
    const res = await fetch(`${API_URL}/${endpoint}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    await handleResponse(res);
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

export const invoicesService = {
  getAll: () => getAll<any>('invoices'),
  getById: (id: string | number) => getById<any>('invoices', id),
  add: (data: any) => add('invoices', data),
  update: (id: string | number, data: any) => update('invoices', id, data),
  remove: (id: string | number) => remove('invoices', id),
};

export const expensesService = {
  getAll: () => getAll<any>('expenses'),
  getById: (id: string | number) => getById<any>('expenses', id),
  add: (data: any) => add('expenses', data),
  update: (id: string | number, data: any) => update('expenses', id, data),
  remove: (id: string | number) => remove('expenses', id),
};

export const settingsService = {
  get: () => getById<any>('settings', 'company'),
  save: (data: any) => add('settings', data), 
};

export const adminTenantsService = {
  getAll: () => getAll<any>('admin/tenants'),
  updateStatus: (id: string | number, status: string) => fetch(`${API_URL}/admin/tenants/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  }).then(handleResponse),
};

export const authService = {
  login: async (credentials: any) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },
  register: async (userData: any) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  }
};
