import React, { useState, useEffect } from 'react';
import { usersService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, UserPlus, Shield, User } from 'lucide-react';
import Swal from 'sweetalert2';

interface UserData {
  id: string | number;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
  createdAt: string;
}

export const Users: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { subscription, name: currentUserName } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Utilisateur',
    permissions: [] as string[]
  });

  const availableModules = [
    { id: '/dashboard', label: 'Tableau de bord', allowed: ['Starter', 'Business', 'Enterprise'] },
    { id: '/ventes', label: 'Ventes', allowed: ['Starter', 'Business', 'Enterprise'] },
    { id: '/devis', label: 'Devis', allowed: ['Business', 'Enterprise'] },
    { id: '/pos', label: 'Point de vente', allowed: ['Starter', 'Business', 'Enterprise'] },
    { id: '/facturation', label: 'Facturation', allowed: ['Business', 'Enterprise'] },
    { id: '/inventaire', label: 'Inventaire', allowed: ['Starter', 'Business', 'Enterprise'] },
    { id: '/clients', label: 'Clients', allowed: ['Starter', 'Business', 'Enterprise'] },
    { id: '/fournisseurs', label: 'Fournisseurs', allowed: ['Business', 'Enterprise'] },
    { id: '/rapports', label: 'Rapports', allowed: ['Business', 'Enterprise'] },
    { id: '/depenses', label: 'Dépenses', allowed: ['Enterprise'] },
    { id: '/abonnement', label: 'Abonnement', allowed: ['Starter', 'Business', 'Enterprise'] },
    { id: '/parametres', label: 'Paramètres', allowed: ['Starter', 'Business', 'Enterprise'] }
  ].filter(mod => mod.allowed.includes(subscription || 'Starter'));

  const fetchUsers = async () => {
    try {
      const data = await usersService.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Erreur lors du chargement des utilisateurs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'permissions') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        permissions: checked 
          ? [...prev.permissions, value] 
          : prev.permissions.filter(p => p !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await usersService.add(formData);
      Swal.fire('Succès', 'Utilisateur créé avec succès', 'success');
      setFormData({ name: '', email: '', password: '', role: 'Utilisateur', permissions: [] });
      fetchUsers();
    } catch (err: any) {
      Swal.fire('Erreur', err.message || 'Impossible de créer l\'utilisateur', 'error');
    }
  };

  const handleDeleteUser = async (id: string | number, userName: string) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Voulez-vous vraiment supprimer l'utilisateur ${userName} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#d33',
    });

    if (result.isConfirmed) {
      try {
        await usersService.remove(id);
        Swal.fire('Supprimé !', 'L\'utilisateur a été supprimé.', 'success');
        fetchUsers();
      } catch (err: any) {
        Swal.fire('Erreur', err.message || 'Impossible de supprimer l\'utilisateur', 'error');
      }
    }
  };

  const getUserLimit = () => {
    if (subscription === 'Business') return 5;
    if (subscription === 'Enterprise') return Infinity;
    return 1;
  };

  const limit = getUserLimit();
  const canAddMore = users.length < limit;

  if (loading) return <div className="p-4" style={{ padding: '2rem' }}>Chargement des utilisateurs...</div>;

  return (
    <div className="users-page">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-text)' }}>Gestion des Utilisateurs</h1>
          <p className="page-subtitle" style={{ color: 'var(--color-text-muted)' }}>
            Gérez les accès à votre espace. ({users.length} {users.length > 1 ? 'utilisateurs' : 'utilisateur'} sur {limit === Infinity ? 'illimité' : limit})
          </p>
        </div>
      </div>

      <div className="users-content" style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div className="users-list-card" style={{ flex: '1 1 60%', minWidth: '300px' }}>
          <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Liste des utilisateurs</h2>
          <div className="users-grid" style={{ display: 'grid', gap: '1rem' }}>
            {users.map(user => (
              <div key={user.id} className="user-card" style={{ display: 'flex', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div className="user-icon" style={{ padding: '1rem', backgroundColor: 'var(--color-background)', borderRadius: '50%', marginRight: '1rem' }}>
                  {user.role === 'Admin' ? <Shield size={24} className="text-primary" /> : <User size={24} className="text-secondary" />}
                </div>
                <div className="user-info" style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{user.name}</h3>
                  <p style={{ margin: '0.2rem 0', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{user.email}</p>
                  <span className={`role-badge ${user.role === 'Admin' ? 'admin' : 'user'}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '1rem', backgroundColor: user.role === 'Admin' ? 'rgba(var(--color-primary-rgb), 0.1)' : 'rgba(var(--color-secondary-rgb), 0.1)', color: user.role === 'Admin' ? 'var(--color-primary)' : 'var(--color-secondary)' }}>
                    {user.role}
                  </span>
                  {user.role === 'Utilisateur' && user.permissions && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {user.permissions.map((p: string) => (
                        <span key={p} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', backgroundColor: '#e2e8f0', color: '#475569', borderRadius: '4px' }}>
                          {availableModules.find(m => m.id === p)?.label || p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {user.name !== currentUserName && (
                  <button className="btn-icon btn-delete" onClick={() => handleDeleteUser(user.id, user.name)} title="Supprimer" style={{ padding: '0.5rem', color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="add-user-card" style={{ flex: '1 1 30%', minWidth: '280px', backgroundColor: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', alignSelf: 'flex-start' }}>
          <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserPlus size={20} className="text-primary" />
            Ajouter un utilisateur
          </h2>
          {!canAddMore ? (
            <div className="alert-limit" style={{ padding: '1rem', backgroundColor: 'rgba(var(--color-error-rgb), 0.1)', color: 'var(--color-error)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
              <p style={{ margin: 0 }}>Vous avez atteint la limite d'utilisateurs pour votre abonnement {subscription}.</p>
              <p style={{ margin: '0.5rem 0 0 0' }}>Veuillez passer au forfait supérieur pour en ajouter d'autres.</p>
            </div>
          ) : (
            <form onSubmit={handleAddUser} className="add-user-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>Nom complet</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Ex: Jean Dupont" className="form-input" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }} />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="jean@entreprise.com" className="form-input" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }} />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>Mot de passe</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" className="form-input" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }} />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>Rôle</label>
                <select name="role" value={formData.role} onChange={handleChange} className="form-input" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
                  <option value="Utilisateur">Utilisateur standard</option>
                  <option value="Admin">Administrateur</option>
                </select>
              </div>
              
              {formData.role === 'Utilisateur' && (
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>Accès aux modules :</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {availableModules.map(mod => (
                      <label key={mod.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                        <input
                          type="checkbox"
                          name="permissions"
                          value={mod.id}
                          checked={formData.permissions.includes(mod.id)}
                          onChange={handleChange}
                        />
                        {mod.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', fontSize: '1rem', fontWeight: '500' }}>Créer l'utilisateur</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
