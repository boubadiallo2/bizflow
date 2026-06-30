import React, { useState, useEffect } from 'react';
import { FileSignature, AlertCircle, Search, ArrowLeft, Plus, CheckCircle2, Trash2, Edit2, Printer } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { productsService, quotesService, settingsService } from '../services/apiService';
import { showConfirm, showError } from '../utils/notifications';
import html2pdf from 'html2pdf.js';
import './Devis.css';

interface LineItem {
  id: number;
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface Quote {
  id: string;
  client: string;
  date: string;
  totalHT: number;
  tva: number;
  totalTTC: number;
  status: string;
  lines: LineItem[];
  createdAt: string;
}

export const Devis: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);
  const [viewingQuote, setViewingQuote] = useState<Quote | null>(null);
  
  const [inventoryProducts, setInventoryProducts] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  
  // Form State
  const [client, setClient] = useState('');
  const [validityDate, setValidityDate] = useState('');
  const [lines, setLines] = useState<LineItem[]>([
    { id: Date.now(), productId: '', quantity: 1, unitPrice: 0 }
  ]);
  const [applyTva, setApplyTva] = useState(true);

  const [companySettings, setCompanySettings] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [inv, q, settingsData] = await Promise.all([
          productsService.getAll(),
          quotesService.getAll(),
          settingsService.get()
        ]);
        if (inv.length > 0) {
          setInventoryProducts(inv);
        } else {
          setInventoryProducts([
            { id: '1', name: 'T-shirt basique en coton', priceValue: 3500 },
            { id: '2', name: 'Jean slim pour homme', priceValue: 15000 }
          ]);
        }
        setQuotes(q as Quote[]);
        if (settingsData) setCompanySettings(settingsData);
      } catch (e) {
        console.error('Erreur chargement devis:', e);
      }
    };
    loadData();
  }, []);

  const resetForm = () => {
    setLines([{ id: Date.now(), productId: '', quantity: 1, unitPrice: 0 }]);
    setClient('');
    setValidityDate('');
    setApplyTva(true);
    setEditingQuoteId(null);
  };

  const addLine = () => {
    setLines([...lines, { id: Date.now(), productId: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeLine = (id: number) => {
    if (lines.length > 1) {
      setLines(lines.filter(line => line.id !== id));
    }
  };

  const updateLine = (id: number, field: keyof LineItem, value: any) => {
    setLines(lines.map(line => {
      if (line.id === id) {
        const updatedLine = { ...line, [field]: value };
        // Auto-update price if product changes
        if (field === 'productId') {
          const product = inventoryProducts.find(p => p.id.toString() === value);
          if (product) {
            const price = product.priceValue || parseInt((product.vente || '0').replace(/\D/g, ''), 10) || 0;
            updatedLine.unitPrice = price;
          }
        }
        return updatedLine;
      }
      return line;
    }));
  };

  // Calculations
  const totalHT = lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0);
  const tva = applyTva ? totalHT * 0.18 : 0;
  const totalTTC = totalHT + tva;

  const handleGenerateQuote = async () => {
    if (lines.length === 0 || !lines[0].productId) {
      showError("Attention", "Veuillez sélectionner au moins un produit pour générer le devis.");
      return;
    }

    const quoteData = {
      quoteNumber: `DEV-${Math.floor(100000 + Math.random() * 900000)}`,
      client: client || 'Client Divers',
      date: validityDate || new Date().toISOString().split('T')[0],
      totalHT,
      tva,
      totalTTC,
      status: 'Brouillon',
      lines: [...lines],
      createdAt: new Date().toISOString(),
    };

    if (editingQuoteId) {
      await quotesService.update(editingQuoteId, quoteData);
    } else {
      await quotesService.add(quoteData);
    }
    
    const updated = await quotesService.getAll();
    setQuotes(updated as Quote[]);
    
    resetForm();
    setIsCreating(false);
  };

  const updateQuoteStatus = async (id: string, newStatus: string) => {
    await quotesService.update(id, { status: newStatus });
    const updated = await quotesService.getAll();
    setQuotes(updated as Quote[]);
  };

  const handleEditQuote = (quote: Quote) => {
    setClient(quote.client);
    setValidityDate(quote.date);
    setLines([...quote.lines]);
    setApplyTva(quote.tva > 0);
    setEditingQuoteId(quote.id);
    setIsCreating(true);
  };

  const handleDeleteQuote = async (id: string) => {
    const confirmed = await showConfirm("Êtes-vous sûr de vouloir supprimer ce devis ?");
    if (confirmed) {
      await quotesService.remove(id);
      const updated = await quotesService.getAll();
      setQuotes(updated as Quote[]);
    }
  };

  const handlePrintQuote = (quote: Quote) => {
    setViewingQuote(quote);
    setTimeout(() => {
      const element = document.getElementById('devis-pdf-content');
      if (element) {
        const opt = {
          margin:       0,
          filename:     `Devis_${quote.id.slice(0, 8)}.pdf`,
          image:        { type: 'jpeg' as const, quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' as const }
        };
        html2pdf().set(opt).from(element).save();
      }
    }, 500);
  };

  const formatCurrency = (amount: number) => {
    return Math.round(amount).toLocaleString('fr-FR') + ' F';
  };

  const getProductName = (id: string) => {
    const prod = inventoryProducts.find(p => p.id.toString() === id);
    return prod ? prod.name : 'Produit inconnu';
  };

  // Stats
  const totalDevise = quotes.reduce((sum, q) => sum + q.totalTTC, 0);
  const acceptedQuotes = quotes.filter(q => q.status === 'Accepté').length;
  const pendingQuotes = quotes.filter(q => q.status === 'Brouillon' || q.status === 'Envoyé').length;

  if (viewingQuote) {
    return (
      <div className="print-view-container">
        <div className="no-print" style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
          <Button variant="secondary" onClick={() => setViewingQuote(null)} icon={<ArrowLeft size={18} />}>Retour</Button>
          <Button variant="primary" onClick={() => handlePrintQuote(viewingQuote)} icon={<Printer size={18} />}>Télécharger PDF</Button>
        </div>
        
        <div id="devis-pdf-content" className="quote-document" style={{ padding: '20px', backgroundColor: 'white', color: 'black' }}>
          <div className="quote-header">
            <div className="company-details">
              {companySettings?.logo ? (
                <img src={companySettings.logo} alt="Logo" style={{ maxHeight: '80px', marginBottom: '10px' }} />
              ) : (
                <h1 style={{ margin: 0 }}>{companySettings?.name || 'Nexora ERP'}</h1>
              )}
              <p>{companySettings?.address || '123 Avenue du Commerce'}</p>
              <p>{companySettings?.phone || 'Tél: +221 77 123 45 67'}</p>
            </div>
            <div className="quote-meta">
              <h2 style={{ fontSize: '28px', color: 'var(--color-sidebar)', margin: '0 0 10px 0' }}>DEVIS</h2>
              <p><strong>N° :</strong> {viewingQuote.id}</p>
              <p><strong>Date :</strong> {new Date(viewingQuote.createdAt).toLocaleDateString('fr-FR')}</p>
              <p><strong>Validité :</strong> {new Date(viewingQuote.date).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
          
          <div className="client-details">
            <h3>À l'attention de :</h3>
            <p><strong>{viewingQuote.client}</strong></p>
          </div>
          
          <table className="quote-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qté</th>
                <th>Prix Unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {viewingQuote.lines.map((line, idx) => (
                <tr key={idx}>
                  <td>{getProductName(line.productId)}</td>
                  <td>{line.quantity}</td>
                  <td>{formatCurrency(line.unitPrice)}</td>
                  <td>{formatCurrency(line.quantity * line.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="quote-totals">
            <div className="totals-row">
              <span>Total HT :</span>
              <span>{formatCurrency(viewingQuote.totalHT)}</span>
            </div>
            <div className="totals-row">
              <span>TVA (18%) :</span>
              <span>{formatCurrency(viewingQuote.tva)}</span>
            </div>
            <div className="totals-row grand-total">
              <span>Total TTC :</span>
              <span>{formatCurrency(viewingQuote.totalTTC)}</span>
            </div>
          </div>
          
          <div className="quote-footer">
            <p>Ce devis est valable jusqu'au {new Date(viewingQuote.date).toLocaleDateString('fr-FR')}.</p>
            <p>Pour validation, veuillez retourner ce document signé et portant la mention "Bon pour accord".</p>
            <div className="signature-area">
              <p>Signature du client :</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="devis-container">
        <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <button onClick={() => { setIsCreating(false); resetForm(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text)' }}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{editingQuoteId ? `Modifier le Devis ${editingQuoteId}` : 'Nouveau Devis'}</h2>
            <p className="text-muted text-sm mt-1">{editingQuoteId ? 'Mettez à jour les informations du devis' : 'Créez une proposition commerciale'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '900px' }}>
          <Card>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontWeight: 600 }}>Informations du prospect / client</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--color-text)' }}>Client</label>
                <input 
                  type="text" 
                  placeholder="Nom du client ou entreprise" 
                  className="status-select" 
                  style={{ width: '100%', padding: '10px 12px' }} 
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px', color: 'var(--color-text)' }}>Date de validité</label>
                <input 
                  type="date" 
                  className="status-select" 
                  style={{ width: '100%', fontFamily: 'inherit' }} 
                  value={validityDate}
                  onChange={(e) => setValidityDate(e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Prestations / Produits</h3>
            </div>
            
            {lines.map((line, index) => (
              <div key={line.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1.5fr 1fr auto', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  {index === 0 && <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Désignation (Produit)</label>}
                  <select 
                    className="status-select" 
                    style={{ width: '100%' }}
                    value={line.productId}
                    onChange={(e) => updateLine(line.id, 'productId', e.target.value)}
                  >
                    <option value="">Sélectionnez un produit...</option>
                    {inventoryProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
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
                    onChange={(e) => updateLine(line.id, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  {index === 0 && <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Prix unitaire</label>}
                  <input 
                    type="number" 
                    min="0" 
                    className="status-select" 
                    style={{ width: '100%', padding: '10px 12px' }}
                    value={line.unitPrice}
                    onChange={(e) => updateLine(line.id, 'unitPrice', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div style={{ textAlign: 'right' }}>
                  {index === 0 && <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total ligne</label>}
                  <div style={{ fontWeight: 600, padding: '10px 0', marginTop: index > 0 ? '0' : 'auto' }}>
                    {formatCurrency(line.quantity * line.unitPrice)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {index === 0 && <div style={{ height: '27px', marginBottom: '8px' }}></div>}
                  <button 
                    onClick={() => removeLine(line.id)}
                    style={{ background: 'none', border: 'none', color: lines.length > 1 ? 'var(--color-danger)' : 'var(--color-border)', cursor: lines.length > 1 ? 'pointer' : 'not-allowed', padding: '10px' }}
                    disabled={lines.length === 1}
                    title="Supprimer la ligne"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            
            <button 
              onClick={addLine}
              style={{ padding: '8px 16px', fontSize: '0.9rem', background: 'transparent', border: '1px dashed var(--color-border)', borderRadius: '6px', display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', fontWeight: 500, color: 'var(--color-text)', width: '100%', justifyContent: 'center', marginTop: '8px' }}
            >
              <Plus size={18} /> Ajouter un article
            </button>
          </Card>

          <div style={{ backgroundColor: 'var(--color-primary-light)', padding: '24px', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', color: 'var(--color-text-muted)' }}>
              <span>Total HT</span>
              <span>{formatCurrency(totalHT)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', color: 'var(--color-text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="applyTva" 
                  checked={applyTva} 
                  onChange={(e) => setApplyTva(e.target.checked)} 
                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
                />
                <label htmlFor="applyTva" style={{ cursor: 'pointer', userSelect: 'none' }}>Appliquer la TVA (18%)</label>
              </div>
              <span>{formatCurrency(tva)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '1.25rem', fontWeight: 700 }}>
              <span>Total TTC de la proposition</span>
              <span>{formatCurrency(totalTTC)}</span>
            </div>
            <Button variant="primary" onClick={handleGenerateQuote} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} icon={<FileSignature size={18} />}>{editingQuoteId ? 'Mettre à jour le devis' : 'Générer le devis'}</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="devis-container">
      <div className="page-header flex justify-between items-center">
        <div>
          <h2>Devis</h2>
          <p className="text-muted text-sm mt-1">{quotes.length} proposition(s) commerciale(s)</p>
        </div>
        <Button variant="primary" onClick={() => { resetForm(); setIsCreating(true); }}>+ Nouveau devis</Button>
      </div>

      <div className="stats-grid devis-stats">
        <Card className="stat-card">
          <div className="stat-header">
            <span className="stat-title text-muted">TOTAL DEVISÉ (MOIS)</span>
            <div className="stat-icon bg-white text-primary rounded-full" style={{ backgroundColor: 'var(--color-bg)' }}>
              <FileSignature size={20} className="text-muted" />
            </div>
          </div>
          <div className="stat-value">{formatCurrency(totalDevise)}</div>
        </Card>

        <Card className="stat-card bg-primary-light">
          <div className="stat-header">
            <span className="stat-title text-muted">DEVIS ACCEPTÉS</span>
            <div className="stat-icon bg-white text-primary rounded-full">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="stat-value">{acceptedQuotes}</div>
        </Card>

        <Card className="stat-card">
          <div className="stat-header">
            <span className="stat-title text-muted">EN ATTENTE</span>
            <div className="stat-icon bg-bg text-muted rounded-md">
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="stat-value">{pendingQuotes}</div>
        </Card>
      </div>

      <div className="filters-bar">
        <div className="search-input-wrapper flex-1">
          <Search size={18} className="search-icon text-muted" />
          <input 
            type="text" 
            placeholder="Rechercher un devis..." 
            className="search-input"
          />
        </div>
        <select className="status-select">
          <option>Tous les statuts</option>
          <option>Brouillon</option>
          <option>Envoyé</option>
          <option>Accepté</option>
          <option>Refusé</option>
        </select>
      </div>

      {quotes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FileSignature size={32} className="text-muted" />
          </div>
          <h3>Aucun devis</h3>
          <p className="text-muted mb-4">Créez votre première proposition commerciale</p>
          <Button variant="primary" onClick={() => { resetForm(); setIsCreating(true); }}>+ Nouveau devis</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {quotes.map((quote) => (
            <Card key={quote.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h4 style={{ fontWeight: 600, fontSize: '1rem', margin: 0 }}>{quote.client}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{quote.id}</span>
                </div>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '4px', margin: '4px 0 0 0' }}>
                  {quote.lines.length} article(s) • Valide jusqu'au {new Date(quote.date).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{formatCurrency(quote.totalTTC)}</div>
                </div>
                <select 
                  value={quote.status}
                  onChange={(e) => updateQuoteStatus(quote.id, e.target.value)}
                  style={{ 
                    padding: '6px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.8rem', 
                    fontWeight: 600, 
                    backgroundColor: quote.status === 'Brouillon' ? 'var(--color-bg)' : 
                                     quote.status === 'Accepté' ? '#d1fae5' :
                                     quote.status === 'Refusé' ? '#fee2e2' :
                                     'var(--color-primary-light)', 
                    color: quote.status === 'Brouillon' ? 'var(--color-text)' : 
                           quote.status === 'Accepté' ? '#059669' :
                           quote.status === 'Refusé' ? '#dc2626' :
                           'var(--color-primary)',
                    minWidth: '110px',
                    textAlign: 'center',
                    border: '1px solid transparent',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="Brouillon">Brouillon</option>
                  <option value="Envoyé">Envoyé</option>
                  <option value="Accepté">Accepté</option>
                  <option value="Refusé">Refusé</option>
                </select>
                
                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', borderLeft: '1px solid var(--color-border)', paddingLeft: '16px' }}>
                  <button 
                    onClick={() => handlePrintQuote(quote)} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }} 
                    title="Imprimer / PDF"
                  >
                    <Printer size={18} />
                  </button>
                  <button 
                    onClick={() => handleEditQuote(quote)} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }} 
                    title="Modifier"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDeleteQuote(quote.id)} 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', padding: '4px' }} 
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
