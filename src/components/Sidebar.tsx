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
  Wallet,
  Lock
} from 'lucide-react';
import { productsService, settingsService } from '../services/apiService';
import './Sidebar.css';

const navItems = [
  { path: '/app', icon: LayoutGrid, label: 'Accueil' },
  { path: '/dashboard', icon: BarChart2, label: 'Tableau de bord' },
  { path: '/ventes', icon: ShoppingCart, label: 'Ventes' },
  { path: '/devis', icon: FileSignature, label: 'Devis' },
  { path: '/pos', icon: Monitor, label: 'Point de vente' },
  { path: '/facturation', icon: FileText, label: 'Facturation' },
  { path: '/inventaire', icon: Package, label: 'Inventaire' },
  { path: '/clients', icon: Users, label: 'Clients' },
  { path: '/fournisseurs', icon: Truck, label: 'Fournisseurs' },
  { path: '/rapports', icon: PieChart, label: 'Rapports' },
  { path: '/depenses', icon: Wallet, label: 'Dépenses', requiresEnterprise: true },
  { path: '/abonnement', icon: CreditCard, label: 'Abonnement' },
  { path: '/parametres', icon: Settings, label: 'Paramètres' },
];

interface SidebarProps {
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, toggleCollapse }) => {
  const getLogoKey = () => `company_logo_${localStorage.getItem('nexora_tenantId') || 'default'}`;

  const [companyLogo, setCompanyLogo] = useState<string | null>(
    localStorage.getItem(getLogoKey())
  );
  const [alertsCount, setAlertsCount] = useState(0);
  const [isEnterprise, setIsEnterprise] = useState(false);

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
          if (settings.subscription === 'Enterprise') {
            setIsEnterprise(true);
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
            <img src="/logo.png" alt="Nexora" style={{ height: '28px', marginBottom: '4px' }} />
            <p>ERP pour PME</p>
          </div>
        )}
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => {
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
            {!isCollapsed && (item as any).requiresEnterprise && !isEnterprise && <Lock size={14} className="nav-icon" style={{ marginLeft: 'auto', opacity: 0.5 }} />}
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
