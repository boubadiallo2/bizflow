import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <header className="admin-header">
      <div className="admin-header-right">
        <div className="admin-user-profile">
          <div className="admin-avatar">
            SA
          </div>
          <div className="admin-user-info">
            <span className="admin-user-name">Super Administrateur</span>
            <span className="admin-user-role">test@nexora.sn</span>
          </div>
        </div>
        <button className="admin-logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>
    </header>
  );
};
