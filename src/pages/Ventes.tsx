import React, { useState, useEffect, useMemo } from 'react';
import { Search, Columns, ArrowLeft, Plus, FileText, Receipt, Calendar, X } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { salesService } from '../services/apiService';
import './Ventes.css';

interface Sale {
  id: number;
  ticketId: string;
  date: string;
  amount: number;
  itemsCount: number;
  method: string;
  status: string;
  cartItems?: any[];
}

export const Ventes: React.FC = () => {
  const [viewMode, setViewMode] = useState<'liste' | 'kanban'>('liste');
  const [isCreating, setIsCreating] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    const loadSales = async () => {
      try {
        const data = await salesService.getAll();
        setSales(data as Sale[]);
      } catch (error) {
        console.error('Erreur chargement ventes:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSales();
  }, []);

  const filteredSales = useMemo(() => {
    let result = [...sales];
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(s => s.ticketId && s.ticketId.toLowerCase().includes(lower));
    }
    // Sort by date descending (most recent first)
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, searchQuery]);

  if (isCreating) {
    return (
      <div className="ventes-container">
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button onClick={() => setIsCreating(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text)' }}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Nouvelle commande</h2>
            <p className="text-muted text-sm mt-1">Créez une commande pour un client</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
          <Card>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontWeight: 600 }}>Client</h3>
            <select className="filter-select" style={{ width: '100%' }}>
              <option value="">Sélectionnez un client</option>
              <option value="1">Entreprise ABC</option>
            </select>
          </Card>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Produits</h3>
              <button style={{ padding: '6px 12px', fontSize: '0.875rem', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '6px', display: 'flex', gap: '4px', alignItems: 'center', cursor: 'pointer', fontWeight: 500 }}>
                <Plus size={16} /> Ajouter
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Produit</label>
                <select className="filter-select" style={{ width: '100%' }}>
                  <option value="">Choisir un produit</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Quantité</label>
                <input type="number" defaultValue="1" min="1" style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.95rem' }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Sous-total</label>
                <div style={{ fontWeight: 600, padding: '10px 0' }}>0 F</div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontWeight: 600 }}>Notes</h3>
            <textarea placeholder="Notes internes..." style={{ width: '100%', minHeight: '100px', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontFamily: 'inherit', resize: 'vertical' }}></textarea>
          </Card>

          <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
              <span>Sous-total HT</span>
              <span>0 F</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', color: 'var(--color-text-muted)' }}>
              <span>TVA (18%)</span>
              <span>0 F</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '1.25rem', fontWeight: 700 }}>
              <span>Total TTC</span>
              <span>0 F</span>
            </div>
            <Button variant="primary" onClick={() => setIsCreating(false)} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} icon={<FileText size={18} />}>Créer la commande</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ventes-container">
      <div className="page-header flex justify-between items-center">
        <div>
          <h2>Historique des ventes</h2>
          <p className="text-muted text-sm mt-1">{sales.length} transactions au total</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`view-toggle-btn ${viewMode === 'liste' ? 'active' : ''}`}
              onClick={() => setViewMode('liste')}
            >
              Liste
            </button>
            <button 
              className={`view-toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
              onClick={() => setViewMode('kanban')}
            >
              <Columns size={16} />
              Kanban
            </button>
          </div>
          <Button variant="primary" onClick={() => setIsCreating(true)}>+ Nouvelle commande</Button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon text-muted" />
          <input 
            type="text" 
            placeholder="Rechercher par n° de ticket..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="filter-select">
          <option value="all">Toutes les dates</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois-ci</option>
        </select>
      </div>

      {filteredSales.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrapper">
            <Receipt size={32} />
          </div>
          <h3>Aucune vente trouvée</h3>
          <p>Les transactions validées depuis la caisse s'afficheront ici.</p>
        </div>
      ) : (
        <div className="sales-table-wrapper">
          <table className="sales-table">
            <thead>
              <tr>
                <th>N° Ticket</th>
                <th>Date & Heure</th>
                <th>Articles</th>
                <th>Montant</th>
                <th>Paiement</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{sale.ticketId}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
                      {new Date(sale.date).toLocaleString('fr-FR', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td>
                    {sale.cartItems && sale.cartItems.length > 0 
                      ? sale.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
                      : sale.itemsCount} article(s)
                  </td>
                  <td style={{ fontWeight: 600 }}>{sale.amount.toLocaleString('fr-FR')} F</td>
                  <td>{sale.method}</td>
                  <td>
                    <span className="status-badge success">{sale.status}</span>
                  </td>
                  <td>
                    <Button variant="outline" onClick={() => setSelectedSale(sale)} style={{ padding: '4px 8px', fontSize: '0.85rem' }}>Détails</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sale Details Modal */}
      {selectedSale && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Détails du Ticket {selectedSale.ticketId}</h3>
              <button className="close-btn" onClick={() => setSelectedSale(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ margin: '4px 0', color: 'var(--color-text-muted)' }}>Date</p>
                  <p style={{ fontWeight: 500 }}>{new Date(selectedSale.date).toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <p style={{ margin: '4px 0', color: 'var(--color-text-muted)' }}>Paiement</p>
                  <p style={{ fontWeight: 500 }}>{selectedSale.method}</p>
                </div>
                <div>
                  <p style={{ margin: '4px 0', color: 'var(--color-text-muted)' }}>Montant Total</p>
                  <p style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{selectedSale.amount.toLocaleString('fr-FR')} F</p>
                </div>
              </div>
              
              <h4 style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>Articles vendus</h4>
              
              {selectedSale.cartItems && selectedSale.cartItems.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                        <th style={{ padding: '12px 8px', fontWeight: 500 }}>Produit</th>
                        <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 500 }}>Qté</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 500 }}>Prix unitaire</th>
                        <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 500 }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.cartItems.map((item: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px dashed var(--color-border)' }}>
                          <td style={{ padding: '12px 8px' }}>{item.productName || 'Produit inconnu'}</td>
                          <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                            <span style={{ backgroundColor: 'var(--color-bg-alt)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem' }}>
                              {item.quantity}
                            </span>
                          </td>
                          <td style={{ padding: '12px 8px', textAlign: 'right' }}>{(item.priceValue || 0).toLocaleString('fr-FR')} F</td>
                          <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 500 }}>{(item.quantity * (item.priceValue || 0)).toLocaleString('fr-FR')} F</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Aucun détail d'article disponible pour cette vente.</p>
                </div>
              )}
            </div>
            <div className="modal-footer" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => setSelectedSale(null)} style={{ marginLeft: 'auto' }}>Fermer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
