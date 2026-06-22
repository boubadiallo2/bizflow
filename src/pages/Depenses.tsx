import React, { useState, useEffect } from 'react';
import { Wallet, Plus, X, Lock, FileText } from 'lucide-react';
import { Button } from '../components/Button';
import { expensesService, settingsService } from '../services/apiService';
import { showConfirm, showSuccess, showError } from '../utils/notifications';
import './Depenses.css';

interface ExpenseItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export const Depenses: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: 'Salaires'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const settings = await settingsService.get();
        if (settings?.subscription === 'Enterprise') {
          setIsEnterprise(true);
          const data = await expensesService.getAll();
          setExpenses(data as ExpenseItem[]);
        }
      } catch (error) {
        console.error('Erreur chargement dépenses:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const openNewModal = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      category: 'Salaires'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await expensesService.add({
        ...formData,
        amount: Number(formData.amount)
      });
      showSuccess('Dépense enregistrée avec succès');
      
      const updated = await expensesService.getAll();
      setExpenses(updated as ExpenseItem[]);
      setIsModalOpen(false);
    } catch (e) {
      showError('Erreur lors de l\'enregistrement de la dépense');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm('Êtes-vous sûr de vouloir supprimer cette dépense ?');
    if (confirmed) {
      try {
        await expensesService.remove(id);
        const updated = await expensesService.getAll();
        setExpenses(updated as ExpenseItem[]);
        showSuccess('Dépense supprimée');
      } catch (e) {
        showError('Erreur lors de la suppression');
      }
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Chargement...</div>;
  }

  if (!isEnterprise) {
    return (
      <div className="depenses-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center' }}>
        <div style={{ backgroundColor: 'var(--color-bg)', padding: '32px', borderRadius: 'var(--radius-lg)', maxWidth: '500px', border: '1px solid var(--color-border)' }}>
          <Lock size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Fonctionnalité Verrouillée</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
            La gestion avancée des dépenses et le calcul du bénéfice net sont des fonctionnalités exclusives au plan <strong>Enterprise</strong>.
          </p>
          <Button variant="primary" onClick={() => window.location.href = '/app/abonnement'}>
            Mettre à niveau mon abonnement
          </Button>
        </div>
      </div>
    );
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="depenses-container">
      <div className="depenses-header">
        <div>
          <h2>Gestion des Dépenses</h2>
          <p className="text-muted text-sm mt-1">Suivez vos charges pour un calcul exact du bénéfice net</p>
        </div>
        <Button variant="primary" onClick={openNewModal} icon={<Plus size={18} />}>Nouvelle dépense</Button>
      </div>

      <div className="depenses-grid">
        <div className="depenses-card">
          <div className="depenses-icon-wrapper" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)' }}>
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-muted text-sm" style={{ marginBottom: '4px' }}>Total des dépenses</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalExpenses.toLocaleString('fr-FR')} F</h3>
          </div>
        </div>
        <div className="depenses-card">
          <div className="depenses-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <FileText size={24} />
          </div>
          <div>
            <p className="text-muted text-sm" style={{ marginBottom: '4px' }}>Nombre d'enregistrements</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{expenses.length}</h3>
          </div>
        </div>
      </div>

      <div className="depenses-table-container">
        <table className="depenses-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Catégorie</th>
              <th>Description</th>
              <th>Montant</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
                  Aucune dépense enregistrée pour le moment.
                </td>
              </tr>
            ) : (
              expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => (
                <tr key={expense.id}>
                  <td>{new Date(expense.date).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <span style={{ padding: '4px 8px', borderRadius: '12px', backgroundColor: 'var(--color-bg)', fontSize: '0.85rem', fontWeight: 500 }}>
                      {expense.category}
                    </span>
                  </td>
                  <td>{expense.description}</td>
                  <td style={{ fontWeight: 'bold', color: 'var(--color-danger)' }}>
                    - {expense.amount.toLocaleString('fr-FR')} F
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(expense.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px' }}
                      title="Supprimer"
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Enregistrer une dépense</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Date de la dépense *</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    required 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Catégorie *</label>
                  <select 
                    className="form-select" 
                    required 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Salaires">Salaires</option>
                    <option value="Loyer">Loyer</option>
                    <option value="Électricité / Eau">Électricité / Eau</option>
                    <option value="Internet / Téléphone">Internet / Téléphone</option>
                    <option value="Fournitures de bureau">Fournitures de bureau</option>
                    <option value="Transport / Carburant">Transport / Carburant</option>
                    <option value="Marketing / Publicité">Marketing / Publicité</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    required 
                    placeholder="Ex: Salaire de l'assistant de vente"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Montant (FCFA) *</label>
                  <input 
                    type="number" 
                    min="1" 
                    className="form-input" 
                    required 
                    placeholder="Ex: 50000"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Annuler</Button>
                <Button type="submit" variant="primary">Enregistrer</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
