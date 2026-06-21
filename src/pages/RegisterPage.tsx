import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Store, ArrowLeft } from 'lucide-react';
import { settingsService } from '../services/apiService';
import './RegisterPage.css';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    password: '',
    commerceType: '',
    selectedProducts: [] as string[]
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

    try {
      // Save settings
      await settingsService.save({
        ownerName: formData.name,
        name: formData.company,
        commerceType: formData.commerceType,
        selectedProducts: formData.selectedProducts,
        email: formData.email,
      });
      // Registration successful
      navigate('/app');
    } catch (err: any) {
      setError("Erreur lors de l'inscription. Vérifiez la connexion à la base de données (DATABASE_URL sur Vercel).");
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
          <Link to="/" className="register-brand" style={{ textDecoration: 'none' }}>
            <div className="register-brand-icon">
              <Store size={28} />
            </div>
            <h1>BizFlow</h1>
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
          <button type="submit" className="register-btn">
            S'inscrire
          </button>
        </form>

        <div className="register-footer">
          Vous avez déjà un compte ? <Link to="/login">Connectez-vous</Link>
        </div>
      </div>
    </div>
  );
};
