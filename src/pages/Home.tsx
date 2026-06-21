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
  Settings 
} from 'lucide-react';
import './Home.css';

const apps = [
  { path: '/dashboard', icon: LayoutGrid, label: 'Tableau de bord', color: '#8b5cf6', bg: '#ede9fe' },
  { path: '/ventes', icon: ShoppingCart, label: 'Ventes', color: '#10b981', bg: '#d1fae5' },
  { path: '/pos', icon: Monitor, label: 'Point de Vente', color: '#f97316', bg: '#ffedd5' },
  { path: '/facturation', icon: FileText, label: 'Facturation', color: '#3b82f6', bg: '#dbeafe' },
  { path: '/inventaire', icon: Package, label: 'Inventaire', color: '#ec4899', bg: '#fce7f3' },
  { path: '/clients', icon: Users, label: 'Clients', color: '#0ea5e9', bg: '#e0f2fe' },
  { path: '/fournisseurs', icon: Truck, label: 'Fournisseurs', color: '#6366f1', bg: '#e0e7ff' },
  { path: '/rapports', icon: PieChart, label: 'Rapports', color: '#a855f7', bg: '#f3e8ff' },
  { path: '/parametres', icon: Settings, label: 'Paramètres', color: '#64748b', bg: '#f1f5f9' },
];

export const Home: React.FC = () => {
  return (
    <div className="home-container">
      <div className="apps-grid">
        {apps.map((app) => (
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
