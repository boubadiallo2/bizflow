import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, platformSettingsService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import { 
  ShoppingCart, BarChart2, Package, CheckCircle2,
  LayoutGrid, Monitor, FileText, Users, Truck, PieChart, Settings, CreditCard
} from 'lucide-react';
import './LandingPage.css';

const myModules = [
  { path: '/dashboard', icon: LayoutGrid, label: 'Tableau de bord', gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', iconColor: '#fff' },
  { path: '/ventes', icon: ShoppingCart, label: 'Ventes', gradient: 'linear-gradient(135deg, #f59e0b, #ea580c)', iconColor: '#fff' },
  { path: '/pos', icon: Monitor, label: 'Point de vente', gradient: 'linear-gradient(135deg, #ec4899, #db2777)', iconColor: '#fff' },
  { path: '/facturation', icon: FileText, label: 'Facturation', gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', iconColor: '#fff' },
  { path: '/inventaire', icon: Package, label: 'Inventaire', gradient: 'linear-gradient(135deg, #10b981, #059669)', iconColor: '#fff' },
  { path: '/clients', icon: Users, label: 'Clients', gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)', iconColor: '#fff' },
  { path: '/fournisseurs', icon: Truck, label: 'Fournisseurs', gradient: 'linear-gradient(135deg, #64748b, #475569)', iconColor: '#fff' },
  { path: '/rapports', icon: PieChart, label: 'Rapports', gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)', iconColor: '#fff' },
  { path: '/abonnement', icon: CreditCard, label: 'Abonnements', gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)', iconColor: '#fff' },
  { path: '/parametres', icon: Settings, label: 'Paramètres', gradient: 'linear-gradient(135deg, #94a3b8, #475569)', iconColor: '#fff' },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [isDemoLoading, setIsDemoLoading] = React.useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [prices, setPrices] = useState({
    starterPriceMonthly: 5000,
    starterPriceYearly: 50000,
    businessPriceMonthly: 10000,
    businessPriceYearly: 80000,
    enterprisePriceMonthly: 25000,
    enterprisePriceYearly: 250000
  });

  useEffect(() => {
    platformSettingsService.getPublic()
      .then(data => {
        if (data) {
          setPrices({
            starterPriceMonthly: data.starterPriceMonthly || 5000,
            starterPriceYearly: data.starterPriceYearly || 50000,
            businessPriceMonthly: data.businessPriceMonthly || 10000,
            businessPriceYearly: data.businessPriceYearly || 80000,
            enterprisePriceMonthly: data.enterprisePriceMonthly || 25000,
            enterprisePriceYearly: data.enterprisePriceYearly || 250000
          });
        }
      })
      .catch(console.error);
  }, []);

  const handleDemoLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDemoLoading(true);
    try {
      const data = await authService.login({ email: 'demo@nexora.sn', password: 'demo' });
      login(data.token, data.role, data.tenantId, data.name, data.subscription, data.permissions);
      navigate('/app');
    } catch (err: any) {
      Swal.fire('Erreur', 'Impossible de se connecter au compte de démonstration.', 'error');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-navbar">
        <div className="landing-brand">
          <img src="/logo.png" alt="Nexora Logo" style={{ height: '40px' }} />
          <h1>Nexora</h1>
        </div>
        <div className="landing-nav-links">
          <a href="#modules" className="landing-nav-link">Modules</a>
          <a href="#features" className="landing-nav-link">Fonctionnalités</a>
          <a href="#pricing" className="landing-nav-link">Tarifs</a>
          <a href="#about" className="landing-nav-link">À propos</a>
        </div>
        <div className="landing-auth-buttons">
          <Link to="/login" className="btn-login">Connexion</Link>
          <button onClick={handleDemoLogin} disabled={isDemoLoading} className="btn-hero btn-hero-primary" style={{ padding: '10px 20px', fontSize: '0.95rem', border: 'none', cursor: 'pointer' }}>
            {isDemoLoading ? 'Chargement...' : 'Démo en direct'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Gérez. Automatisez. <span>Développez.</span></h1>
        <p className="hero-subtitle">
          Tout votre business, sur une seule plateforme.
        </p>
        <div className="hero-cta">
          <Link to="/login" className="btn-hero btn-hero-primary">Accéder au Dashboard</Link>
          <a href="#features" className="btn-hero btn-hero-secondary">Découvrir les avantages</a>
        </div>


      </section>

      {/* Modules Section (NEW) */}
      <section id="modules" className="modules-section">
        <h2 className="section-title">Nos Différents Modules</h2>
        <p className="section-subtitle">Découvrez l'ensemble des outils puissants à votre disposition pour gérer chaque aspect de votre entreprise.</p>
        
        <div className="odoo-apps-grid-wrapper">
          <div className="odoo-apps-grid">
            {myModules.map((mod, idx) => (
              <div key={idx} className="odoo-app-card">
                <div className="odoo-app-icon-container">
                  <div className="odoo-app-icon-inner" style={{ background: mod.gradient }}>
                     <mod.icon size={36} color={mod.iconColor} strokeWidth={1.5} />
                  </div>
                </div>
                <span className="odoo-app-label">{mod.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Moyens de paiement */}
      <section style={{ padding: '2rem 5%', backgroundColor: 'var(--color-surface)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontWeight: 500 }}>
          Moyens de paiement acceptés et sécurisés
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ backgroundColor: '#13B1E6', color: 'white', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
            Wave
          </div>
          <div style={{ backgroundColor: '#FF6600', color: 'black', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
            Orange Money
          </div>
          <div style={{ backgroundColor: '#E2001A', color: 'white', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
            Free Money
          </div>
          <div style={{ backgroundColor: '#1A1F71', color: 'white', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', fontStyle: 'italic' }}>
            VISA
          </div>
          <div style={{ backgroundColor: '#21125E', color: 'white', padding: '8px 20px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#EB001B', marginRight: '4px' }}>●</span><span style={{ color: '#F79E1B' }}>●</span> Mastercard
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">Tout ce dont vous avez besoin</h2>
        <p className="section-subtitle">Une suite d'outils puissants pour développer votre activité commerciale.</p>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <ShoppingCart size={28} />
            </div>
            <h3 className="feature-title">Point de Vente (POS)</h3>
            <p className="feature-description">
              Encaissez vos clients rapidement avec notre interface POS optimisée. Gérez les paiements et éditez des tickets de caisse en quelques clics.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <Package size={28} />
            </div>
            <h3 className="feature-title">Gestion d'Inventaire</h3>
            <p className="feature-description">
              Suivez votre stock en temps réel. Recevez des alertes de stock bas et gérez vos approvisionnements fournisseurs simplement.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <BarChart2 size={28} />
            </div>
            <h3 className="feature-title">Rapports & Analyses</h3>
            <p className="feature-description">
              Prenez de meilleures décisions grâce à nos tableaux de bord détaillés sur vos ventes, vos clients et vos performances financières.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <h2 className="section-title">Des tarifs simples et transparents</h2>
        <p className="section-subtitle">Choisissez le plan qui correspond à la taille de votre entreprise.</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
          <span style={{ fontWeight: !isYearly ? '600' : '400', color: !isYearly ? 'var(--color-primary)' : 'var(--text-secondary)' }}>Mensuel</span>
          <div 
            style={{ 
              width: '60px', 
              height: '32px', 
              backgroundColor: 'var(--color-primary)', 
              borderRadius: '16px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onClick={() => setIsYearly(!isYearly)}
          >
            <div style={{
              width: '26px',
              height: '26px',
              backgroundColor: 'white',
              borderRadius: '50%',
              position: 'absolute',
              top: '3px',
              left: isYearly ? '31px' : '3px',
              transition: 'left 0.3s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </div>
          <span style={{ fontWeight: isYearly ? '600' : '400', color: isYearly ? 'var(--color-primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Annuel <span style={{ backgroundColor: '#10b981', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>-20%</span>
          </span>
        </div>

        <div className="pricing-grid">
          {/* Starter Plan */}
          <div className="pricing-card">
            <div className="pricing-header">
              <h3 className="pricing-title">Starter</h3>
              <div className="pricing-price" style={{ fontSize: '2.5rem' }}>
                {isYearly ? prices.starterPriceYearly.toLocaleString('fr-FR') : prices.starterPriceMonthly.toLocaleString('fr-FR')} <span>FCFA / {isYearly ? 'an' : 'mois'}</span>
              </div>
              <p className="text-muted mt-2">Pour les petites boutiques</p>
            </div>
            <div className="pricing-features">
              <div className="pricing-feature">
                <CheckCircle2 size={20} className="pricing-feature-icon" />
                <span>1 utilisateur</span>
              </div>
              <div className="pricing-feature">
                <CheckCircle2 size={20} className="pricing-feature-icon" />
                <span>100 produits</span>
              </div>
              <div className="pricing-feature">
                <CheckCircle2 size={20} className="pricing-feature-icon" />
                <span>500 transactions/mois</span>
              </div>
            </div>
            <Link to="/register?plan=Starter" className="btn-hero btn-hero-secondary" style={{ width: '100%', display: 'block', textAlign: 'center', boxSizing: 'border-box' }}>
              S'abonner
            </Link>
          </div>

          {/* Business Plan */}
          <div className="pricing-card popular">
            <div className="popular-badge">Recommandé</div>
            <div className="pricing-header">
              <h3 className="pricing-title">Business</h3>
              <div className="pricing-price" style={{ fontSize: '2.5rem' }}>
                {isYearly ? prices.businessPriceYearly.toLocaleString('fr-FR') : prices.businessPriceMonthly.toLocaleString('fr-FR')} <span>FCFA / {isYearly ? 'an' : 'mois'}</span>
              </div>
              {!isYearly && <p className="text-muted mt-2" style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>Ou {prices.businessPriceYearly.toLocaleString('fr-FR')} FCFA / an</p>}
            </div>
            <div className="pricing-features">
              <div className="pricing-feature">
                <CheckCircle2 size={20} className="pricing-feature-icon" />
                <span>5 utilisateurs</span>
              </div>
              <div className="pricing-feature">
                <CheckCircle2 size={20} className="pricing-feature-icon" />
                <span>Produits illimités</span>
              </div>
              <div className="pricing-feature">
                <CheckCircle2 size={20} className="pricing-feature-icon" />
                <span>Rapports avancés</span>
              </div>
              <div className="pricing-feature">
                <CheckCircle2 size={20} className="pricing-feature-icon" />
                <span>Export PDF & Devis</span>
              </div>
            </div>
            <Link to="/register?plan=Business" className="btn-hero btn-hero-primary" style={{ width: '100%', display: 'block', textAlign: 'center', boxSizing: 'border-box' }}>
              S'abonner
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="pricing-card">
            <div className="pricing-header">
              <h3 className="pricing-title">Enterprise</h3>
              <div className="pricing-price" style={{ fontSize: '2.5rem' }}>
                {isYearly ? prices.enterprisePriceYearly.toLocaleString('fr-FR') : prices.enterprisePriceMonthly.toLocaleString('fr-FR')} <span>FCFA / {isYearly ? 'an' : 'mois'}</span>
              </div>
              <p className="text-muted mt-2">Pour les grandes entreprises</p>
            </div>
            <div className="pricing-features">
              <div className="pricing-feature">
                <CheckCircle2 size={20} className="pricing-feature-icon" />
                <span>Utilisateurs illimités</span>
              </div>
              <div className="pricing-feature">
                <CheckCircle2 size={20} className="pricing-feature-icon" />
                <span>Multi-boutiques</span>
              </div>
              <div className="pricing-feature">
                <CheckCircle2 size={20} className="pricing-feature-icon" />
                <span>Support prioritaire</span>
              </div>
              <div className="pricing-feature">
                <CheckCircle2 size={20} className="pricing-feature-icon" />
                <span>Accès API</span>
              </div>
            </div>
            <Link to="/register?plan=Enterprise" className="btn-hero btn-hero-secondary" style={{ width: '100%', display: 'block', textAlign: 'center', boxSizing: 'border-box' }}>
              S'abonner
            </Link>
          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src="/logo.png" alt="Nexora" style={{ height: '32px' }} />
          </div>
          <div className="footer-links">
            <Link to="/terms">Conditions générales</Link>
            <Link to="/privacy">Confidentialité</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} Nexora ERP. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
};
