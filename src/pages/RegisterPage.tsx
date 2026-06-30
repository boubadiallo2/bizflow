import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { authService } from '../services/apiService';
import Swal from 'sweetalert2';
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

    const { value: method } = await Swal.fire({
      title: 'Moyen de paiement',
      text: 'Veuillez configurer votre moyen de paiement par défaut pour la plateforme',
      input: 'select',
      inputOptions: {
        'Wave': 'Wave',
        'Orange Money': 'Orange Money',
        'Carte Bancaire': 'Carte Bancaire',
        'Chèque': 'Chèque',
        'Virement': 'Virement'
      },
      inputPlaceholder: 'Sélectionner un moyen de paiement',
      showCancelButton: true,
      confirmButtonText: 'Terminer l\'inscription',
      cancelButtonText: 'Annuler',
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-secondary',
        popup: 'swal-nexora-popup'
      }
    });

    if (!method) {
      return; // Annulé par l'utilisateur
    }

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
        paymentMethod: method,
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
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>

        <div className="register-footer">
          Vous avez déjà un compte ? <Link to="/login">Connectez-vous</Link>
        </div>
      </div>
    </div>
  );
};
