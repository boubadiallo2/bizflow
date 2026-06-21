import React, { useState, useEffect } from 'react';
import { Banknote, AlertTriangle, Search, FileText, ArrowLeft, Plus, Trash2, Printer, Download } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { productsService, invoicesService } from '../services/apiService';
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
  const [invoicesList, setInvoicesList] = useState<any[]>([]);
  const [commerceType, setCommerceType] = useState('');
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
  const [autoAction, setAutoAction] = useState<'print' | 'download' | null>(null);
  const [opticData, setOpticData] = useState({
    od: '',
    og: '',
    add: '',
    monture: false,
    verre: false,
    avance: 0,
  });

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
    const loadData = async () => {
      try {
        const [productsData, settingsData, invoicesData] = await Promise.all([
          productsService.getAll(),
          import('../services/apiService').then(m => m.settingsService.get()),
          invoicesService.getAll()
        ]);
        setProducts(productsData as ProductItem[]);
        setInvoicesList(invoicesData);
        if (settingsData) {
          setCompanySettings(settingsData);
          if (settingsData.commerceType) {
            setCommerceType(settingsData.commerceType);
          }
        }
      } catch (e) {
        console.error('Erreur chargement données facturation:', e);
      }
    };
    loadData();
  }, []);

  const handleCreateInvoice = async () => {
    const invoiceData = {
      invoiceNumber: `FAC-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2, '0')}-${Math.floor(Math.random()*1000).toString().padStart(3, '0')}`,
      date: new Date().toISOString(),
      amount: totalTTC,
      totalHT: montantHT,
      tva: tva,
      totalTTC: totalTTC,
      status: 'Payée',
      lines: lines,
      opticData: commerceType === 'Optique / Lunetterie' ? {
        ...opticData,
        reste: totalTTC - (opticData.avance || 0)
      } : null
    };

    try {
      await invoicesService.add(invoiceData);
      const updatedInvoices = await invoicesService.getAll();
      setInvoicesList(updatedInvoices);

      if (commerceType === 'Optique / Lunetterie') {
        setViewingInvoice(invoiceData);
      } else {
        setIsCreating(false);
      }
    } catch (e) {
      console.error("Erreur création facture", e);
    }
  };

  useEffect(() => {
    if (viewingInvoice && autoAction) {
      if (autoAction === 'print') {
        setTimeout(() => window.print(), 500);
      } else if (autoAction === 'download') {
        setTimeout(() => {
          const element = document.getElementById('invoice-pdf-content');
          if (element) {
            const opt = {
              margin:       0,
              filename:     `Facture_${viewingInvoice.invoiceNumber || 'Optique'}.pdf`,
              image:        { type: 'jpeg' as const, quality: 0.98 },
              html2canvas:  { scale: 2, useCORS: true },
              jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
          }
        }, 500);
      }
      setAutoAction(null);
    }
  }, [viewingInvoice, autoAction]);

  if (viewingInvoice && commerceType === 'Optique / Lunetterie') {
    const optic = viewingInvoice.opticData || {};
    const subtotal = viewingInvoice.amount || viewingInvoice.totalTTC;
    
    return (
      <div className="print-view-container" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--color-bg)', zIndex: 100, overflowY: 'auto', padding: '20px' }}>
        <div className="no-print" style={{ marginBottom: '24px', display: 'flex', gap: '16px', maxWidth: '210mm', margin: '0 auto 24px auto' }}>
          <Button variant="secondary" onClick={() => { setViewingInvoice(null); setIsCreating(false); }} icon={<ArrowLeft size={18} />}>Retour</Button>
          <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto' }}>
            <Button variant="secondary" onClick={() => { setTimeout(() => window.print(), 100); }} icon={<Printer size={18} />}>Imprimer</Button>
            <Button variant="primary" onClick={() => {
              const element = document.getElementById('invoice-pdf-content');
              if (!element) return;
              const opt = {
                margin:       0,
                filename:     `Facture_${viewingInvoice.invoiceNumber || 'Optique'}.pdf`,
                image:        { type: 'jpeg' as const, quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
              };
              html2pdf().set(opt).from(element).save();
            }} icon={<Download size={18} />}>Télécharger PDF</Button>
          </div>
        </div>
        
        <div id="invoice-pdf-content" className="optic-invoice-document" style={{ width: '210mm', minHeight: '297mm', padding: '20mm', margin: '0 auto', backgroundColor: 'white', color: '#00a3e0', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            {companySettings?.logo ? (
              <img src={companySettings.logo} alt="Logo" style={{ maxHeight: '100px' }} />
            ) : (
              <h1 style={{ fontSize: '32px', margin: 0, fontWeight: 'bold' }}>{companySettings?.name}</h1>
            )}
          </div>
          
          <div style={{ backgroundColor: '#00a3e0', color: 'white', padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '18px', marginBottom: '20px' }}>
            Vente de lunettes Médicales - Lunettes Photogray Antireflet - Lunettes de Soleil
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ backgroundColor: '#00a3e0', color: 'white', padding: '5px 15px', fontWeight: 'bold', fontSize: '20px' }}>
              FACTURE
            </div>
            <div style={{ fontSize: '16px' }}>
              Date : <span style={{ borderBottom: '1px dotted #00a3e0', display: 'inline-block', width: '150px', textAlign: 'center', color: 'black' }}>{new Date(viewingInvoice.date).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', marginBottom: '20px', fontSize: '16px', lineHeight: '1.5' }}>
            <div style={{ flex: 1, display: 'flex' }}>
              <span style={{ whiteSpace: 'nowrap' }}>M.</span>
              <span style={{ borderBottom: '1px dotted #00a3e0', flex: 1, marginLeft: '10px' }}></span>
            </div>
            <div style={{ flex: 1, display: 'flex', marginLeft: '20px' }}>
              <span style={{ whiteSpace: 'nowrap' }}>Tél :</span>
              <span style={{ borderBottom: '1px dotted #00a3e0', flex: 1, marginLeft: '10px' }}></span>
            </div>
          </div>
          
          <div style={{ fontSize: '16px', lineHeight: '2' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ width: '20px', height: '20px', border: '2px solid #00a3e0', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '10px' }}>
                {optic.monture && <span style={{ fontSize: '18px', lineHeight: '1' }}>✓</span>}
              </div>
              <span style={{ width: '80px' }}>Monture</span>
              <span style={{ borderBottom: '1px dotted #00a3e0', flex: 1 }}></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ width: '20px', height: '20px', border: '2px solid #00a3e0', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '10px' }}>
                {optic.verre && <span style={{ fontSize: '18px', lineHeight: '1' }}>✓</span>}
              </div>
              <span style={{ width: '80px' }}>Verre</span>
              <span style={{ borderBottom: '1px dotted #00a3e0', flex: 1 }}></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ width: '110px', paddingLeft: '30px' }}>OD</span>
              <span style={{ borderBottom: '1px dotted #00a3e0', flex: 1, paddingLeft: '10px', color: 'black' }}>{optic.od}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ width: '110px', paddingLeft: '30px' }}>OG</span>
              <span style={{ borderBottom: '1px dotted #00a3e0', flex: 1, paddingLeft: '10px', color: 'black' }}>{optic.og}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ width: '20px', height: '20px', border: '2px solid #00a3e0', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '10px' }}>
                {optic.add && <span style={{ fontSize: '18px', lineHeight: '1' }}>✓</span>}
              </div>
              <span style={{ width: '120px' }}>Progressif ADD</span>
              <span style={{ borderBottom: '1px dotted #00a3e0', flex: 1, paddingLeft: '10px', color: 'black' }}>{optic.add && optic.add !== 'Oui' ? optic.add : ''}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ width: '140px', paddingLeft: '30px' }}>TOTAL</span>
              <span style={{ borderBottom: '1px dotted #00a3e0', flex: 1, paddingLeft: '10px', color: 'black' }}>{subtotal.toLocaleString('fr-FR')} F</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ width: '140px', paddingLeft: '30px' }}>REMISE</span>
              <span style={{ borderBottom: '1px dotted #00a3e0', flex: 1, paddingLeft: '10px', color: 'black' }}></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ width: '140px', paddingLeft: '30px' }}>TOTAL GENERAL</span>
              <span style={{ borderBottom: '1px dotted #00a3e0', flex: 1, paddingLeft: '10px', color: 'black' }}>{subtotal.toLocaleString('fr-FR')} F</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #00a3e0', paddingBottom: '20px' }}>
              <span style={{ width: '140px', paddingLeft: '30px' }}>AVANCE</span>
              <span style={{ borderBottom: '1px dotted #00a3e0', flex: 1, paddingLeft: '10px', color: 'black' }}>{(optic.avance || 0).toLocaleString('fr-FR')} F</span>
              <span style={{ width: '80px', paddingLeft: '20px' }}>RESTE</span>
              <span style={{ borderBottom: '1px dotted #00a3e0', flex: 1, paddingLeft: '10px', color: 'black' }}>{(optic.reste || 0).toLocaleString('fr-FR')} F</span>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', fontSize: '14px', lineHeight: '1.4' }}>
            <p style={{ margin: '0' }}>RCCM : {companySettings?.rccm || '...................'} - NINEA : {companySettings?.ninea || '...................'}</p>
            <p style={{ margin: '0' }}>Adresse : {companySettings?.address || '...................'}</p>
            <p style={{ margin: '0' }}>Tél : {companySettings?.phone || '...................'} - Email : {companySettings?.email || '...................'}</p>
            {companySettings?.slogan && <p style={{ margin: '5px 0 0 0', fontStyle: 'italic' }}>« {companySettings.slogan} »</p>}
          </div>
          
        </div>
      </div>
    );
  }

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

          {commerceType === 'Optique / Lunetterie' && (
            <Card>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', fontWeight: 600 }}>Informations Médicales (Optique)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
                    <input type="checkbox" checked={opticData.monture} onChange={(e) => setOpticData({...opticData, monture: e.target.checked})} style={{ width: '16px', height: '16px' }} />
                    Monture
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={opticData.verre} onChange={(e) => setOpticData({...opticData, verre: e.target.checked})} style={{ width: '16px', height: '16px' }} />
                    Verre
                  </label>
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!opticData.add} onChange={(e) => setOpticData({...opticData, add: e.target.checked ? 'Oui' : ''})} style={{ width: '16px', height: '16px' }} />
                    Progressif ADD
                  </label>
                  {!!opticData.add && (
                    <input type="text" className="status-select" style={{ marginTop: '8px', width: '100%' }} placeholder="Valeur ADD" value={opticData.add === 'Oui' ? '' : opticData.add} onChange={(e) => setOpticData({...opticData, add: e.target.value})} />
                  )}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px' }}>OD (Œil Droit)</label>
                  <input type="text" className="status-select" style={{ width: '100%' }} value={opticData.od} onChange={(e) => setOpticData({...opticData, od: e.target.value})} placeholder="Ex: -1.00 (-0.50) 180°" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px' }}>OG (Œil Gauche)</label>
                  <input type="text" className="status-select" style={{ width: '100%' }} value={opticData.og} onChange={(e) => setOpticData({...opticData, og: e.target.value})} placeholder="Ex: -1.25 (-0.75) 175°" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px' }}>Avance payée</label>
                  <input type="number" className="status-select" style={{ width: '100%' }} value={opticData.avance || ''} onChange={(e) => {
                    const avance = parseInt(e.target.value) || 0;
                    setOpticData({...opticData, avance});
                  }} placeholder="Montant en FCFA" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '8px' }}>Reste à payer</label>
                  <input type="text" className="status-select" style={{ width: '100%', backgroundColor: 'var(--color-bg)', fontWeight: 'bold' }} value={`${Math.max(0, totalTTC - (opticData.avance || 0)).toLocaleString('fr-FR')} F`} readOnly />
                </div>
              </div>
            </Card>
          )}

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
            <Button variant="primary" onClick={handleCreateInvoice} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} icon={<FileText size={18} />}>Créer la facture</Button>
          </div>
        </div>
      </div>
    );
  }

  const caFacture = invoicesList.reduce((sum, inv) => sum + (inv.totalTTC || inv.amount || 0), 0);
  const encaisse = invoicesList.reduce((sum, inv) => {
    if (inv.opticData?.avance) return sum + inv.opticData.avance;
    if (inv.status === 'Payée') return sum + (inv.totalTTC || inv.amount || 0);
    return sum;
  }, 0);
  const impaye = caFacture - encaisse;

  return (
    <div className="facturation-container">
      <div className="page-header flex justify-between items-center">
        <div>
          <h2>Facturation</h2>
          <p className="text-muted text-sm mt-1">{invoicesList.length} facture{invoicesList.length > 1 ? 's' : ''}</p>
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
          <div className="stat-value">{caFacture.toLocaleString('fr-FR')} F</div>
        </Card>

        <Card className="stat-card bg-primary-light">
          <div className="stat-header">
            <span className="stat-title text-muted">ENCAISSÉ</span>
            <div className="stat-icon bg-white text-primary rounded-full">
              <Banknote size={20} />
            </div>
          </div>
          <div className="stat-value">{encaisse.toLocaleString('fr-FR')} F</div>
        </Card>

        <Card className="stat-card">
          <div className="stat-header">
            <span className="stat-title text-muted">IMPAYÉ</span>
            <div className="stat-icon bg-bg text-muted rounded-md">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="stat-value">{impaye.toLocaleString('fr-FR')} F</div>
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

      {invoicesList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FileText size={32} className="text-muted" />
          </div>
          <h3>Aucune facture</h3>
          <p className="text-muted mb-4">Créez votre première facture</p>
          <Button variant="primary" onClick={() => setIsCreating(true)}>+ Nouvelle facture</Button>
        </div>
      ) : (
        <Card style={{ marginTop: '24px' }}>
          <div className="table-responsive">
            <table className="data-table" style={{ width: '100%', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--color-border)' }}>N° Facture</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--color-border)' }}>Date</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--color-border)' }}>Montant TTC</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--color-border)' }}>Statut</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid var(--color-border)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoicesList.map((invoice: any) => (
                  <tr key={invoice.id}>
                    <td style={{ padding: '12px', borderBottom: '1px solid var(--color-border)' }}>{invoice.invoiceNumber}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid var(--color-border)' }}>{new Date(invoice.date).toLocaleDateString('fr-FR')}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid var(--color-border)' }}>{invoice.totalTTC ? invoice.totalTTC.toLocaleString('fr-FR') : (invoice.amount?.toLocaleString('fr-FR') || 0)} F</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid var(--color-border)' }}><span className="status-badge status-payee" style={{ backgroundColor: '#e6f4ea', color: '#1e8e3e', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{invoice.status || 'Payée'}</span></td>
                    <td style={{ padding: '12px', borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {commerceType === 'Optique / Lunetterie' ? (
                          <>
                            <Button variant="secondary" onClick={() => { setViewingInvoice(invoice); setAutoAction('print'); }} icon={<Printer size={16} />}>Imprimer</Button>
                            <Button variant="secondary" onClick={() => { setViewingInvoice(invoice); setAutoAction('download'); }} icon={<Download size={16} />}>Télécharger</Button>
                          </>
                        ) : (
                          <Button variant="secondary" onClick={() => alert("Impression standard non implémentée")} icon={<FileText size={16} />}>Détails</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
