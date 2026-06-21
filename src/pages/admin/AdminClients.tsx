import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Store, XCircle } from 'lucide-react';
import './AdminClients.css';

interface Locataire {
  id: string;
  name: string;
  owner: string;
  email: string;
  sector: string;
  joinDate: string;
  lastLogin: string;
  transactions: number;
  status: 'Actif' | 'Bloqué';
}

const mockLocataires: Locataire[] = [
  { id: 'L-101', name: 'Sow Électronique', owner: 'Amina Sow', email: 'amina.sow@example.com', sector: 'Électronique / Informatique', joinDate: '12/01/2026', lastLogin: 'Il y a 2h', transactions: 1245, status: 'Actif' },
  { id: 'L-102', name: 'Bamba Supermarché', owner: 'Cheikh Bamba', email: 'contact@bambasuper.sn', sector: 'Alimentation / Supermarché', joinDate: '05/03/2026', lastLogin: 'Hier', transactions: 8530, status: 'Actif' },
  { id: 'L-103', name: 'Ndiaye Pharmacie', owner: 'Fatou Ndiaye', email: 'pharmacie.ndiaye@gmail.com', sector: 'Pharmacie', joinDate: '22/04/2026', lastLogin: 'Il y a 5h', transactions: 420, status: 'Actif' },
  { id: 'L-104', name: 'Kante Quincaillerie', owner: 'Moussa Kante', email: 'kante.quin@hotmail.com', sector: 'Quincaillerie', joinDate: '15/05/2026', lastLogin: 'Il y a 10 jours', transactions: 56, status: 'Bloqué' },
];

export const AdminClients: React.FC = () => {
  const [locataires, setLocataires] = useState<Locataire[]>(mockLocataires);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const [selectedLocataire, setSelectedLocataire] = useState<Locataire | null>(null);

  useEffect(() => {
    const userCommerceType = localStorage.getItem('userCommerceType') || 'Autre';
    setLocataires([
      {
        id: 'L-CURRENT',
        name: `Mon ${userCommerceType}`,
        owner: 'Boubacar Diallo (Moi)',
        email: 'boudiallo20@gmail.com',
        sector: userCommerceType,
        joinDate: 'Aujourd\'hui',
        lastLogin: 'À l\'instant',
        transactions: 12,
        status: 'Actif'
      },
      ...mockLocataires
    ]);
  }, []);

  const handleToggleStatus = (id: string) => {
    setLocataires(locataires.map(loc => {
      if (loc.id === id) {
        return {
          ...loc,
          status: loc.status === 'Actif' ? 'Bloqué' : 'Actif'
        };
      }
      return loc;
    }));
    setActiveActionMenu(null);
  };

  const filteredLocataires = locataires.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          loc.owner.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (activeFilter === 'Actifs') matchesFilter = loc.status === 'Actif';
    if (activeFilter === 'Bloqués') matchesFilter = loc.status === 'Bloqué';

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="admin-clients-container">
      <div className="admin-page-header">
        <div>
          <h1>Clients & Locataires</h1>
          <p>Supervisez tous les commerces utilisant BizFlow.</p>
        </div>
        <div className="metrics-badge">
          <div className="metric-item">
            <span className="metric-value">{locataires.length}</span>
            <span className="metric-label">Locataires Inscrits</span>
          </div>
          <div className="metric-divider"></div>
          <div className="metric-item">
            <span className="metric-value" style={{ color: 'var(--color-success)' }}>
              {locataires.filter(l => l.status === 'Actif').length}
            </span>
            <span className="metric-label">Actifs</span>
          </div>
        </div>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-toolbar">
          <div className="admin-search-wrapper">
            <Search size={18} className="search-icon text-muted" />
            <input 
              type="text" 
              placeholder="Rechercher par commerce ou propriétaire..." 
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
                {['Tous', 'Actifs', 'Bloqués'].map(f => (
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
                <th>Secteur</th>
                <th>Inscription</th>
                <th>Transactions</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLocataires.length > 0 ? filteredLocataires.map(loc => (
                <tr key={loc.id}>
                  <td>
                    <div className="tenant-info">
                      <span className="tenant-name">{loc.name}</span>
                      <span className="tenant-owner">{loc.owner}</span>
                    </div>
                  </td>
                  <td>
                    <span className="sector-badge">
                      <Store size={12} style={{ marginRight: '4px' }} />
                      {loc.sector}
                    </span>
                  </td>
                  <td className="date-cell">{loc.joinDate}</td>
                  <td className="metric-cell">{loc.transactions.toLocaleString('fr-FR')}</td>
                  <td>
                    <span className={`status-badge ${loc.status === 'Actif' ? 'actif' : 'suspendu'}`}>
                      {loc.status}
                    </span>
                  </td>
                  <td style={{ position: 'relative' }}>
                    <button 
                      className="action-btn"
                      onClick={() => setActiveActionMenu(activeActionMenu === loc.id ? null : loc.id)}
                    >
                      <MoreVertical size={18} />
                    </button>
                    {activeActionMenu === loc.id && (
                      <div className="admin-action-dropdown">
                        <div className="admin-action-item" onClick={() => { setSelectedLocataire(loc); setActiveActionMenu(null); }}>Voir détails</div>
                        <div className="admin-action-item" onClick={() => { window.location.href = `mailto:${loc.email}`; setActiveActionMenu(null); }}>Contacter</div>
                        <div className="admin-action-item danger" onClick={() => handleToggleStatus(loc.id)}>
                          {loc.status === 'Actif' ? 'Bloquer l\'accès' : 'Débloquer'}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>
                    Aucun commerce trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Détails du locataire */}
      {selectedLocataire && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, color: 'var(--color-text)' }}>{selectedLocataire.name}</h3>
                <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{selectedLocataire.owner}</p>
              </div>
              <button onClick={() => setSelectedLocataire(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}>
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Email</span>
                  <span style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: '0.9rem' }}>{selectedLocataire.email}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Secteur</span>
                  <span style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: '0.9rem' }}>{selectedLocataire.sector}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Inscription</span>
                  <span style={{ fontWeight: 500, color: 'var(--color-text)', fontSize: '0.9rem' }}>{selectedLocataire.joinDate}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Statut Global</span>
                  <span className={`status-badge ${selectedLocataire.status === 'Actif' ? 'actif' : 'suspendu'}`} style={{ display: 'inline-flex' }}>
                    {selectedLocataire.status}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: 'var(--color-text)' }}>Activité</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Transactions totales</span>
                  <span style={{ fontWeight: 600 }}>{selectedLocataire.transactions.toLocaleString('fr-FR')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Dernière connexion</span>
                  <span style={{ fontWeight: 500 }}>{selectedLocataire.lastLogin}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              <button 
                onClick={() => setSelectedLocataire(null)} 
                style={{ padding: '8px 16px', backgroundColor: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500 }}
              >
                Fermer
              </button>
              <button 
                onClick={() => { window.location.href = `mailto:${selectedLocataire.email}`; setSelectedLocataire(null); }}
                style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 500 }}
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
