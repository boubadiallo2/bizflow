import React, { useState } from 'react';
import { Save, CreditCard, Shield, Globe, Bell, Server } from 'lucide-react';
import { Button } from '../../components/Button';
import './AdminSettings.css';

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tarification');
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Mock settings state
  const [settings, setSettings] = useState({
    monthlyPrice: 15000,
    annualPrice: 150000,
    trialDays: 14,
    waveApiKey: 'wave_live_xxxxxxxxxxxxx',
    orangeApiKey: 'om_live_xxxxxxxxxxxxx',
    maintenanceMode: false,
    platformName: 'Nexora',
    supportEmail: 'support@nexora.sn',
    // Notifications
    notifyNewRegistration: true,
    notifyFailedPayment: true,
    notifyWeeklyReport: false,
    notifyTransactionLimit: true,
    // Security
    require2FA: true,
    sessionTimeout: 60,
    passwordExpiryDays: 90
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 800);
  };

  return (
    <div className="admin-settings-container">
      <div className="admin-page-header">
        <div>
          <h1>Paramètres Globaux</h1>
          <p>Configurez les réglages principaux de la plateforme Nexora.</p>
        </div>
        <Button 
          variant="primary" 
          icon={<Save size={18} />} 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </div>

      <div className="admin-settings-layout">
        <div className="admin-settings-sidebar">
          <button 
            className={`settings-tab ${activeTab === 'tarification' ? 'active' : ''}`}
            onClick={() => setActiveTab('tarification')}
          >
            <CreditCard size={18} /> Tarification & Plans
          </button>
          <button 
            className={`settings-tab ${activeTab === 'paiements' ? 'active' : ''}`}
            onClick={() => setActiveTab('paiements')}
          >
            <Globe size={18} /> Passerelles de paiement
          </button>
          <button 
            className={`settings-tab ${activeTab === 'systeme' ? 'active' : ''}`}
            onClick={() => setActiveTab('systeme')}
          >
            <Server size={18} /> Système & Maintenance
          </button>
          <button 
            className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={18} /> Notifications
          </button>
          <button 
            className={`settings-tab ${activeTab === 'securite' ? 'active' : ''}`}
            onClick={() => setActiveTab('securite')}
          >
            <Shield size={18} /> Sécurité
          </button>
        </div>

        <div className="admin-settings-content">
          {activeTab === 'tarification' && (
            <div className="settings-section">
              <h2 className="section-title">Tarification & Plans</h2>
              <p className="section-desc">Gérez les prix affichés sur la page d'abonnement des locataires.</p>

              <div className="settings-card">
                <h3>Plan Pro</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Prix Mensuel (FCFA)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      name="monthlyPrice"
                      value={settings.monthlyPrice}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Prix Annuel (FCFA)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      name="annualPrice"
                      value={settings.annualPrice}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Jours d'essai gratuit</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      name="trialDays"
                      value={settings.trialDays}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'paiements' && (
            <div className="settings-section">
              <h2 className="section-title">Passerelles de paiement</h2>
              <p className="section-desc">Configurez les clés API pour le prélèvement des abonnements.</p>

              <div className="settings-card">
                <h3>Intégration Mobile Money</h3>
                <div className="form-group">
                  <label>Clé Secrète Wave API</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    name="waveApiKey"
                    value={settings.waveApiKey}
                    onChange={handleChange}
                  />
                  <p className="help-text">Utilisée pour débiter les abonnements via Wave.</p>
                </div>
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>Clé Secrète Orange Money API</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    name="orangeApiKey"
                    value={settings.orangeApiKey}
                    onChange={handleChange}
                  />
                  <p className="help-text">Utilisée pour débiter les abonnements via Orange Money.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'systeme' && (
            <div className="settings-section">
              <h2 className="section-title">Système & Maintenance</h2>
              <p className="section-desc">Gérez l'état global de la plateforme ERP.</p>

              <div className="settings-card">
                <h3>Identité</h3>
                <div className="form-group">
                  <label>Nom de la plateforme</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    name="platformName"
                    value={settings.platformName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>Email du support technique</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    name="supportEmail"
                    value={settings.supportEmail}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="settings-card danger-zone" style={{ marginTop: '24px' }}>
                <h3 style={{ color: 'var(--color-danger)' }}>Mode Maintenance</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                  En activant ce mode, aucun locataire ne pourra accéder à son espace. Seuls les super administrateurs pourront se connecter.
                </p>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                  />
                  <span className="slider"></span>
                  <span className="toggle-label">Activer le mode maintenance</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2 className="section-title">Notifications Administrateur</h2>
              <p className="section-desc">Choisissez les événements pour lesquels vous souhaitez recevoir une alerte par email.</p>

              <div className="settings-card">
                <h3>Alertes Email</h3>
                
                <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--color-text)' }}>Nouvelle inscription</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Recevoir un email lorsqu'un nouveau locataire crée un compte.</span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" name="notifyNewRegistration" checked={settings.notifyNewRegistration} onChange={handleChange} />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--color-text)' }}>Paiement échoué</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Être alerté si le prélèvement d'un abonnement Pro échoue.</span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" name="notifyFailedPayment" checked={settings.notifyFailedPayment} onChange={handleChange} />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--color-text)' }}>Limite de transactions (Plan Starter)</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Être notifié quand un locataire gratuit atteint 100 transactions/mois.</span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" name="notifyTransactionLimit" checked={settings.notifyTransactionLimit} onChange={handleChange} />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--color-text)' }}>Rapport Hebdomadaire</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Recevoir un résumé des KPIs (MRR, nouveaux inscrits) chaque lundi.</span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" name="notifyWeeklyReport" checked={settings.notifyWeeklyReport} onChange={handleChange} />
                    <span className="slider"></span>
                  </label>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'securite' && (
            <div className="settings-section">
              <h2 className="section-title">Sécurité du Tableau de Bord</h2>
              <p className="section-desc">Renforcez la sécurité de l'accès Super Administrateur.</p>

              <div className="settings-card">
                <h3>Authentification & Accès</h3>
                
                <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div>
                    <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--color-text)' }}>Double Authentification (2FA) Globale</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Forcer tous les comptes Super Admin à utiliser une application d'authentification.</span>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" name="require2FA" checked={settings.require2FA} onChange={handleChange} />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Expiration de session inactif (minutes)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      name="sessionTimeout"
                      value={settings.sessionTimeout}
                      onChange={handleChange}
                      min="5"
                    />
                    <p className="help-text">Déconnexion auto après X minutes d'inactivité.</p>
                  </div>
                  <div className="form-group">
                    <label>Renouvellement mot de passe (jours)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      name="passwordExpiryDays"
                      value={settings.passwordExpiryDays}
                      onChange={handleChange}
                      min="0"
                    />
                    <p className="help-text">Forcer le changement (0 = jamais).</p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          Paramètres enregistrés avec succès !
        </div>
      )}
    </div>
  );
};
