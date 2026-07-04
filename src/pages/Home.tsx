import React from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutGrid, 
  ShoppingCart, 
  Monitor, 
  FileText, 
  Package, 
  Users, 
  Truck, 
  PieChart, 
  Settings,
  Store,
  Wallet
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const apps = [
  { path: '/dashboard', icon: LayoutGrid, label: 'Tableau de bord', color: '#8b5cf6', bg: '#ede9fe', allowed: ['Starter', 'Business', 'Enterprise'] },
  { path: '/ventes', icon: ShoppingCart, label: 'Ventes', color: '#10b981', bg: '#d1fae5', allowed: ['Starter', 'Business', 'Enterprise'] },
  { path: '/pos', icon: Monitor, label: 'Point de Vente', color: '#f97316', bg: '#ffedd5', allowed: ['Starter', 'Business', 'Enterprise'] },
  { path: '/facturation', icon: FileText, label: 'Facturation', color: '#3b82f6', bg: '#dbeafe', allowed: ['Business', 'Enterprise'] },
  { path: '/inventaire', icon: Package, label: 'Inventaire', color: '#ec4899', bg: '#fce7f3', allowed: ['Starter', 'Business', 'Enterprise'] },
  { path: '/clients', icon: Users, label: 'Clients', color: '#0ea5e9', bg: '#e0f2fe', allowed: ['Starter', 'Business', 'Enterprise'] },
  { path: '/fournisseurs', icon: Truck, label: 'Fournisseurs', color: '#6366f1', bg: '#e0e7ff', allowed: ['Business', 'Enterprise'] },
  { path: '/rapports', icon: PieChart, label: 'Rapports', color: '#a855f7', bg: '#f3e8ff', allowed: ['Business', 'Enterprise'] },
  { path: '/depenses', icon: Wallet, label: 'Dépenses', color: '#ef4444', bg: '#fee2e2', allowed: ['Enterprise'] },
  { path: '/boutiques', icon: Store, label: 'Boutiques', color: '#14b8a6', bg: '#ccfbf1', allowed: ['Enterprise'] },
  { path: '/parametres', icon: Settings, label: 'Paramètres', color: '#64748b', bg: '#f1f5f9', allowed: ['Starter', 'Business', 'Enterprise'] },
];

export const Home: React.FC = () => {
  const { subscription, role, permissions } = useAuth();

  return (
    <div className="home-container">
      <div className="apps-grid">
        {apps.filter(app => {
          if (!app.allowed.includes(subscription || 'Starter')) return false;
          
          if (role === 'Utilisateur') {
            if (!permissions || !permissions.includes(app.path)) {
              return false;
            }
          }
          return true;
        }).map((app) => (
          <Link to={app.path} key={app.path} className="app-card">
            <div className="app-icon-wrapper" style={{ backgroundColor: app.bg }}>
              <app.icon size={32} color={app.color} />
            </div>
            <span className="app-label">{app.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
