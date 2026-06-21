import React, { useState, useEffect, useMemo } from 'react';
import { Search, Phone, Mail, MapPin, X, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { clientsService } from '../services/apiService';
import './Clients.css';

interface ClientItem {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location: string;
  initial: string;
  debt: string | null;
}

const defaultClientsData = [
  { name: 'LAMINE SOUANE', phone: '77 777 00 04', location: 'KOLDA', initial: 'L', debt: null },
  { name: 'Awa Ba', phone: '+221 77 444 55 66', email: 'awa.ba@email.com', location: 'Ouakam, Dakar', initial: 'A', debt: '15 000 F' },
  { name: 'Ibrahima Ndiaye', phone: '+221 78 333 44 55', location: 'Parcelles Assainies', initial: 'I', debt: null },
  { name: 'Amadou Diallo', phone: '+221 77 111 22 33', email: 'amadou@email.com', location: 'Plateau, Dakar', initial: 'A', debt: null },
  { name: 'Mariama Sow', phone: '+221 76 222 33 44', location: 'Almadies, Dakar', initial: 'M', debt: '25 000 F' },
];

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', location: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await clientsService.getAll();
        if (data.length === 0) {
          for (const item of defaultClientsData) {
            await clientsService.add(item);
          }
          const seeded = await clientsService.getAll();
          setClients(seeded as ClientItem[]);
        } else {
          setClients(data as ClientItem[]);
        }
      } catch (error) {
        console.error('Erreur chargement clients:', error);
      } finally {
        setLoading(false);
      }
    };
    loadClients();
  }, []);

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ name: '', phone: '', email: '', location: '' });
    setIsModalOpen(true);
  };

  const handleEditClick = (c: ClientItem) => {
    setEditingId(c.id);
    setFormData({ name: c.name, phone: c.phone, email: c.email || '', location: c.location });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      await clientsService.remove(id);
      const updated = await clientsService.getAll();
      setClients(updated as ClientItem[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId !== null) {
      await clientsService.update(editingId, {
        ...formData,
        initial: formData.name.charAt(0).toUpperCase()
      });
    } else {
      await clientsService.add({
        ...formData,
        initial: formData.name.charAt(0).toUpperCase(),
        debt: null
      });
    }
    const updated = await clientsService.getAll();
    setClients(updated as ClientItem[]);
    setIsModalOpen(false);
  };

  const filteredClients = useMemo(() => {
    if (!searchQuery) return clients;
    const lowerQuery = searchQuery.toLowerCase();
    return clients.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) || 
      c.phone.toLowerCase().includes(lowerQuery) ||
      c.location.toLowerCase().includes(lowerQuery)
    );
  }, [clients, searchQuery]);

  if (loading) {
    return (
      <div className="clients-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: 'var(--color-text-muted)' }}>
          Chargement des clients...
        </div>
      </div>
    );
  }

  return (
    <div className="clients-container">
      <div className="page-header flex justify-between items-center">
        <div>
          <h2>Clients</h2>
          <p className="text-muted text-sm mt-1">{clients.length} clients</p>
        </div>
        <Button variant="primary" onClick={openNewModal}>+ Nouveau client</Button>
      </div>

      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon text-muted" />
          <input 
            type="text" 
            placeholder="Rechercher par nom, téléphone, adresse..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="clients-grid">
        {filteredClients.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>
            Aucun client trouvé.
          </div>
        ) : (
          filteredClients.map(client => (
            <Card key={client.id} className="client-card interactive">
              <div className="client-card-actions">
                <button className="client-action-btn" title="Modifier" onClick={() => handleEditClick(client)}>
                  <Edit2 size={16} />
                </button>
                <button className="client-action-btn delete" title="Supprimer" onClick={() => handleDelete(client.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="client-header">
              <div className="client-avatar">
                {client.initial}
              </div>
              <div className="client-info-main">
                <h3 className="client-name">{client.name}</h3>
                {client.debt && <span className="client-debt">Doit: {client.debt}</span>}
              </div>
            </div>
            
            <div className="client-details mt-4">
              <div className="detail-row text-muted text-sm">
                <Phone size={14} />
                <span>{client.phone}</span>
              </div>
              {client.email && (
                <div className="detail-row text-muted text-sm">
                  <Mail size={14} />
                  <span>{client.email}</span>
                </div>
              )}
              <div className="detail-row text-muted text-sm">
                <MapPin size={14} />
                <span>{client.location}</span>
              </div>
            </div>
          </Card>
        ))
      )}
      </div>

      {/* Modal Nouveau Client */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingId ? 'Modifier le client' : 'Nouveau client'}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nom *</label>
                  <input type="text" className="form-input" required placeholder="Ex: Entreprise ABC ou Amadou Diallo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Téléphone *</label>
                  <input 
                    type="tel" 
                    className="form-input" 
                    required
                    placeholder="Ex: 77 123 45 67" 
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="form-input" placeholder="Ex: contact@entreprise.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Adresse *</label>
                  <input type="text" className="form-input" required placeholder="Ex: Plateau, Dakar" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
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
