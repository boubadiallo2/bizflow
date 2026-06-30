import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Settings, ShieldAlert } from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <ShieldAlert size={24} color="white" />
          </div>
          <div className="admin-brand-text">
            <h1>Nexora</h1>
            <span>SUPER ADMIN</span>
          </div>
        </div>
      </div>
      
      <nav className="admin-sidebar-nav">
        <NavLink to="/admin/dashboard" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Tableau de bord</span>
        </NavLink>
        <NavLink to="/admin/clients" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Clients & Locataires</span>
        </NavLink>
        <NavLink to="/admin/abonnements" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
          <CreditCard size={20} />
          <span>Abonnements & MRR</span>
        </NavLink>
        <NavLink to="/admin/parametres" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Paramètres Globaux</span>
        </NavLink>
      </nav>
    </aside>
  );
};
