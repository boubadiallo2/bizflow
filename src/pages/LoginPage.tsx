import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ArrowLeft } from 'lucide-react';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  // Pré-remplir avec les identifiants par défaut demandés
  const [email, setEmail] = useState('boudiallo20@gmail.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Super Admin Authentication
    if (email === 'test@bizflow.sn' && password === 'Passer@12345') {
      // Dans une vraie app, on stockerait un token admin
      navigate('/admin/dashboard');
      return;
    }

    // Validation du compte par défaut
    if (email === 'boudiallo20@gmail.com') {
      navigate('/app');
    } else {
      setError('Adresse e-mail ou mot de passe incorrect.');
    }
  };

  return (
    <div className="login-page">
      <Link to="/" className="back-home-link" style={{ position: 'absolute', top: '32px', left: '32px', display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', textDecoration: 'none', fontWeight: 500 }}>
        <ArrowLeft size={20} />
        Retour à l'accueil
      </Link>
      <div className="login-card">
        <div className="login-header">
          <Link to="/" className="login-brand" style={{ textDecoration: 'none' }}>
            <div className="login-brand-icon">
              <Store size={28} />
            </div>
            <h1>BizFlow</h1>
          </Link>
          <h2 className="login-title">Bon retour !</h2>
          <p className="login-subtitle">Connectez-vous à votre compte</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Adresse e-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: boudiallo20@gmail.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="login-btn">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
};
