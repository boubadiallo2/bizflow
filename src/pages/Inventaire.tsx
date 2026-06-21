import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowDown, ArrowUp, Package, AlertTriangle, DollarSign, X, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { productsService } from '../services/apiService';
import './Inventaire.css';

interface ProductItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  achat: string;
  vente: string;
  priceValue?: number;
  imageUrl?: string;
}


export const Inventaire: React.FC = () => {
  const [activeTab, setActiveTab] = useState('produits');
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockModalType, setStockModalType] = useState<'in' | 'out'>('in');
  
  // Form state
  const [newProduct, setNewProduct] = useState({ name: '', category: '', vente: '', achat: '', stock: 0, minStock: 5, imageUrl: '' });
  const [stockMovement, setStockMovement] = useState({ productId: '', quantity: 0 });
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load from Firebase
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productsService.getAll();
        setProducts(data as ProductItem[]);
      } catch (error) {
        console.error('Erreur chargement produits:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      if (editingProductId !== null) {
        // Edit mode
        await productsService.update(editingProductId, {
          name: newProduct.name,
          category: newProduct.category || 'divers',
          stock: Number(newProduct.stock),
          minStock: Number(newProduct.minStock),
          achat: newProduct.achat ? `${newProduct.achat} F` : '0 F',
          vente: newProduct.vente ? `${newProduct.vente} F` : '0 F',
          priceValue: Number(newProduct.vente) || 0,
          imageUrl: newProduct.imageUrl
        });
      } else {
        // Add mode
        await productsService.add({
          name: newProduct.name,
          category: newProduct.category || 'divers',
          unit: 'pièce',
          stock: Number(newProduct.stock),
          minStock: Number(newProduct.minStock),
          achat: newProduct.achat ? `${newProduct.achat} F` : '0 F',
          vente: newProduct.vente ? `${newProduct.vente} F` : '0 F',
          priceValue: Number(newProduct.vente) || 0,
          imageUrl: newProduct.imageUrl
        });
      }
      
      // Refresh from Firebase
      const updated = await productsService.getAll();
      setProducts(updated as ProductItem[]);
      
      setIsProductModalOpen(false);
      setNewProduct({ name: '', category: '', vente: '', achat: '', stock: 0, minStock: 5, imageUrl: '' });
      setEditingProductId(null);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du produit :", error);
      alert("Une erreur est survenue lors de la sauvegarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openNewProductModal = () => {
    setEditingProductId(null);
    setNewProduct({ name: '', category: '', vente: '', achat: '', stock: 0, minStock: 5, imageUrl: '' });
    setIsProductModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({...newProduct, imageUrl: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = (product: ProductItem) => {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      category: product.category,
      vente: product.priceValue?.toString() || product.vente.replace(/\D/g, ''),
      achat: product.achat.replace(/\D/g, ''),
      stock: product.stock,
      minStock: product.minStock,
      imageUrl: product.imageUrl || ''
    });
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      await productsService.remove(id);
      const updated = await productsService.getAll();
      setProducts(updated as ProductItem[]);
    }
  };

  const handleStockMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockMovement.productId || stockMovement.quantity <= 0) return;
    
    const product = products.find(p => p.id === stockMovement.productId);
    if (product) {
      const newStock = stockModalType === 'in' 
        ? product.stock + Number(stockMovement.quantity) 
        : Math.max(0, product.stock - Number(stockMovement.quantity));
      
      await productsService.update(product.id, { stock: newStock });
      const updated = await productsService.getAll();
      setProducts(updated as ProductItem[]);
    }
    
    setIsStockModalOpen(false);
    setStockMovement({ productId: '', quantity: 0 });
  };

  const openStockModal = (type: 'in' | 'out') => {
    setStockModalType(type);
    setIsStockModalOpen(true);
  };

  // Derived state
  const alertsCount = products.filter(p => p.stock <= p.minStock).length;
  const totalValue = products.reduce((sum, p) => sum + (p.priceValue || parseInt(p.vente.replace(/\D/g,'')) || 0) * p.stock, 0);

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (activeTab === 'alertes') {
      filtered = filtered.filter(p => p.stock <= p.minStock);
    } else if (activeTab === 'mouvements') {
      return [];
    }
    
    if (searchQuery) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  }, [products, activeTab, searchQuery]);

  if (loading) {
    return (
      <div className="inventaire-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: 'var(--color-text-muted)' }}>
          Chargement des produits...
        </div>
      </div>
    );
  }

  return (
    <div className="inventaire-container">
      <div className="page-header flex justify-between items-center">
        <div>
          <h2>Inventaire</h2>
          <p className="text-muted text-sm mt-1">{products.length} produits au total</p>
        </div>
        <div className="header-actions">
          <Button variant="secondary" icon={<ArrowDown size={16} />} onClick={() => openStockModal('in')}>
            Entrée stock
          </Button>
          <Button variant="secondary" icon={<ArrowUp size={16} />} onClick={() => openStockModal('out')}>
            Sortie stock
          </Button>
          <Button variant="primary" onClick={openNewProductModal}>+ Nouveau produit</Button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card success">
          <div className="stat-content">
            <h3>Total Produits</h3>
            <div className="stat-value">{products.length}</div>
          </div>
          <div className="stat-icon-wrapper">
            <Package size={24} />
          </div>
        </div>
        
        <div className="stat-card danger">
          <div className="stat-content">
            <h3>Alertes Stock</h3>
            <div className="stat-value">{alertsCount}</div>
          </div>
          <div className="stat-icon-wrapper">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-content">
            <h3>Valorisation Stock</h3>
            <div className="stat-value">{totalValue.toLocaleString('fr-FR')} F</div>
          </div>
          <div className="stat-icon-wrapper">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'produits' ? 'active' : ''}`}
          onClick={() => setActiveTab('produits')}
        >
          Produits
        </button>
        <button 
          className={`tab-btn ${activeTab === 'alertes' ? 'active' : ''}`}
          onClick={() => setActiveTab('alertes')}
        >
          Alertes ({alertsCount})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'mouvements' ? 'active' : ''}`}
          onClick={() => setActiveTab('mouvements')}
        >
          Mouvements
        </button>
      </div>

      <div className="search-bar-full">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Rechercher un produit..." 
            className="search-input-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="inventory-grid">
        {activeTab === 'mouvements' ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>
            Aucun historique de mouvement disponible.
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', gridColumn: '1 / -1' }}>
            Aucun produit trouvé.
          </div>
        ) : (
          filteredProducts.map((item) => {
            const stockPercent = Math.min(100, (item.stock / 100) * 100);
            const isLowStock = item.stock <= item.minStock;
            
            return (
              <div key={item.id} className="inventory-card">
                <div className="inv-card-actions">
                  <button className="inv-action-btn" title="Modifier" onClick={() => handleEditClick(item)}>
                    <Edit2 size={16} />
                  </button>
                  <button className="inv-action-btn delete" title="Supprimer" onClick={() => handleDeleteProduct(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
                {item.imageUrl && (
                  <div style={{ width: '100%', height: '140px', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                    <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div className="inv-card-header">
                  <div className="inv-product-name">{item.name}</div>
                  <div className="inv-product-category">{item.category} • {item.unit}</div>
                </div>
                
                <div className="inv-stock-info">
                  <div className={`inv-stock-text ${isLowStock ? 'text-danger' : ''}`}>
                    Stock: {item.stock} <span>/ min. {item.minStock}</span>
                  </div>
                  <div className="inv-stock-bar-bg">
                    <div 
                      className="inv-stock-bar-fill" 
                      style={{ width: `${stockPercent}%`, backgroundColor: isLowStock ? 'var(--color-danger)' : 'var(--color-primary)' }}
                    ></div>
                  </div>
                </div>
                
                <div className="inv-card-footer">
                  <div className="inv-price-achat">Achat: {item.achat}</div>
                  <div className="inv-price-vente">Vente: {item.vente}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Nouveau/Édition Produit */}
      {isProductModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{editingProductId ? 'Modifier le produit' : 'Nouveau Produit'}</h3>
              <button className="close-btn" onClick={() => setIsProductModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Nom du produit</label>
                  <input type="text" className="form-input" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Ex: T-shirt blanc" />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Catégorie</label>
                  <input type="text" className="form-input" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} placeholder="Ex: textile" />
                </div>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Photo du produit</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {newProduct.imageUrl && (
                      <img src={newProduct.imageUrl} alt="Aperçu" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                    )}
                    <input type="file" accept="image/*" className="form-input" onChange={handleImageUpload} style={{ padding: '6px' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label>Prix d'achat (FCFA)</label>
                    <input type="number" className="form-input" required value={newProduct.achat} onChange={e => setNewProduct({...newProduct, achat: e.target.value})} placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label>Prix de vente (FCFA)</label>
                    <input type="number" className="form-input" required value={newProduct.vente} onChange={e => setNewProduct({...newProduct, vente: e.target.value})} placeholder="0" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Stock initial</label>
                    <input type="number" className="form-input" required value={newProduct.stock || ''} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} placeholder="0" />
                  </div>
                  <div className="form-group">
                    <label>Stock minimum d'alerte</label>
                    <input type="number" className="form-input" required value={newProduct.minStock || ''} onChange={e => setNewProduct({...newProduct, minStock: Number(e.target.value)})} placeholder="5" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <Button type="button" variant="secondary" onClick={() => setIsProductModalOpen(false)}>Annuler</Button>
                <Button type="submit" variant="primary">{editingProductId ? 'Enregistrer' : 'Ajouter'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Mouvement de Stock */}
      {isStockModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>{stockModalType === 'in' ? 'Entrée de Stock' : 'Sortie de Stock'}</h3>
              <button className="close-btn" onClick={() => setIsStockModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleStockMovement}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Produit</label>
                  <select className="form-input" required value={stockMovement.productId} onChange={e => setStockMovement({...stockMovement, productId: e.target.value})}>
                    <option value="" disabled>Sélectionnez un produit</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Stock actuel: {p.stock})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantité à {stockModalType === 'in' ? 'ajouter' : 'retirer'}</label>
                  <input type="number" className="form-input" required min="1" value={stockMovement.quantity || ''} onChange={e => setStockMovement({...stockMovement, quantity: Number(e.target.value)})} placeholder="1" />
                </div>
              </div>
              <div className="modal-footer">
                <Button type="button" variant="secondary" onClick={() => setIsStockModalOpen(false)}>Annuler</Button>
                <Button type="submit" variant="primary">Confirmer</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
