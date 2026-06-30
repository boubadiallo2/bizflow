import React, { useState, useEffect } from 'react';
import { Sprout, Check, Building2, Briefcase, Calendar, Crown, X, CheckCircle, CreditCard, Rocket } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { settingsService } from '../services/apiService';
import './Abonnement.css';

export const Abonnement: React.FC = () => {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState('Wave');
  const [showToast, setShowToast] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({ name: 'Chargement...', sector: 'Chargement...' });
  
  const [renewalDate, setRenewalDate] = useState('Calcul en cours...');
  const [plan, setPlan] = useState({
    name: 'Plan Starter',
    icon: <Sprout size={28} className="text-success" />,
    color: 'text-success',
    freq: 'Mensuel',
    features: ['Jusqu\'à 20 produits', '50 clients maximum', '100 transactions/mois', '1 utilisateur', 'POS basique', 'Rapports simples']
  });

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const data = await settingsService.get();
        if (data) {
          setCompanyInfo({
            name: data.name || 'Entreprise',
            sector: data.commerceType || 'Secteur non défini'
          });
        } else {
          setCompanyInfo({
            name: 'Entreprise',
            sector: 'Secteur non défini'
          });
        }
        if (data?.tenantCreatedAt) {
          const createdAt = new Date(data.tenantCreatedAt);
          const nextMonth = new Date(createdAt);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          setRenewalDate(nextMonth.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }));
        }

        const sub = data?.tenantSubscription || 'Starter';
        if (sub === 'Starter') {
          setPlan({
            name: 'Plan Starter',
            icon: <Sprout size={28} className="text-success" />,
            color: 'text-success',
            freq: 'Mensuel',
            features: ['Jusqu\'à 20 produits', '50 clients maximum', '100 transactions/mois', '1 utilisateur', 'POS basique', 'Rapports simples']
          });
        } else if (sub === 'Business') {
          setPlan({
            name: 'Plan Business',
            icon: <Rocket size={28} className="text-primary" />,
            color: 'text-primary',
            freq: 'Mensuel',
            features: ['Produits illimités', 'Clients illimités', 'Transactions illimitées', 'Multi-utilisateurs', 'POS avancé', 'Export PDF & Rapports complets']
          });
        } else if (sub === 'Enterprise') {
          setPlan({
            name: 'Plan Enterprise',
            icon: <Crown size={28} style={{ color: '#f59e0b' }} />,
            color: 'text-warning',
            freq: 'Mensuel',
            features: ['Toutes les fonctions Business', 'Gestion des Dépenses', 'Support Prioritaire', 'Sauvegardes Avancées']
          });
        }
      } catch (e) {
        console.error('Erreur chargement abonnement:', e);
        setCompanyInfo({
          name: 'Entreprise',
          sector: 'Secteur non défini'
        });
      }
    };
    loadSubscription();
  }, []);

  const handlePayment = async () => {
    // Simulate payment and save to Firebase
    await settingsService.save({ subscription: 'Business' });
    setPlan({
      name: 'Plan Business',
      icon: <Rocket size={28} className="text-primary" />,
      color: 'text-primary',
      freq: billingCycle === 'annual' ? 'Annuel (Payé)' : 'Mensuel (Payé)',
      features: ['Produits illimités', 'Clients illimités', 'Transactions illimitées', 'Multi-utilisateurs', 'POS avancé', 'Export PDF & Rapports complets']
    });
    setIsUpgradeModalOpen(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="abonnement-container">
      <h2>Mon Abonnement</h2>

      <Card className="plan-card">
        <div className="plan-header flex justify-between items-start">
          <div className="plan-title-area flex gap-4 items-center">
            <div className="plan-icon">
              {plan.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-muted text-sm mt-1">L'expérience complète pour votre PME</p>
            </div>
          </div>
          <div className={`status-badge ${plan.name === 'Plan Business' ? 'bg-primary-light text-primary' : ''}`}>
            <Check size={14} /> Actif
          </div>
        </div>

        <div className="plan-info-grid mt-6">
          <div className="info-item">
            <span className="info-label text-muted text-sm flex items-center gap-1">
              <Building2 size={14} /> Entreprise
            </span>
            <span className="info-value font-semibold">{companyInfo.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label text-muted text-sm flex items-center gap-1">
              <Briefcase size={14} /> Secteur
            </span>
            <span className="info-value font-semibold">{companyInfo.sector}</span>
          </div>
          <div className="info-item">
            <span className="info-label text-muted text-sm flex items-center gap-1">
              <Calendar size={14} /> Renouvellement
            </span>
            <span className="info-value font-semibold">{renewalDate}</span>
          </div>
          <div className="info-item">
            <span className="info-label text-muted text-sm flex items-center gap-1">
              <Crown size={14} /> Fréquence
            </span>
            <span className="info-value font-semibold">{plan.freq}</span>
          </div>
        </div>
      </Card>

      <Card className="features-card mt-6">
        <h4 className="font-semibold mb-4">Fonctionnalités incluses</h4>
        <div className="features-grid">
          {plan.features.map((feature, idx) => (
            <div key={idx} className="feature-item flex items-center gap-2 text-sm">
              <Check size={16} className={plan.color} />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </Card>

      {plan.name === 'Plan Starter' && (
        <Card className="upgrade-card mt-6 bg-primary-light border-primary">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold text-primary mb-1">Passez au plan Business</h4>
              <p className="text-sm text-muted">
                Débloquez l'export PDF, les rapports avancés et les transactions illimitées.
              </p>
            </div>
            <Button variant="primary" onClick={() => setIsUpgradeModalOpen(true)}>Upgrader → 10 000 FCFA/mois</Button>
          </div>
        </Card>
      )}

      {/* Upgrade Payment Modal */}
      {isUpgradeModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '450px' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Paiement de l'abonnement</h3>
              <button onClick={() => setIsUpgradeModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={20}/></button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div 
                  onClick={() => setBillingCycle('monthly')}
                  style={{ flex: 1, padding: '16px', border: `2px solid ${billingCycle === 'monthly' ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'center', backgroundColor: billingCycle === 'monthly' ? 'var(--color-primary-light)' : 'transparent' }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Mensuel</div>
                  <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>15 000 F</div>
                </div>
                <div 
                  onClick={() => setBillingCycle('annual')}
                  style={{ flex: 1, padding: '16px', border: `2px solid ${billingCycle === 'annual' ? 'var(--color-primary)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'center', backgroundColor: billingCycle === 'annual' ? 'var(--color-primary-light)' : 'transparent', position: 'relative' }}
                >
                  <div style={{ position: 'absolute', top: '-10px', right: '-10px', backgroundColor: 'var(--color-danger)', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>-4 mois !</div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Annuel</div>
                  <div style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>120 000 F</div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Méthode de paiement</label>
                <select 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Wave">Wave</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="Carte Bancaire">Carte Bancaire</option>
                </select>
              </div>

              {paymentMethod !== 'Carte Bancaire' ? (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Numéro de téléphone</label>
                  <input type="tel" placeholder="Ex: 77 123 45 67" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Numéro de carte</label>
                  <input type="text" placeholder="0000 0000 0000 0000" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <Button variant="secondary" onClick={() => setIsUpgradeModalOpen(false)} style={{ flex: 1 }}>Annuler</Button>
              <Button variant="primary" onClick={handlePayment} style={{ flex: 1, display: 'flex', justifyContent: 'center' }} icon={<CreditCard size={18}/>}>
                Payer {billingCycle === 'monthly' ? '15 000 F' : '120 000 F'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', backgroundColor: 'var(--color-surface)', padding: '16px', borderRadius: 'var(--radius-md)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', gap: '12px', alignItems: 'flex-start', zIndex: 1000, borderLeft: '4px solid var(--color-success)' }}>
          <CheckCircle size={20} style={{ color: 'var(--color-success)', marginTop: '2px' }} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--color-text)' }}>Paiement réussi</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Votre abonnement Business est maintenant actif !</p>
          </div>
        </div>
      )}
    </div>
  );
};
