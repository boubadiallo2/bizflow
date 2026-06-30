import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './LandingPage.css';

export const TermsPage: React.FC = () => {
  return (
    <div className="landing-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="landing-navbar">
        <Link to="/" className="landing-brand" style={{ textDecoration: 'none' }}>
          <img src="/logo.png" alt="Nexora Logo" style={{ height: '40px' }} />
          <h1 style={{ color: 'var(--color-text)' }}>Nexora</h1>
        </Link>
        <div className="landing-auth-buttons">
          <Link to="/" className="btn-hero btn-hero-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ArrowLeft size={18} />
            Retour à l'accueil
          </Link>
        </div>
      </nav>

      <main style={{ flex: 1, padding: '4rem 5%', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--color-text)' }}>Conditions Générales d'Utilisation</h1>
        
        <div style={{ lineHeight: '1.8', color: 'var(--color-text-muted)' }}>
          <h2 style={{ color: 'var(--color-text)', marginTop: '2rem', marginBottom: '1rem' }}>1. Introduction</h2>
          <p style={{ marginBottom: '1rem' }}>
            Les présentes Conditions Générales d'Utilisation régissent l'accès et l'utilisation du logiciel de gestion Nexora ERP. En souscrivant à nos services, vous acceptez sans réserve ces conditions.
          </p>

          <h2 style={{ color: 'var(--color-text)', marginTop: '2rem', marginBottom: '1rem' }}>2. Services Fournis</h2>
          <p style={{ marginBottom: '1rem' }}>
            Nexora met à disposition une solution logicielle (SaaS) permettant la gestion de point de vente, la gestion d'inventaire, la facturation et l'édition de rapports pour les PME. 
            Les fonctionnalités disponibles dépendent de l'abonnement souscrit (Starter, Business, Enterprise).
          </p>

          <h2 style={{ color: 'var(--color-text)', marginTop: '2rem', marginBottom: '1rem' }}>3. Abonnements et Paiements</h2>
          <p style={{ marginBottom: '1rem' }}>
            L'utilisation du service nécessite la souscription à un abonnement payant. Les paiements sont effectués de manière mensuelle ou annuelle. 
            En cas de non-paiement à l'échéance, l'accès à certaines fonctionnalités pourra être restreint.
          </p>

          <h2 style={{ color: 'var(--color-text)', marginTop: '2rem', marginBottom: '1rem' }}>4. Disponibilité du Service</h2>
          <p style={{ marginBottom: '1rem' }}>
            Nous nous efforçons de maintenir un accès continu au service (99.9% de disponibilité). Toutefois, des interruptions pour maintenance technique ou mise à jour peuvent survenir. Nexora ne saurait être tenu responsable des pertes de revenus liées à ces interruptions.
          </p>

          <h2 style={{ color: 'var(--color-text)', marginTop: '2rem', marginBottom: '1rem' }}>5. Propriété Intellectuelle</h2>
          <p style={{ marginBottom: '1rem' }}>
            Tous les éléments composant l'application Nexora ERP (code source, logos, interfaces) restent la propriété exclusive de Nexora. L'utilisateur se voit accorder une licence d'utilisation non exclusive et non transférable.
          </p>
        </div>
      </main>

      <footer className="landing-footer" style={{ marginTop: 'auto' }}>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Nexora ERP. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};
