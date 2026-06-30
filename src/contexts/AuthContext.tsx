import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  token: string | null;
  role: string | null;
  tenantId: number | null;
  name: string | null;
  subscription: string | null;
  login: (token: string, role: string, tenantId: number | null, name: string, subscription: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  role: null,
  tenantId: null,
  name: null,
  subscription: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('nexora_token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('nexora_role'));
  const [tenantId, setTenantId] = useState<number | null>(
    localStorage.getItem('nexora_tenantId') ? Number(localStorage.getItem('nexora_tenantId')) : null
  );
  const [name, setName] = useState<string | null>(localStorage.getItem('nexora_name'));
  const [subscription, setSubscription] = useState<string | null>(localStorage.getItem('nexora_subscription'));

  const login = (newToken: string, newRole: string, newTenantId: number | null, newName: string, newSubscription: string) => {
    localStorage.setItem('nexora_token', newToken);
    localStorage.setItem('nexora_role', newRole);
    if (newTenantId !== null) {
      localStorage.setItem('nexora_tenantId', newTenantId.toString());
    } else {
      localStorage.removeItem('nexora_tenantId');
    }
    localStorage.setItem('nexora_name', newName);
    localStorage.setItem('nexora_subscription', newSubscription);

    setToken(newToken);
    setRole(newRole);
    setTenantId(newTenantId);
    setName(newName);
    setSubscription(newSubscription);
  };

  const logout = () => {
    localStorage.removeItem('nexora_token');
    localStorage.removeItem('nexora_role');
    localStorage.removeItem('nexora_tenantId');
    localStorage.removeItem('nexora_name');
    localStorage.removeItem('nexora_subscription');

    setToken(null);
    setRole(null);
    setTenantId(null);
    setName(null);
    setSubscription(null);
    
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ token, role, tenantId, name, subscription, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
