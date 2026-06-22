import React, { useState, useEffect, useMemo } from 'react';
import { Search, Truck, Phone, MapPin, Package, X, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { suppliersService } from '../services/apiService';
import { showConfirm } from '../utils/notifications';
import './Fournisseurs.css';

interface FournisseurItem {
  id: string;
  name: string;
  phone: string;
  location: string;
  products: string;
}

const defaultFournisseursData = [
  { name: 'Patisen SA', phone: '+221 33 849 50 50', location: 'Zone Industrielle, Dakar', products: 'Bouillons, épices, condiments' },
  { name: 'Soboa', phone: '+221 33 839 33 33', location: 'Km 7, Route de Rufisque', products: 'Boissons, jus, eau minérale' },
  { name: 'Grossiste Sandaga', phone: '+221 77 888 99 00', location: 'Marché Sandaga, Dakar', products: 'Riz, huile, sucre, farine' },
];

export const Fournisseurs: React.FC = () => {
  const [fournisseurs, setFournisseurs] = useState<FournisseurItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', location: '', products: '' });
  const [, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await suppliersService.getAll();
        if (data.length === 0) {
          for (const item of defaultFournisseursData) {
            await suppliersService.add(item);
          }
          const seeded = await suppliersService.getAll();
          setFournisseurs(seeded as FournisseurItem[]);
        } else {
          setFournisseurs(data as FournisseurItem[]);
        }
      } catch (error) {
        console.error('Erreur chargement fournisseurs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ name: '', phone: '', location: '', products: '' });
    setIsModalOpen(true);
  };

  const handleEditClick = (f: FournisseurItem) => {
    setEditingId(f.id);
    setFormData({ name: f.name, phone: f.phone, location: f.location, products: f.products });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?");
    if (confirmed) {
      await suppliersService.remove(id);
      const updated = await suppliersService.getAll();
      setFournisseurs(updated as FournisseurItem[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId !== null) {
      await suppliersService.update(editingId, formData);
    } else {
      await suppliersService.add(formData);
    }
    const updated = await suppliersService.getAll();
    setFournisseurs(updated as FournisseurItem[]);
    setIsModalOpen(false);
  };

  const filteredFournisseurs = useMemo(() => {
    if (!searchQuery) return fournisseurs;
    const lowerQuery = searchQuery.toLowerCase();
    return fournisseurs.filter(f => 
      f.name.toLowerCase().includes(lowerQuery) || 
      f.products.toLowerCase().includes(lowerQuery) ||
      f.location.toLowerCase().includes(lowerQuery)
    );
  }, [fournisseurs, searchQuery]);

  return (
    <div className="fournisseurs-container">
      <div className="fournisseurs-header">
        <div>
          <h2>Fournisseurs</h2>
          <p className="text-muted text-sm mt-1">{fournisseurs.length} fournisseurs</p>
        </div>
        <Button variant="primary" onClick={openNewModal}>+ Nouveau fournisseur</Button>
      </div>

      <div className="fournisseurs-search">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, adresse, produit..." 
            className="search-input-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="fournisseurs-grid">
        {filteredFournisseurs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>
            Aucun fournisseur trouvé.
          </div>
        ) : (
          filteredFournisseurs.map((fournisseur) => (
            <div key={fournisseur.id} className="fournisseur-card">
              <div className="fournisseur-card-actions">
                <button className="fournisseur-action-btn" title="Modifier" onClick={() => handleEditClick(fournisseur)}>
                  <Edit2 size={16} />
                </button>
                <button className="fournisseur-action-btn delete" title="Supprimer" onClick={() => handleDelete(fournisseur.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="fournisseur-card-header">
                <div className="fournisseur-icon-wrapper">
                  <Truck size={24} />
                </div>
                <div className="fournisseur-name">{fournisseur.name}</div>
              </div>
            
            <div className="fournisseur-details">
              <div className="fournisseur-detail-row">
                <Phone size={16} className="fournisseur-detail-icon" />
                <span>{fournisseur.phone}</span>
              </div>
              <div className="fournisseur-detail-row">
                <MapPin size={16} className="fournisseur-detail-icon" />
                <span>{fournisseur.location}</span>
              </div>
              <div className="fournisseur-detail-row">
                <Package size={16} className="fournisseur-detail-icon" />
                <span>{fournisseur.products}</span>
              </div>
            </div>
          </div>
        ))
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingId ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nom *</label>
                  <input type="text" className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Téléphone *</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    required
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Adresse *</label>
                  <input type="text" className="form-input" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Produits fournis *</label>
                  <textarea 
                    className="form-input" 
                    placeholder="Riz, huile, sucre..." 
                    required
                    value={formData.products}
                    onChange={e => setFormData({...formData, products: e.target.value})}
                    style={{ minHeight: '80px', resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} style={{ border: '1px solid var(--color-border)', backgroundColor: 'transparent' }}>Annuler</Button>
                <Button type="submit" variant="primary">{editingId ? 'Enregistrer' : 'Créer'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
