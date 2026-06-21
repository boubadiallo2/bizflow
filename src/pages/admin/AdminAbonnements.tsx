import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import './AdminAbonnements.css';

import { adminTenantsService } from '../../services/apiService';

interface TenantSub {
  id: number;
  name: string;
  ownerName?: string;
  email?: string;
  subscription: 'Starter' | 'Pro';
  status: 'Actif' | 'Suspendu';
  amount?: number;
  nextBilling?: string;
}

export const AdminAbonnements: React.FC = () => {
  const [subs, setSubs] = useState<TenantSub[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeActionMenu, setActiveActionMenu] = useState<number | null>(null);
  const [selectedTenantDetails, setSelectedTenantDetails] = useState<TenantSub | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      const data = await adminTenantsService.getAll();
      setSubs(data.map((t: any) => ({
        ...t,
        amount: t.subscription === 'Pro' ? 15000 : 0,
        nextBilling: t.subscription === 'Pro' ? 'Mensuel' : 'Jamais',
        ownerName: 'Propriétaire', // Ideally we'd join with the users table or settings
        email: 'contact@' + t.name.replace(/\s+/g, '').toLowerCase() + '.com'
      })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleStatus = async (id: number) => {
    const sub = subs.find(s => s.id === id);
    if (!sub) return;
    
    try {
      const newStatus = sub.status === 'Actif' ? 'Suspendu' : 'Actif';
      await adminTenantsService.updateStatus(id, newStatus);
      await loadTenants();
    } catch (e) {
      console.error(e);
    }
    setActiveActionMenu(null);
  };

  const filteredSubs = subs.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (activeFilter === 'Pro') matchesFilter = sub.subscription === 'Pro';
    if (activeFilter === 'Starter') matchesFilter = sub.subscription === 'Starter';
    if (activeFilter === 'Actifs') matchesFilter = sub.status === 'Actif';
    if (activeFilter === 'Suspendus') matchesFilter = sub.status === 'Suspendu';

    return matchesSearch && matchesFilter;
  });

  const totalMRR = subs.filter(s => s.status === 'Actif').reduce((sum, s) => sum + (s.amount || 0), 0);

  return (
    <div className="admin-abonnements-container">
      <div className="admin-page-header">
        <div>
          <h1>Abonnements & MRR</h1>
          <p>Gérez les souscriptions et suivez les revenus récurrents.</p>
        </div>
        <div className="mrr-badge">
          <span className="mrr-label">MRR Total</span>
          <span className="mrr-value">{totalMRR.toLocaleString('fr-FR')} F</span>
        </div>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-toolbar">
          <div className="admin-search-wrapper">
            <Search size={18} className="search-icon text-muted" />
            <input 
              type="text" 
              placeholder="Rechercher une entreprise..." 
              className="admin-search-input" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <button className="admin-filter-btn" onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <Filter size={18} /> {activeFilter !== 'Tous' ? `Filtre: ${activeFilter}` : 'Filtrer'}
            </button>
            {isFilterOpen && (
              <div className="admin-filter-dropdown">
                {['Tous', 'Pro', 'Starter', 'Actifs', 'Suspendus'].map(f => (
                  <div 
                    key={f} 
                    className={`admin-filter-option ${activeFilter === f ? 'selected' : ''}`}
                    onClick={() => { setActiveFilter(f); setIsFilterOpen(false); }}
                  >
                    {f}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Entreprise</th>
                <th>Plan</th>
                <th>Statut</th>
                <th>MRR</th>
                <th>Prochaine Facture</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.length > 0 ? filteredSubs.map(sub => (
                <tr key={sub.id}>
                  <td>
                    <div className="tenant-info">
                      <span className="tenant-name">{sub.name}</span>
                      <span className="tenant-owner">{sub.ownerName}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`plan-badge ${sub.subscription.toLowerCase()}`}>{sub.subscription}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${sub.status.toLowerCase()}`}>
                      {sub.status === 'Actif' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {sub.status}
                    </span>
                  </td>
                  <td className="mrr-cell">{(sub.amount && sub.amount > 0) ? `${sub.amount.toLocaleString('fr-FR')} F` : '-'}</td>
                  <td className="billing-cell">{sub.nextBilling}</td>
                  <td style={{ position: 'relative' }}>
                    <button 
                      className="action-btn"
                      onClick={() => setActiveActionMenu(activeActionMenu === sub.id ? null : sub.id)}
                    >
                      <MoreVertical size={18} />
                    </button>
                    {activeActionMenu === sub.id && (
                      <div className="admin-action-dropdown">
                        <div className="admin-action-item" onClick={() => { setSelectedTenantDetails(sub); setActiveActionMenu(null); }}>Voir détails</div>
                        <div className="admin-action-item" onClick={() => { window.location.href = `mailto:${sub.email}`; setActiveActionMenu(null); }}>Contacter</div>
                        <div className="admin-action-item danger" onClick={() => handleToggleStatus(sub.id)}>
                          {sub.status === 'Actif' ? 'Suspendre' : 'Activer'}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    Aucune entreprise trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Détails du locataire */}
      {selectedTenantDetails && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'var(--color-text)' }}>{selectedTenantDetails.name}</h3>
                <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{selectedTenantDetails.ownerName}</p>
              </div>
              <button onClick={() => setSelectedTenantDetails(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}>
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Email</span>
                  <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{selectedTenantDetails.email}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>ID Tenant</span>
                  <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{selectedTenantDetails.id}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Plan Actuel</span>
                  <span className={`plan-badge ${selectedTenantDetails.subscription.toLowerCase()}`} style={{ display: 'inline-block' }}>{selectedTenantDetails.subscription}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Statut</span>
                  <span className={`status-badge ${selectedTenantDetails.status.toLowerCase()}`} style={{ display: 'inline-flex' }}>
                    {selectedTenantDetails.status === 'Actif' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {selectedTenantDetails.status}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--color-text)' }}>Informations de facturation</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Montant MRR</span>
                  <span style={{ fontWeight: 600 }}>{(selectedTenantDetails.amount && selectedTenantDetails.amount > 0) ? `${selectedTenantDetails.amount.toLocaleString('fr-FR')} F / mois` : 'Gratuit'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Prochaine facture</span>
                  <span style={{ fontWeight: 500 }}>{selectedTenantDetails.nextBilling}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <button 
                onClick={() => setSelectedTenantDetails(null)} 
                style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500 }}
              >
                Fermer
              </button>
              <button 
                onClick={() => { window.location.href = `mailto:${selectedTenantDetails.email}`; setSelectedTenantDetails(null); }}
                style={{ padding: '8px 16px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500 }}
              >
                Envoyer un email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
