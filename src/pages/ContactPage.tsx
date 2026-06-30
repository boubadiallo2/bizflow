import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react';
import './LandingPage.css';

export const ContactPage: React.FC = () => {
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

      <main style={{ flex: 1, padding: '4rem 5%', maxWidth: '900px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--color-text)' }}>Contactez-nous</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem', marginBottom: '3rem' }}>
          Notre équipe est à votre disposition pour toute question technique ou commerciale.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', textAlign: 'left' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '10px', borderRadius: '50%', color: 'var(--color-primary)' }}>
                <Mail size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Email</h3>
            </div>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Support client & technique :</p>
            <a href="mailto:Boudiallo20@gmail.com" style={{ color: 'var(--color-primary)', fontWeight: 'bold', textDecoration: 'none' }}>Boudiallo20@gmail.com</a>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: 'var(--color-success-light)', padding: '10px', borderRadius: '50%', color: 'var(--color-success)' }}>
                <Phone size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Téléphone</h3>
            </div>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Du lundi au vendredi, de 9h à 18h :</p>
            <a href="tel:+221761439381" style={{ color: 'var(--color-success)', fontWeight: 'bold', textDecoration: 'none' }}>+221 76 143 93 81</a>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: 'var(--color-warning-light)', padding: '10px', borderRadius: '50%', color: 'var(--color-warning)' }}>
                <MapPin size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Adresse</h3>
            </div>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Siège social :</p>
            <span style={{ fontWeight: 'bold' }}>Dakar, Sénégal</span>
          </div>
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
