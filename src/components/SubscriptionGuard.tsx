import React from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  allowedSubscriptions: string[];
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children, allowedSubscriptions }) => {
  const { subscription } = useAuth();

  if (!subscription || !allowedSubscriptions.includes(subscription)) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column', gap: '20px', padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444', fontSize: '24px' }}>Accès restreint</h2>
        <p style={{ fontSize: '16px', color: '#4b5563', maxWidth: '400px' }}>
          Votre abonnement actuel (<strong>{subscription || 'Inconnu'}</strong>) ne permet pas d'accéder à ce module. Veuillez passer à un forfait supérieur pour profiter de cette fonctionnalité.
        </p>
        <button 
          onClick={() => window.location.href = '/abonnement'} 
          className="btn-hero btn-hero-primary"
          style={{ padding: '12px 24px', fontSize: '16px' }}
        >
          Voir les abonnements
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
