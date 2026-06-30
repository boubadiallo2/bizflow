import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ArrowLeft } from 'lucide-react';
import { authService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const data = await authService.login({ email, password });
      login(data.token, data.role, data.tenantId, data.name, data.subscription);
      
      if (data.role === 'SuperAdmin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/app');
      }
    } catch (err: any) {
      setError(err.message || 'Identifiants incorrects.');
    } finally {
      setLoading(false);
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
          <Link to="/" className="login-brand" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
            <img src="/logo.png" alt="Nexora" style={{ height: '48px' }} />
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
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};
