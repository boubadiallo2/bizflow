import React, { useState, useEffect } from 'react';
import { Store, MapPin, Phone, User, Plus, Edit2, Trash2, X } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { storesService } from '../services/apiService';
import './Boutiques.css';

export const Boutiques: React.FC = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
    manager: '',
    status: 'Actif'
  });

  const loadStores = async () => {
    setIsLoading(true);
    try {
      const data = await storesService.getAll();
      setStores(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des boutiques', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const openModal = (store?: any) => {
    if (store) {
      setEditingStore(store);
      setFormData({
        name: store.name || '',
        location: store.location || '',
        phone: store.phone || '',
        manager: store.manager || '',
        status: store.status || 'Actif'
      });
    } else {
      setEditingStore(null);
      setFormData({
        name: '',
        location: '',
        phone: '',
        manager: '',
        status: 'Actif'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStore(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStore) {
        await storesService.update(editingStore.id, formData);
      } else {
        await storesService.add(formData);
      }
      closeModal();
      loadStores();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la boutique', error);
      alert('Une erreur est survenue.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette boutique ?')) {
      try {
        await storesService.remove(id);
        loadStores();
      } catch (error) {
        console.error('Erreur lors de la suppression de la boutique', error);
        alert('Une erreur est survenue.');
      }
    }
  };

  return (
    <div className="boutiques-container">
      <div className="boutiques-header">
        <div>
          <h2>Mes Boutiques</h2>
          <p className="text-muted mt-1">Gérez vos différentes succursales et points de vente.</p>
        </div>
        <Button variant="primary" onClick={() => openModal()} icon={<Plus size={18} />}>
          Ajouter une boutique
        </Button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Chargement...</div>
      ) : stores.length === 0 ? (
        <Card className="text-center py-12">
          <Store size={48} className="mx-auto text-muted mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Aucune boutique</h3>
          <p className="text-muted mb-6">Vous n'avez pas encore ajouté de boutique secondaire.</p>
          <Button variant="primary" onClick={() => openModal()}>Ajouter votre première boutique</Button>
        </Card>
      ) : (
        <div className="boutiques-grid">
          {stores.map(store => (
            <Card key={store.id} className="boutique-card">
              <div className="flex justify-between items-start mb-4">
                <div className="boutique-icon-wrapper">
                  <Store size={24} />
                </div>
                <div className={`status-badge ${store.status === 'Actif' ? 'bg-success-light text-success' : 'bg-warning-light text-warning'}`}>
                  {store.status}
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-4">{store.name}</h3>
              
              <div className="boutique-info">
                {store.location && (
                  <div className="boutique-info-item">
                    <MapPin size={16} />
                    <span>{store.location}</span>
                  </div>
                )}
                {store.phone && (
                  <div className="boutique-info-item">
                    <Phone size={16} />
                    <span>{store.phone}</span>
                  </div>
                )}
                {store.manager && (
                  <div className="boutique-info-item">
                    <User size={16} />
                    <span>Gérant: {store.manager}</span>
                  </div>
                )}
              </div>
              
              <div className="boutique-actions">
                <Button variant="outline" onClick={() => openModal(store)} className="text-primary hover:bg-primary-light p-2">
                  <Edit2 size={16} />
                </Button>
                <Button variant="outline" onClick={() => handleDelete(store.id)} className="text-danger hover:bg-danger-light p-2">
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingStore ? 'Modifier la boutique' : 'Nouvelle boutique'}</h3>
              <button onClick={closeModal} className="close-btn" type="button">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Nom de la boutique *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                  placeholder="Ex: Boutique Dakar Plateau"
                />
              </div>
              
              <div className="form-group">
                <label>Localisation / Adresse</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ex: 123 Rue de la Paix"
                />
              </div>
              
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ex: +221 77 123 45 67"
                />
              </div>
              
              <div className="form-group">
                <label>Gérant</label>
                <input
                  type="text"
                  name="manager"
                  value={formData.manager}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Ex: Moussa Diop"
                />
              </div>
              
              <div className="form-group">
                <label>Statut</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                  <option value="En travaux">En travaux</option>
                </select>
              </div>
              
              <div className="modal-footer">
                <Button variant="secondary" type="button" onClick={closeModal}>Annuler</Button>
                <Button variant="primary" type="submit">Enregistrer</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
