import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { authService } from '../services/apiService';
import './RegisterPage.css';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
    commerceType: '',
    phone: '',
    city: '',
    address: '',
    country: 'sn',
    selectedProducts: [] as string[]
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const selectedPlan = searchParams.get('plan') || 'Starter';
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

  const commerceOptions: Record<string, string[]> = {
    'Alimentation / Supermarché': ['Produits frais', 'Boissons', 'Épicerie', 'Surgelés', 'Boulangerie'],
    'Boutique de vêtements': ['Vêtements Homme', 'Vêtements Femme', 'Enfants', 'Accessoires', 'Chaussures'],
    'Électronique / Informatique': ['Smartphones', 'Ordinateurs', 'Accessoires PC', 'Électroménager'],
    'Pharmacie': ['Médicaments', 'Parapharmacie', 'Matériel médical', 'Soins'],
    'Restauration': ['Plats chauds', 'Boissons', 'Desserts', 'Entrées'],
    'Quincaillerie': ['Outils', 'Matériaux', 'Peinture', 'Électricité', 'Plomberie'],
    'Beauté & Cosmétiques': ['Maquillage', 'Soins du corps', 'Parfums', 'Accessoires'],
    'Optique / Lunetterie': ['Lunettes de vue', 'Lunettes de soleil', 'Lentilles', 'Montures', 'Produits d\'entretien'],
    'Autre': ['Divers']
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    if (id === 'commerceType') {
      setFormData({
        ...formData,
        commerceType: value,
        selectedProducts: [] // reset product selection when changing type
      });
    } else {
      setFormData({
        ...formData,
        [id]: value
      });
    }
  };

  const toggleProduct = (product: string) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.includes(product)
        ? prev.selectedProducts.filter(p => p !== product)
        : [...prev.selectedProducts, product]
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.company || !formData.email || !formData.password || !formData.commerceType) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (formData.selectedProducts.length === 0) {
      setError('Veuillez sélectionner au moins un type de produit correspondant à votre commerce.');
      return;
    }
    setStep(2);
  };

  const handleFinalSubmit = async () => {
    if (!selectedPaymentMethod) return;

    setLoading(true);
    try {
      await authService.register({
        name: formData.name,
        company: formData.company,
        commerceType: formData.commerceType,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        country: formData.country,
        selectedProducts: formData.selectedProducts,
        paymentMethod: selectedPaymentMethod,
        subscription: selectedPlan
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <Link to="/" className="back-home-link" style={{ position: 'absolute', top: '32px', left: '32px', display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', textDecoration: 'none', fontWeight: 500 }}>
        <ArrowLeft size={20} />
        Retour à l'accueil
      </Link>
      <div className="register-card">
        <div className="register-header">
          <Link to="/" className="register-brand" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
            <img src="/logo.png" alt="Nexora" style={{ height: '48px' }} />
          </Link>
          <h2 className="register-title">Créez votre compte</h2>
          <p className="register-subtitle">Commencez à gérer votre entreprise dès aujourd'hui</p>
        </div>

        {error && <div className="register-error">{error}</div>}

        {step === 1 ? (
          <form className="register-form" onSubmit={handleRegister} noValidate>
          <div className="form-group">
            <label htmlFor="name">Nom complet</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Boubacar Diallo"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="company">Nom de l'entreprise</label>
            <input
              type="text"
              id="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Ex: Diallo Boutique"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Adresse e-mail</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ex: boudiallo20@gmail.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="commerceType">Type de commerce</label>
            <select
              id="commerceType"
              value={formData.commerceType}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Sélectionnez votre type d'activité</option>
              {Object.keys(commerceOptions).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {formData.commerceType && commerceOptions[formData.commerceType] && (
            <div className="form-group">
              <label>Types de produits correspondants</label>
              <p className="register-subtitle" style={{ fontSize: '0.8rem', margin: '0' }}>
                Sélectionnez les produits que vous vendez :
              </p>
              <div className="product-tags">
                {commerceOptions[formData.commerceType].map(product => (
                  <div
                    key={product}
                    className={`product-tag ${formData.selectedProducts.includes(product) ? 'selected' : ''}`}
                    onClick={() => toggleProduct(product)}
                  >
                    {product}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="country">Pays</label>
              <select
                id="country"
                value={formData.country}
                onChange={handleChange}
                required
              >
                <option value="sn">Sénégal</option>
                <option value="ml">Mali</option>
                <option value="ci">Côte d'Ivoire</option>
                <option value="gn">Guinée</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="city">Ville</label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Ex: Dakar"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Téléphone</label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Ex: 77 000 00 00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Adresse</label>
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Ex: 123 Rue de la République"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'Traitement...' : 'Continuer vers le paiement'}
          </button>
        </form>
        ) : (
          <div className="payment-step" style={{ padding: '1rem 0' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#1f2937', fontSize: '1.4rem' }}>Mode de paiement</h3>
            <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '2rem', fontSize: '0.95rem' }}>Sélectionnez votre méthode de paiement pour l'abonnement {selectedPlan}</p>
            
            <div className="payment-options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
              <div 
                onClick={() => setSelectedPaymentMethod('Wave')}
                style={{ border: selectedPaymentMethod === 'Wave' ? '2px solid #10b981' : '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s', backgroundColor: selectedPaymentMethod === 'Wave' ? '#f0fdf4' : 'transparent' }}
              >
                <div style={{ backgroundColor: '#1ba6e6', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem' }}>Wave</div>
                <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 500 }}>Paiement Wave</span>
              </div>
              
              <div 
                onClick={() => setSelectedPaymentMethod('Orange Money')}
                style={{ border: selectedPaymentMethod === 'Orange Money' ? '2px solid #10b981' : '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s', backgroundColor: selectedPaymentMethod === 'Orange Money' ? '#f0fdf4' : 'transparent' }}
              >
                <div style={{ backgroundColor: '#ff6600', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem' }}>Orange Money</div>
                <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 500 }}>Paiement OM</span>
              </div>

              <div 
                onClick={() => setSelectedPaymentMethod('Free Money')}
                style={{ border: selectedPaymentMethod === 'Free Money' ? '2px solid #10b981' : '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s', backgroundColor: selectedPaymentMethod === 'Free Money' ? '#f0fdf4' : 'transparent' }}
              >
                <div style={{ backgroundColor: '#e50000', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem' }}>Free Money</div>
                <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 500 }}>Paiement Free</span>
              </div>

              <div 
                onClick={() => setSelectedPaymentMethod('Carte Bancaire')}
                style={{ border: selectedPaymentMethod === 'Carte Bancaire' ? '2px solid #10b981' : '1px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s', backgroundColor: selectedPaymentMethod === 'Carte Bancaire' ? '#f0fdf4' : 'transparent' }}
              >
                <div style={{ backgroundColor: '#1e3a8a', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem' }}>VISA / MC</div>
                <span style={{ fontSize: '0.9rem', color: '#4b5563', fontWeight: 500 }}>Carte Bancaire</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" onClick={() => setStep(1)} style={{ flex: 1, padding: '0.85rem', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151', fontWeight: 500, cursor: 'pointer' }}>
                Retour
              </button>
              <button 
                type="button" 
                onClick={handleFinalSubmit} 
                disabled={!selectedPaymentMethod || loading} 
                style={{ flex: 2, padding: '0.85rem', borderRadius: '8px', backgroundColor: '#10b981', color: 'white', border: 'none', fontWeight: 600, cursor: (!selectedPaymentMethod || loading) ? 'not-allowed' : 'pointer', opacity: (!selectedPaymentMethod || loading) ? 0.7 : 1 }}
              >
                {loading ? 'Finalisation...' : 'Terminer l\'inscription'}
              </button>
            </div>
          </div>
        )}

        <div className="register-footer">
          Vous avez déjà un compte ? <Link to="/login">Connectez-vous</Link>
        </div>
      </div>
    </div>
  );
};
