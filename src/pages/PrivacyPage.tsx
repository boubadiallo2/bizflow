import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './LandingPage.css';

export const PrivacyPage: React.FC = () => {
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
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', color: 'var(--color-text)' }}>Politique de Confidentialité</h1>
        
        <div style={{ lineHeight: '1.8', color: 'var(--color-text-muted)' }}>
          <h2 style={{ color: 'var(--color-text)', marginTop: '2rem', marginBottom: '1rem' }}>1. Collecte des données</h2>
          <p style={{ marginBottom: '1rem' }}>
            Nous collectons les données nécessaires au bon fonctionnement de votre espace ERP. Cela inclut les informations de votre entreprise, vos produits, vos clients et vos transactions financières saisies dans l'application.
          </p>

          <h2 style={{ color: 'var(--color-text)', marginTop: '2rem', marginBottom: '1rem' }}>2. Utilisation de vos données</h2>
          <p style={{ marginBottom: '1rem' }}>
            Vos données sont exclusivement utilisées pour fournir nos services, générer vos tableaux de bord et gérer vos activités. Nous ne revendons en aucun cas vos données à des tiers, y compris vos listes de clients ou vos historiques de vente.
          </p>

          <h2 style={{ color: 'var(--color-text)', marginTop: '2rem', marginBottom: '1rem' }}>3. Sécurité</h2>
          <p style={{ marginBottom: '1rem' }}>
            La sécurité de vos données est notre priorité. Toutes les communications entre votre navigateur et nos serveurs sont chiffrées via SSL/TLS. Les données sensibles (comme les mots de passe) sont stockées sous forme de hash cryptographique.
          </p>

          <h2 style={{ color: 'var(--color-text)', marginTop: '2rem', marginBottom: '1rem' }}>4. Sauvegardes</h2>
          <p style={{ marginBottom: '1rem' }}>
            Des sauvegardes quotidiennes de la base de données sont effectuées automatiquement. En cas de défaillance matérielle de notre côté, nous sommes en mesure de restaurer vos informations afin de limiter toute perte de données.
          </p>

          <h2 style={{ color: 'var(--color-text)', marginTop: '2rem', marginBottom: '1rem' }}>5. Vos droits</h2>
          <p style={{ marginBottom: '1rem' }}>
            Conformément aux réglementations sur la protection des données (dont le RGPD ou les lois locales équivalentes), vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez exercer ce droit à tout moment en nous contactant.
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
