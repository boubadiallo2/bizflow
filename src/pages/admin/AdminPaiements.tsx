import React, { useState, useEffect } from 'react';
import { Search, Plus, Download, Receipt, Building2 } from 'lucide-react';
import { adminPaymentsService, adminTenantsService } from '../../services/apiService';
import { generateSubscriptionInvoice } from '../../utils/invoiceGenerator';
import Swal from 'sweetalert2';

export const AdminPaiements: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    tenantId: '',
    amount: '',
    month: '',
    paymentMethod: 'Wave'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, tenantsData] = await Promise.all([
        adminPaymentsService.getAll(),
        adminTenantsService.getAll()
      ]);
      setPayments(paymentsData);
      setTenants(tenantsData);
    } catch (error) {
      console.error('Failed to load data', error);
      Swal.fire('Erreur', 'Impossible de charger les données.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownload = (payment: any) => {
    generateSubscriptionInvoice(payment);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenantId || !formData.amount || !formData.month) {
      return Swal.fire('Erreur', 'Veuillez remplir tous les champs.', 'warning');
    }

    try {
      await adminPaymentsService.add({
        ...formData,
        amount: parseInt(formData.amount, 10)
      });
      Swal.fire('Succès', 'Paiement enregistré avec succès', 'success');
      setShowModal(false);
      setFormData({ tenantId: '', amount: '', month: '', paymentMethod: 'Wave' });
      loadData();
    } catch (error) {
      console.error(error);
      Swal.fire('Erreur', "Erreur lors de l'enregistrement", 'error');
    }
  };

  const filteredPayments = payments.filter(p => 
    p.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.month.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMonths = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ].map(m => `${m} ${new Date().getFullYear()}`);

  return (
    <div className="admin-abonnements-container">
      <div className="admin-header-actions">
        <div>
          <h1 style={{ margin: 0, color: '#1e293b', fontSize: '24px' }}>Paiements & Factures</h1>
          <p style={{ margin: '5px 0 0', color: '#64748b' }}>Gérez les paiements des abonnements et générez les factures.</p>
        </div>
        <button className="admin-btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>Enregistrer un paiement</span>
        </button>
      </div>

      <div className="admin-table-controls">
        <div className="admin-search-box">
          <Search size={18} color="#64748b" />
          <input 
            type="text" 
            placeholder="Rechercher une facture ou un client..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-container">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Chargement des paiements...</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>N° Facture</th>
                <th>Client</th>
                <th>Mois</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Méthode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                    Aucun paiement trouvé
                  </td>
                </tr>
              ) : (
                filteredPayments.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Receipt size={16} color="#3b82f6" />
                        <span style={{ fontWeight: '500', color: '#1e293b' }}>{p.invoiceNumber}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={16} color="#64748b" />
                        <span>{p.tenantName}</span>
                      </div>
                    </td>
                    <td><span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{p.month}</span></td>
                    <td>{new Date(p.date).toLocaleDateString('fr-FR')}</td>
                    <td style={{ fontWeight: 'bold' }}>{p.amount.toLocaleString('fr-FR')} F</td>
                    <td>{p.paymentMethod}</td>
                    <td>
                      <button 
                        onClick={() => handleDownload(p)}
                        style={{ 
                          background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', 
                          padding: '6px 12px', borderRadius: '4px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '500'
                        }}
                      >
                        <Download size={14} />
                        Facture
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '500px' }}>
            <div className="admin-modal-header">
              <h2>Enregistrer un paiement</h2>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal-body">
              <div className="admin-form-group">
                <label>Client (Tenant)</label>
                <select 
                  required
                  value={formData.tenantId} 
                  onChange={(e) => {
                    const tid = e.target.value;
                    const tenant = tenants.find(t => t.id.toString() === tid);
                    // Pré-remplir le montant selon l'abonnement
                    let amount = '5000';
                    if (tenant) {
                      if (tenant.subscription === 'Business' || tenant.subscription === 'Pro') amount = '10000';
                      if (tenant.subscription === 'Enterprise') amount = '25000';
                      if (tenant.subscriptionCycle === 'annual') amount = (parseInt(amount) * 10).toString();
                    }
                    setFormData({...formData, tenantId: tid, amount});
                  }}
                  className="admin-form-input"
                >
                  <option value="">Sélectionnez un client...</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.subscription})</option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label>Mois de facturation</label>
                <select 
                  required
                  value={formData.month} 
                  onChange={(e) => setFormData({...formData, month: e.target.value})}
                  className="admin-form-input"
                >
                  <option value="">Sélectionnez un mois...</option>
                  {currentMonths.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <option value="Année complète">Année complète</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Montant (F CFA)</label>
                <input 
                  type="number" 
                  required
                  value={formData.amount} 
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="admin-form-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Méthode de paiement</label>
                <select 
                  value={formData.paymentMethod} 
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="admin-form-input"
                >
                  <option value="Wave">Wave</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="Espèces">Espèces</option>
                  <option value="Virement Bancaire">Virement Bancaire</option>
                  <option value="Chèque">Chèque</option>
                </select>
              </div>

              <div className="admin-form-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="admin-btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
