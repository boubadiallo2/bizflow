import React, { useState, useEffect } from 'react';
import { Search, Unlock, ShoppingBag, CreditCard, X, Lock, Trash2, Plus, Minus, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '../components/Button';
import { productsService, salesService, settingsService } from '../services/apiService';
import './PointDeVente.css';

interface Product {
  id: number;
  name: string;
  category?: string;
  price: string;
  priceValue: number;
  stock: number;
  imageUrl?: string;
}


const productDatabase: Record<string, Product[]> = {
  // Alimentation
  'Produits frais': [{ id: 101, name: 'Tomates (1kg)', price: '1 500 F', priceValue: 1500, stock: 40 }, { id: 102, name: 'Pommes', price: '2 000 F', priceValue: 2000, stock: 30 }],
  'Boissons': [{ id: 103, name: 'Jus de fruit 1L', price: '1 200 F', priceValue: 1200, stock: 100 }, { id: 104, name: 'Eau minérale pack', price: '1 500 F', priceValue: 1500, stock: 200 }],
  'Épicerie': [{ id: 105, name: 'Riz parfumé 5kg', price: '4 500 F', priceValue: 4500, stock: 50 }, { id: 106, name: 'Huile 1L', price: '1 800 F', priceValue: 1800, stock: 80 }],
  
  // Vêtements
  'Vêtements Homme': [{ id: 201, name: 'T-shirt Homme', price: '3 500 F', priceValue: 3500, stock: 50 }, { id: 202, name: 'Jean slim Homme', price: '15 000 F', priceValue: 15000, stock: 30 }],
  'Vêtements Femme': [{ id: 203, name: "Robe d'été", price: '12 000 F', priceValue: 12000, stock: 20 }, { id: 204, name: 'Jupe plissée', price: '8 000 F', priceValue: 8000, stock: 40 }],
  'Chaussures': [{ id: 205, name: 'Baskets confort', price: '25 000 F', priceValue: 25000, stock: 15 }, { id: 206, name: 'Sandales cuir', price: '12 000 F', priceValue: 12000, stock: 35 }],
  
  // Électronique
  'Smartphones': [{ id: 301, name: 'Smartphone Pro', price: '150 000 F', priceValue: 150000, stock: 10 }, { id: 302, name: 'Téléphone basique', price: '15 000 F', priceValue: 15000, stock: 50 }],
  'Ordinateurs': [{ id: 303, name: 'PC Portable 15"', price: '250 000 F', priceValue: 250000, stock: 5 }, { id: 304, name: 'Souris sans fil', price: '8 000 F', priceValue: 8000, stock: 40 }],
  
  // Pharmacie
  'Médicaments': [{ id: 401, name: 'Paracétamol 500', price: '1 000 F', priceValue: 1000, stock: 100 }, { id: 402, name: 'Vitamine C', price: '2 500 F', priceValue: 2500, stock: 50 }],
  'Soins': [{ id: 403, name: 'Crème hydratante', price: '5 000 F', priceValue: 5000, stock: 30 }, { id: 404, name: 'Gel antiseptique', price: '1 500 F', priceValue: 1500, stock: 80 }],
  
  // Restauration
  'Plats chauds': [{ id: 501, name: 'Plat du jour', price: '3 500 F', priceValue: 3500, stock: 20 }, { id: 502, name: 'Poulet braisé', price: '4 000 F', priceValue: 4000, stock: 15 }],
  
  // Quincaillerie
  'Outils': [{ id: 601, name: 'Marteau acier', price: '4 500 F', priceValue: 4500, stock: 25 }, { id: 602, name: 'Tournevis multi', price: '2 500 F', priceValue: 2500, stock: 40 }],
  
  // Optique / Lunetterie
  'Lunettes de vue': [{ id: 701, name: 'Monture classique', price: '25 000 F', priceValue: 25000, stock: 30 }, { id: 702, name: 'Verres anti-reflets', price: '15 000 F', priceValue: 15000, stock: 50 }],
  'Lunettes de soleil': [{ id: 703, name: 'Ray-Ban Aviator', price: '45 000 F', priceValue: 45000, stock: 15 }, { id: 704, name: 'Lunettes polarisées', price: '20 000 F', priceValue: 20000, stock: 25 }],
  'Lentilles': [{ id: 705, name: 'Lentilles journalières (Boîte)', price: '12 000 F', priceValue: 12000, stock: 40 }],
  'Montures': [{ id: 706, name: 'Monture Enfant', price: '15 000 F', priceValue: 15000, stock: 20 }],
  'Produits d\'entretien': [{ id: 707, name: 'Solution multifonctions', price: '5 000 F', priceValue: 5000, stock: 60 }, { id: 708, name: 'Lingettes nettoyantes', price: '2 500 F', priceValue: 2500, stock: 100 }]
};

interface CartItem {
  product: Product;
  quantity: number;
}

export const PointDeVente: React.FC = () => {
  const [isCaisseModalOpen, setIsCaisseModalOpen] = useState(false);
  const [isCloseCaisseModalOpen, setIsCloseCaisseModalOpen] = useState(false);
  const [caisseAmount, setCaisseAmount] = useState('');
  const [caisseError, setCaisseError] = useState('');
  const [closeCaisseAmount, setCloseCaisseAmount] = useState('');
  const [closeCaisseError, setCloseCaisseError] = useState('');
  const [isCaisseOpen, setIsCaisseOpen] = useState(() => {
    return sessionStorage.getItem('pos_isCaisseOpen') === 'true';
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('Espèces');
  const [amountTendered, setAmountTendered] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // New States for Search, Category, and Cart calculations
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [applyTVA, setApplyTVA] = useState(false);
  const [discountType, setDiscountType] = useState('fcfa');
  const [discountValue, setDiscountValue] = useState<string>('');

  const handleGenerateProducts = async () => {
    if (!window.confirm("Voulez-vous générer des produits de démonstration basés sur votre type de commerce ?")) return;
    
    try {
      setIsGenerating(true);
      const userSettings = await settingsService.get();
      let categoriesToGenerate: string[] = [];
      
      if (userSettings && userSettings.selectedProducts && userSettings.selectedProducts.length > 0) {
        categoriesToGenerate = userSettings.selectedProducts;
      }
      
      const productsToAdd: any[] = [];
      for (const cat of categoriesToGenerate) {
        if (productDatabase[cat]) {
          productDatabase[cat].forEach(p => productsToAdd.push({ ...p, categoryName: cat }));
        }
      }
      
      if (productsToAdd.length === 0) {
        // Fallback to random products if no specific category matches
        productDatabase['Plats chauds'].forEach(p => productsToAdd.push({ ...p, categoryName: 'Restauration' }));
      }
      
      for (const prod of productsToAdd) {
        const keyword1 = encodeURIComponent(prod.categoryName.split(' ')[0].toLowerCase());
        const keyword2 = encodeURIComponent(prod.name.split(' ')[0].toLowerCase());
        const imageUrl = `https://loremflickr.com/400/400/${keyword1},${keyword2}/all?random=${prod.id}`;
        
        await productsService.add({
          name: prod.name,
          category: prod.categoryName,
          unit: 'pièce',
          stock: prod.stock,
          minStock: 5,
          achat: `${Math.round(prod.priceValue * 0.6)} F`,
          vente: prod.price,
          priceValue: prod.priceValue,
          imageUrl: imageUrl
        });
      }
      
      const inventory = await productsService.getAll();
      setProducts(inventory.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category || 'Général',
        price: p.vente || '0 F',
        priceValue: p.priceValue || parseInt((p.vente || '0').replace(/\D/g, '')) || 0,
        stock: p.stock || 0,
        imageUrl: p.imageUrl
      })));
      
      alert("Produits générés avec succès !");
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la génération");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const inventory = await productsService.getAll();
        if (inventory.length > 0) {
          setProducts(inventory.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category || 'Général',
            price: p.vente || '0 F',
            priceValue: p.priceValue || parseInt((p.vente || '0').replace(/\D/g, '')) || 0,
            stock: p.stock || 0,
            imageUrl: p.imageUrl
          })));
        } else {
          setProducts([]);
        }
      } catch (e) {
        console.error('Erreur chargement produits POS:', e);
        setProducts([]);
      }
    };
    loadProducts();
  }, []);

  const handleOpenCaisse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caisseAmount && caisseAmount !== '0') {
      setCaisseError('Veuillez renseigner le montant disponible.');
      return;
    }
    setCaisseError('');
    setIsCaisseOpen(true);
    sessionStorage.setItem('pos_isCaisseOpen', 'true');
    setIsCaisseModalOpen(false);
    setCaisseAmount('');
  };

  const handleCloseCaisse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!closeCaisseAmount && closeCaisseAmount !== '0') {
      setCloseCaisseError('Veuillez renseigner le montant final.');
      return;
    }
    setCloseCaisseError('');
    setIsCaisseOpen(false);
    sessionStorage.removeItem('pos_isCaisseOpen');
    setCart([]);
    setIsCloseCaisseModalOpen(false);
    setCloseCaisseAmount('');
  };

  const addToCart = (product: Product) => {
    if (!isCaisseOpen) return;
    
    setCart(prevCart => {
      const existing = prevCart.find(item => item.product.id === product.id);
      if (existing) {
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const availableCategories = Array.from(new Set(products.map(p => p.category || 'Général')));

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.product.priceValue * item.quantity), 0);
  
  let discountAmount = 0;
  const numDiscount = Number(discountValue) || 0;
  if (discountType === 'fcfa') {
    discountAmount = numDiscount;
  } else if (discountType === 'percent') {
    discountAmount = (subtotal * numDiscount) / 100;
  }
  
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  const tvaAmount = applyTVA ? subtotalAfterDiscount * 0.18 : 0;
  const total = subtotalAfterDiscount + tvaAmount;

  const handleCheckout = () => {
    if (cart.length > 0) {
      setAmountTendered(total); // Default to exact amount
      setIsPaymentModalOpen(true);
    }
  };

  const confirmPayment = async () => {
    // Calculate change
    const change = Math.max(0, amountTendered - total);
    
    // Save sale to Firebase
    const saleData = {
      ticketId: `TICK-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      subtotal: subtotal,
      discount: discountAmount,
      tva: tvaAmount,
      amount: total,
      tendered: amountTendered,
      change: change,
      items: cart.length,
      method: paymentMethod,
      status: 'Complété',
      cartItems: cart.map(item => ({
        productName: item.product.name,
        productId: item.product.id,
        quantity: item.quantity,
        priceValue: item.product.priceValue
      }))
    };
    
    try {
      await salesService.add(saleData);
    } catch (error) {
      console.error('Erreur sauvegarde vente:', error);
    }

    setReceiptData({ ...saleData, id: saleData.ticketId });
    setIsPaymentModalOpen(false);
    setIsReceiptModalOpen(true);
  };

  const handleCloseReceipt = () => {
    setCart([]);
    setIsReceiptModalOpen(false);
    setReceiptData(null);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="pos-layout">
      {/* Main Content Area */}
      <div className="pos-main">
        <div className="pos-header">
          <h2>Point de vente</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button 
              variant="outline" 
              onClick={handleGenerateProducts} 
              disabled={isGenerating}
              style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
            >
              {isGenerating ? 'Génération...' : 'Générer produits'}
            </Button>
            {!isCaisseOpen ? (
              <Button variant="primary" icon={<Unlock size={16} />} onClick={() => setIsCaisseModalOpen(true)}>
                Ouvrir caisse
              </Button>
            ) : (
              <Button variant="outline" icon={<Lock size={16} />} onClick={() => setIsCloseCaisseModalOpen(true)} style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
                Fermer caisse
              </Button>
            )}
          </div>
        </div>

        <div className="pos-toolbar">
          <div className="pos-search-wrapper">
            <Search size={18} className="pos-search-icon" />
            <input 
              type="text" 
              placeholder="Rechercher un produit..." 
              className="pos-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="pos-category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Toutes catégories</option>
            {availableCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="pos-grid">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="product-card" 
              style={{ opacity: isCaisseOpen ? 1 : 0.6, cursor: isCaisseOpen ? 'pointer' : 'not-allowed' }}
              onClick={() => addToCart(product)}
            >
              {product.imageUrl ? (
                <div style={{ width: '100%', height: '100px', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px' }}>
                  <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ) : (
                <div className="product-icon-wrapper">
                  <ShoppingBag size={24} />
                </div>
              )}
              <div className="product-name">{product.name}</div>
              <div className="product-footer">
                <span className="product-price">{product.price}</span>
                <span className="product-stock">{product.stock}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <aside className="pos-cart-sidebar">
        <div className="cart-header">
          <ShoppingBag size={18} />
          <span>Panier ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
        </div>
        
        {cart.length === 0 ? (
          <div className="cart-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--color-text-muted)' }}>
            {!isCaisseOpen ? "La caisse est fermée." : "Panier vide"}
          </div>
        ) : (
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.product.id} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.product.name}</div>
                  <div className="cart-item-price">{(item.product.priceValue * item.quantity).toLocaleString('fr-FR')} F</div>
                </div>
                <div className="cart-item-actions">
                  <div className="quantity-control">
                    <button className="qty-btn" onClick={() => updateQuantity(item.product.id, -1)}><Minus size={12} /></button>
                    <span className="qty-value">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.product.id, 1)}><Plus size={12} /></button>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.product.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="cart-footer" style={{ padding: '16px', borderTop: '1px solid var(--color-border)' }}>
          <div className="cart-discount" style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
            <select 
              className="discount-select" 
              disabled={!isCaisseOpen || cart.length === 0}
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
            >
              <option value="fcfa">Rémise (F)</option>
              <option value="percent">Rémise (%)</option>
            </select>
            <input 
              type="number" 
              className="discount-input" 
              placeholder="0" 
              disabled={!isCaisseOpen || cart.length === 0}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
            />
          </div>

          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" 
              id="tva-checkbox" 
              checked={applyTVA}
              onChange={(e) => setApplyTVA(e.target.checked)}
              disabled={!isCaisseOpen || cart.length === 0}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="tva-checkbox" style={{ fontSize: '0.9rem', color: 'var(--color-text)', cursor: 'pointer', userSelect: 'none' }}>
              Appliquer la TVA (18%)
            </label>
          </div>
          
          <div className="cart-summary" style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
              <span>Sous-total</span>
              <span>{subtotal.toLocaleString('fr-FR')} F</span>
            </div>
            {discountAmount > 0 && (
              <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger)' }}>
                <span>Réduction</span>
                <span>-{discountAmount.toLocaleString('fr-FR')} F</span>
              </div>
            )}
            {applyTVA && (
              <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                <span>TVA (18%)</span>
                <span>+{tvaAmount.toLocaleString('fr-FR')} F</span>
              </div>
            )}
            <div className="summary-row total" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--color-text)', marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--color-border)' }}>
              <span>Total à payer</span>
              <span>{total.toLocaleString('fr-FR')} F</span>
            </div>
          </div>
          
          <button 
            className={`btn-checkout ${!isCaisseOpen || cart.length === 0 ? 'disabled' : ''}`} 
            style={(isCaisseOpen && cart.length > 0) ? { backgroundColor: 'var(--color-primary)', color: 'white', cursor: 'pointer' } : {}}
            onClick={handleCheckout}
            disabled={!isCaisseOpen || cart.length === 0}
          >
            <CreditCard size={18} />
            Encaisser
          </button>
        </div>
      </aside>

      {/* Modal Ouverture de Caisse */}
      {isCaisseModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Ouverture de caisse</h3>
              <button className="close-btn" onClick={() => { setIsCaisseModalOpen(false); setCaisseError(''); }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleOpenCaisse} noValidate>
              <div className="modal-body">
                {caisseError && (
                  <div style={{ backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                    <AlertTriangle size={16} />
                    {caisseError}
                  </div>
                )}
                <div className="form-group">
                  <label>Ajouter montant disponible actuellement a la caisse (FCFA) *</label>
                  <input 
                    type="number" 
                    className={`form-input ${caisseError ? 'border-danger' : ''}`}
                    placeholder="Ex: 50000" 
                    value={caisseAmount}
                    onChange={(e) => {
                      setCaisseAmount(e.target.value);
                      if (e.target.value) setCaisseError('');
                    }}
                    min="0"
                  />
                </div>
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>Notes (Optionnel)</label>
                  <textarea 
                    className="form-input" 
                    placeholder="Informations supplémentaires..." 
                    style={{ minHeight: '60px', resize: 'vertical' }}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <Button type="button" variant="secondary" onClick={() => setIsCaisseModalOpen(false)} style={{ border: '1px solid var(--color-border)', backgroundColor: 'transparent' }}>Annuler</Button>
                <Button type="submit" variant="primary">Ouvrir la caisse</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Fermeture de Caisse */}
      {isCloseCaisseModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Fermeture de caisse</h3>
              <button className="close-btn" onClick={() => { setIsCloseCaisseModalOpen(false); setCloseCaisseError(''); }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCloseCaisse} noValidate>
              <div className="modal-body">
                {closeCaisseError && (
                  <div style={{ backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                    <AlertTriangle size={16} />
                    {closeCaisseError}
                  </div>
                )}
                <div className="form-group">
                  <label>Montant final en caisse (FCFA) *</label>
                  <input 
                    type="number" 
                    className={`form-input ${closeCaisseError ? 'border-danger' : ''}`}
                    placeholder="Ex: 150000" 
                    value={closeCaisseAmount}
                    onChange={(e) => {
                      setCloseCaisseAmount(e.target.value);
                      if (e.target.value) setCloseCaisseError('');
                    }}
                    min="0"
                  />
                </div>
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>Notes de clôture (Optionnel)</label>
                  <textarea 
                    className="form-input" 
                    placeholder="Écart de caisse, observations..." 
                    style={{ minHeight: '60px', resize: 'vertical' }}
                  ></textarea>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                  Ce montant sera enregistré pour votre récapitulatif de fin de journée.
                </p>
              </div>
              <div className="modal-footer">
                <Button type="button" variant="secondary" onClick={() => setIsCloseCaisseModalOpen(false)} style={{ border: '1px solid var(--color-border)', backgroundColor: 'transparent' }}>Annuler</Button>
                <Button type="submit" variant="primary" style={{ backgroundColor: 'var(--color-danger)' }}>Clôturer la caisse</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Paiement */}
      {isPaymentModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Encaissement</h3>
              <button className="close-btn" onClick={() => setIsPaymentModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '8px' }}>Total à payer</p>
                <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>{total.toLocaleString('fr-FR')} F</h2>
              </div>
              <div className="form-group">
                <label>Montant perçu (FCFA)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Ex: 30000" 
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(Number(e.target.value))}
                  min={total}
                />
              </div>
              <div className="form-group">
                <label>Mode de paiement</label>
                <select 
                  className="form-input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Espèces">Espèces</option>
                  <option value="Wave">Wave</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="Carte Bancaire">Carte Bancaire</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={() => setIsPaymentModalOpen(false)} style={{ border: '1px solid var(--color-border)', backgroundColor: 'transparent' }}>Annuler</Button>
              <Button variant="primary" onClick={confirmPayment}>Valider le paiement</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reçu */}
      {isReceiptModalOpen && receiptData && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <button className="close-btn" onClick={handleCloseReceipt} style={{ marginLeft: 'auto' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ paddingTop: 0, paddingBottom: '32px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle size={24} />
                </div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', color: 'var(--color-text)' }}>Paiement réussi !</h2>
                <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Ticket #{receiptData.id}</p>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
                <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '1px dashed #cbd5e1', paddingBottom: '16px' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem' }}>BIZFLOW ERP</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{new Date(receiptData.date).toLocaleString('fr-FR')}</p>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  {receiptData.cartItems.map((item: any, idx: number) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                      <span>{item.quantity}x {item.product.name}</span>
                      <span>{(item.quantity * item.product.priceValue).toLocaleString('fr-FR')} F</span>
                    </div>
                  ))}
                </div>
                
                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                    <span>SOUS-TOTAL</span>
                    <span>{receiptData.subtotal?.toLocaleString('fr-FR')} F</span>
                  </div>
                  {receiptData.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger)' }}>
                      <span>REMISE</span>
                      <span>-{receiptData.discount?.toLocaleString('fr-FR')} F</span>
                    </div>
                  )}
                  {receiptData.tva > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                      <span>TVA (18%)</span>
                      <span>+{receiptData.tva?.toLocaleString('fr-FR')} F</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '8px' }}>
                    <span>TOTAL TTC</span>
                    <span>{receiptData.amount.toLocaleString('fr-FR')} F</span>
                  </div>
                </div>
                
                <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '12px', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--color-text)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Montant perçu</span>
                    <span>{receiptData.tendered.toLocaleString('fr-FR')} F</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Monnaie rendue</span>
                    <span>{receiptData.change.toLocaleString('fr-FR')} F</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                  <span>Paiement</span>
                  <span>{receiptData.method}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                <Button variant="primary" onClick={() => { window.print(); }} style={{ width: '100%', justifyContent: 'center' }}>Imprimer le reçu</Button>
                <Button variant="secondary" onClick={handleCloseReceipt} style={{ width: '100%', justifyContent: 'center', border: '1px solid var(--color-border)', background: 'transparent' }}>Nouvelle vente</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="toast">
          <CheckCircle className="toast-icon" size={24} />
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-text)' }}>Succès</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Paiement validé avec succès !</p>
          </div>
        </div>
      )}
    </div>
  );
};
