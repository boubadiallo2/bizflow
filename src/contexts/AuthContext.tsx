import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  token: string | null;
  role: string | null;
  tenantId: number | null;
  name: string | null;
  login: (token: string, role: string, tenantId: number | null, name: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  role: null,
  tenantId: null,
  name: null,
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

  const login = (newToken: string, newRole: string, newTenantId: number | null, newName: string) => {
    localStorage.setItem('nexora_token', newToken);
    localStorage.setItem('nexora_role', newRole);
    if (newTenantId !== null) {
      localStorage.setItem('nexora_tenantId', newTenantId.toString());
    } else {
      localStorage.removeItem('nexora_tenantId');
    }
    localStorage.setItem('nexora_name', newName);

    setToken(newToken);
    setRole(newRole);
    setTenantId(newTenantId);
    setName(newName);
  };

  const logout = () => {
    localStorage.removeItem('nexora_token');
    localStorage.removeItem('nexora_role');
    localStorage.removeItem('nexora_tenantId');
    localStorage.removeItem('nexora_name');

    setToken(null);
    setRole(null);
    setTenantId(null);
    setName(null);
    
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ token, role, tenantId, name, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
