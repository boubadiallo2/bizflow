import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const [showErrorModal, setShowErrorModal] = useState(false);
  const { name, logout } = useAuth();

  const handleLogout = () => {
    if (sessionStorage.getItem('pos_isCaisseOpen') === 'true') {
      setShowErrorModal(true);
      return;
    }
    logout();
  };

  return (
    <header className="header">
      <div className="header-right">
        <div className="user-profile">
          <div className="avatar">
            <User size={18} />
          </div>
          <span className="user-name">{name || 'Utilisateur'}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>

      {showErrorModal && (
        <div className="logout-modal-overlay" onClick={() => setShowErrorModal(false)}>
          <div className="logout-modal-content" onClick={e => e.stopPropagation()}>
            <div className="logout-modal-icon">
              <AlertCircle size={40} />
            </div>
            <h3 className="logout-modal-title">Caisse ouverte !</h3>
            <p className="logout-modal-text">
              Vous ne pouvez pas vous déconnecter tant que votre caisse est ouverte. Veuillez d'abord fermer la caisse depuis le Point de Vente.
            </p>
            <button className="logout-modal-btn" onClick={() => setShowErrorModal(false)}>
              J'ai compris
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
