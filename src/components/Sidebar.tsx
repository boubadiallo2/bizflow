import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutGrid, 
  BarChart2, 
  ShoppingCart, 
  Monitor, 
  FileText, 
  Package, 
  Users, 
  Truck, 
  PieChart, 
  CreditCard, 
  Settings,
  ChevronLeft,
  Store,
  FileSignature,
  Wallet
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { productsService, settingsService } from '../services/apiService';
import './Sidebar.css';

const navItems = [
  { path: '/app', icon: LayoutGrid, label: 'Accueil', allowed: ['Starter', 'Business', 'Enterprise'] },
  { path: '/dashboard', icon: BarChart2, label: 'Tableau de bord', allowed: ['Starter', 'Business', 'Enterprise'] },
  { path: '/ventes', icon: ShoppingCart, label: 'Ventes', allowed: ['Starter', 'Business', 'Enterprise'] },
  { path: '/devis', icon: FileSignature, label: 'Devis', allowed: ['Business', 'Enterprise'] },
  { path: '/pos', icon: Monitor, label: 'Point de vente', allowed: ['Starter', 'Business', 'Enterprise'] },
  { path: '/facturation', icon: FileText, label: 'Facturation', allowed: ['Business', 'Enterprise'] },
  { path: '/inventaire', icon: Package, label: 'Inventaire', allowed: ['Starter', 'Business', 'Enterprise'] },
  { path: '/clients', icon: Users, label: 'Clients', allowed: ['Starter', 'Business', 'Enterprise'] },
  { path: '/fournisseurs', icon: Truck, label: 'Fournisseurs', allowed: ['Business', 'Enterprise'] },
  { path: '/rapports', icon: PieChart, label: 'Rapports', allowed: ['Business', 'Enterprise'] },
  { path: '/depenses', icon: Wallet, label: 'Dépenses', allowed: ['Enterprise'] },
  { path: '/abonnement', icon: CreditCard, label: 'Abonnement', allowed: ['Starter', 'Business', 'Enterprise'] },
  { path: '/parametres', icon: Settings, label: 'Paramètres', allowed: ['Starter', 'Business', 'Enterprise'] },
];

interface SidebarProps {
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, toggleCollapse }) => {
  const getLogoKey = () => `company_logo_${localStorage.getItem('nexora_tenantId') || 'default'}`;

  const { subscription } = useAuth();
  const [companyLogo, setCompanyLogo] = useState<string | null>(
    localStorage.getItem(getLogoKey())
  );
  const [companyName, setCompanyName] = useState<string>('Ma Boutique');
  const [alertsCount, setAlertsCount] = useState(0);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const products = await productsService.getAll();
        const count = products.filter((p: any) => p.stock <= (p.minStock || 5)).length;
        setAlertsCount(count);
      } catch (e) {
        console.error("Erreur alertes inventaire:", e);
      }
    };

    const fetchSettings = async () => {
      try {
        const settings = await settingsService.get();
        if (settings) {
          if (settings.companyName) {
            setCompanyName(settings.companyName);
          }
          if (settings.logo) {
            setCompanyLogo(settings.logo);
            localStorage.setItem(getLogoKey(), settings.logo);
          } else {
            setCompanyLogo(null);
            localStorage.removeItem(getLogoKey());
          }
        }
      } catch (e) {
        console.error("Erreur settings Sidebar:", e);
      }
    };
    
    fetchAlerts();
    fetchSettings();

    const handleLogoUpdate = () => {
      setCompanyLogo(localStorage.getItem(getLogoKey()));
    };
    
    window.addEventListener('logo-updated', handleLogoUpdate);
    window.addEventListener('inventory-updated', fetchAlerts);
    
    return () => {
      window.removeEventListener('logo-updated', handleLogoUpdate);
      window.removeEventListener('inventory-updated', fetchAlerts);
    };
  }, []);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className={`brand-icon ${companyLogo ? 'has-logo' : ''}`}>
          {companyLogo ? (
            <img src={companyLogo} alt="Logo" className="brand-logo-img" />
          ) : (
            <Store size={20} color="white" />
          )}
        </div>
        {!isCollapsed && (
          <div className="brand-text">
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold' }}>{companyName}</h3>
          </div>
        )}
      </div>
      
      <nav className="sidebar-nav">
        {navItems.filter(item => item.allowed.includes(subscription || 'Starter')).map((item) => {
          const badgeValue = item.path === '/inventaire' ? (alertsCount > 0 ? alertsCount : undefined) : (item as any).badge;
          return (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon size={20} className="nav-icon" />
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
            {!isCollapsed && badgeValue && <span className="nav-badge">{badgeValue}</span>}
          </NavLink>
        )})}
      </nav>

      <div className="sidebar-footer">
        <button className="collapse-btn" onClick={toggleCollapse}>
          <ChevronLeft size={18} style={{ transform: isCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
          {!isCollapsed && <span>Réduire</span>}
        </button>
      </div>
    </aside>
  );
};
