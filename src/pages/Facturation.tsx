import React, { useState, useEffect } from 'react';
import { Banknote, AlertTriangle, Search, FileText, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { productsService } from '../services/apiService';
import './Facturation.css';

interface ProductItem {
  id: number;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  achat: string;
  vente: string;
  priceValue?: number;
}

interface InvoiceLine {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export const Facturation: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [applyTVA, setApplyTVA] = useState(true);
  const [lines, setLines] = useState<InvoiceLine[]>([
    { id: Date.now().toString(), productId: '', productName: '', quantity: 1, unitPrice: 0 }
  ]);

  const handleAddLine = () => {
    setLines([...lines, { id: Date.now().toString(), productId: '', productName: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLine = (id: string) => {
    if (lines.length > 1) {
      setLines(lines.filter(l => l.id !== id));
    }
  };

  const handleLineChange = (id: string, field: keyof InvoiceLine, value: any) => {
    setLines(lines.map(line => {
      if (line.id === id) {
        const updatedLine = { ...line, [field]: value };
        if (field === 'productId') {
          const selectedProd = products.find(p => p.id.toString() === value.toString());
          if (selectedProd) {
            updatedLine.productName = selectedProd.name;
            updatedLine.unitPrice = selectedProd.priceValue || parseInt((selectedProd.vente || '0').replace(/\D/g, '')) || 0;
          } else {
            updatedLine.productName = '';
            updatedLine.unitPrice = 0;
          }
        }
        return updatedLine;
      }
      return line;
    }));
  };

  const montantHT = lines.reduce((sum, line) => sum + (line.quantity * (line.unitPrice || 0)), 0);
  const tva = applyTVA ? montantHT * 0.18 : 0;
  const totalTTC = montantHT + tva;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await productsService.getAll();
        setProducts(data as ProductItem[]);
      } catch (e) {
        console.error('Erreur chargement produits facturation:', e);
      }
    };
    loadProducts();
  }, []);

  if (isCreating) {
    return (
      <div className="facturation-container">
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button onClick={() => setIsCreating(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text)' }}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Nouvelle facture</h2>
            <p className="text-muted text-sm mt-1">Créez une facture manuellement</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
          <Card>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontWeight: 600 }}>Informations</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--color-text)' }}>Client</label>
                <select className="status-select" style={{ width: '100%' }}>
                  <option value="">Sélectionnez un client</option>
                  <option value="1">Entreprise ABC</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--color-text)' }}>Date d'échéance</label>
                <input type="date" className="status-select" style={{ width: '100%', fontFamily: 'inherit' }} />
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Lignes</h3>
              <button type="button" onClick={handleAddLine} style={{ padding: '6px 12px', fontSize: '0.875rem', background: 'transparent', border: '1px solid var(--color-border)', borderRadius: '6px', display: 'flex', gap: '4px', alignItems: 'center', cursor: 'pointer', fontWeight: 500 }}>
                <Plus size={16} /> Ajouter
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {lines.map((line, index) => (
                <div key={line.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 1fr auto', gap: '16px', alignItems: 'center' }}>
                  <div>
                    {index === 0 && <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Produit / Description</label>}
                    <select 
                      className="status-select" 
                      style={{ width: '100%' }}
                      value={line.productId}
                      onChange={(e) => handleLineChange(line.id, 'productId', e.target.value)}
                    >
                      <option value="">Sélectionnez un produit</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - {p.vente}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    {index === 0 && <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Qté</label>}
                    <input 
                      type="number" 
                      min="1" 
                      className="status-select" 
                      style={{ width: '100%', padding: '10px 12px' }} 
                      value={line.quantity}
                      onChange={(e) => handleLineChange(line.id, 'quantity', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    {index === 0 && <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Prix unit. (FCFA)</label>}
                    <input 
                      type="number" 
                      min="0" 
                      className="status-select" 
                      style={{ width: '100%', padding: '10px 12px' }} 
                      value={line.unitPrice}
                      onChange={(e) => handleLineChange(line.id, 'unitPrice', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {index === 0 && <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Sous-total</label>}
                    <div style={{ fontWeight: 600, padding: '10px 0' }}>{(line.quantity * line.unitPrice).toLocaleString('fr-FR')} F</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {index === 0 && <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'transparent' }}>X</label>}
                    <button 
                      type="button"
                      onClick={() => handleRemoveLine(line.id)}
                      disabled={lines.length === 1}
                      style={{ background: 'none', border: 'none', color: lines.length === 1 ? '#ccc' : 'var(--color-danger)', cursor: lines.length === 1 ? 'not-allowed' : 'pointer', padding: '10px 0' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
              <span>Montant HT</span>
              <span>{montantHT.toLocaleString('fr-FR')} F</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', color: 'var(--color-text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="tva-facture"
                  checked={applyTVA}
                  onChange={(e) => setApplyTVA(e.target.checked)}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <label htmlFor="tva-facture" style={{ cursor: 'pointer', userSelect: 'none' }}>TVA (18%)</label>
              </div>
              <span>{tva > 0 ? '+' : ''}{tva.toLocaleString('fr-FR')} F</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '1.25rem', fontWeight: 700 }}>
              <span>Total TTC</span>
              <span>{totalTTC.toLocaleString('fr-FR')} F</span>
            </div>
            <Button variant="primary" onClick={() => setIsCreating(false)} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} icon={<FileText size={18} />}>Créer la facture</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="facturation-container">
      <div className="page-header flex justify-between items-center">
        <div>
          <h2>Facturation</h2>
          <p className="text-muted text-sm mt-1">0 facture</p>
        </div>
        <Button variant="primary" onClick={() => setIsCreating(true)}>+ Nouvelle facture</Button>
      </div>

      <div className="stats-grid facturation-stats">
        <Card className="stat-card bg-primary-light">
          <div className="stat-header">
            <span className="stat-title text-muted">CA FACTURÉ</span>
            <div className="stat-icon bg-white text-primary rounded-full">
              <Banknote size={20} />
            </div>
          </div>
          <div className="stat-value">0 F</div>
        </Card>

        <Card className="stat-card bg-primary-light">
          <div className="stat-header">
            <span className="stat-title text-muted">ENCAISSÉ</span>
            <div className="stat-icon bg-white text-primary rounded-full">
              <Banknote size={20} />
            </div>
          </div>
          <div className="stat-value">0 F</div>
        </Card>

        <Card className="stat-card">
          <div className="stat-header">
            <span className="stat-title text-muted">IMPAYÉ</span>
            <div className="stat-icon bg-bg text-muted rounded-md">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="stat-value">0 F</div>
        </Card>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper flex-1">
          <Search size={18} className="search-icon text-muted" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="search-input"
          />
        </div>
        <select className="status-select">
          <option>Tous les statuts</option>
          <option>Payée</option>
          <option>Impayée</option>
          <option>Brouillon</option>
        </select>
      </div>

      <div className="empty-state">
        <div className="empty-icon">
          <FileText size={32} className="text-muted" />
        </div>
        <h3>Aucune facture</h3>
        <p className="text-muted mb-4">Créez votre première facture</p>
        <Button variant="primary" onClick={() => setIsCreating(true)}>+ Nouvelle facture</Button>
      </div>
    </div>
  );
};
