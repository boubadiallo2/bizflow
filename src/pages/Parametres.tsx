import React, { useState, useRef, useEffect } from 'react';
import { Settings, Building2, Upload, X, ImageIcon } from 'lucide-react';
import { Button } from '../components/Button';
import { settingsService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import './Parametres.css';

export const Parametres: React.FC = () => {
  const { name } = useAuth();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [logoSaved, setLogoSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    name: name || '',
    commerceType: '',
    country: 'sn',
    city: '',
    phone: '',
    email: '',
    address: '',
    rccm: '',
    ninea: '',
    slogan: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsService.get();
        if (data) {
          if (data.logo) setLogoPreview(data.logo);
          setCompanyInfo(prev => ({
            ...prev,
            name: data.name || prev.name,
            commerceType: data.commerceType || prev.commerceType,
            country: data.country || prev.country,
            city: data.city || prev.city,
            phone: data.phone || prev.phone,
            email: data.email || prev.email,
            address: data.address || prev.address,
            rccm: data.rccm || '',
            ninea: data.ninea || '',
            slogan: data.slogan || ''
          }));
        }
      } catch (e) {
        console.error('Erreur chargement paramètres:', e);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await settingsService.save({ ...companyInfo, logo: logoPreview });
      alert('Paramètres enregistrés avec succès !');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'enregistrement des paramètres.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image (PNG, JPG, SVG, etc.)');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Taille maximale : 2 Mo');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setLogoPreview(base64);
      try {
        await settingsService.save({ ...companyInfo, logo: base64 });
        localStorage.setItem('company_logo', base64);
        setLogoSaved(true);
        setTimeout(() => setLogoSaved(false), 3000);
        window.dispatchEvent(new Event('logo-updated'));
      } catch (err) {
        console.error(err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleLogoChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleLogoChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeLogo = async () => {
    setLogoPreview(null);
    localStorage.removeItem('company_logo');
    try {
      await settingsService.save({ ...companyInfo, logo: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
      window.dispatchEvent(new Event('logo-updated'));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="parametres-container">
      <div className="parametres-header">
        <div className="parametres-header-title">
          <Settings size={28} className="text-primary" />
          <h2>Paramètres</h2>
        </div>
        <p className="text-muted text-sm">Configurez votre entreprise</p>
      </div>

      {/* Logo Upload Card */}
      <div className="settings-card logo-card">
        <div className="settings-section-title">
          <ImageIcon size={20} className="text-muted" />
          Logo de l'entreprise
        </div>

        <div className="logo-upload-area">
          <div className="logo-preview-wrapper">
            {logoPreview ? (
              <div className="logo-preview-container">
                <img src={logoPreview} alt="Logo entreprise" className="logo-preview-img" />
                <button className="logo-remove-btn" onClick={removeLogo} title="Supprimer le logo">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="logo-placeholder">
                <ImageIcon size={32} strokeWidth={1.5} />
              </div>
            )}
          </div>

          <div className="logo-upload-content">
            <div
              className={`logo-dropzone ${isDragging ? 'dragging' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={24} className="dropzone-icon" />
              <p className="dropzone-text">
                <span className="dropzone-link">Cliquez pour choisir</span> ou glissez-déposez
              </p>
              <p className="dropzone-hint">PNG, JPG ou SVG • Max 2 Mo</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden-input"
            />
            {logoSaved && (
              <div className="logo-saved-toast">
                ✓ Logo enregistré avec succès
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company Info Card */}
      <div className="settings-card">
        <div className="settings-section-title">
          <Building2 size={20} className="text-muted" />
          Informations de l'entreprise
        </div>
        
        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nom de l'entreprise</label>
            <input 
              type="text" 
              name="name"
              className="form-input" 
              value={companyInfo.name} 
              onChange={handleChange}
              placeholder="Ex: Mon Entreprise"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type de commerce</label>
              <input 
                type="text" 
                className="form-input" 
                value={companyInfo.commerceType} 
                readOnly 
                style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-muted)' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pays</label>
              <select name="country" className="form-select" value={companyInfo.country} onChange={handleChange}>
                <option value="sn">Sénégal</option>
                <option value="ml">Mali</option>
                <option value="ci">Côte d'Ivoire</option>
                <option value="gn">Guinée</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ville</label>
            <input 
              type="text" 
              name="city"
              className="form-input" 
              value={companyInfo.city} 
              onChange={handleChange}
              placeholder="Ex: Dakar"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Téléphone</label>
            <input 
              type="tel" 
              name="phone"
              className="form-input" 
              value={companyInfo.phone} 
              onChange={handleChange}
              placeholder="Ex: 77 000 00 00"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              name="email"
              className="form-input" 
              value={companyInfo.email} 
              onChange={handleChange}
              placeholder="Ex: contact@monentreprise.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Adresse</label>
            <input 
              type="text" 
              name="address"
              className="form-input" 
              value={companyInfo.address} 
              onChange={handleChange}
              placeholder="Ex: 123 Rue de la République"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">RCCM</label>
              <input 
                type="text" 
                name="rccm"
                className="form-input" 
                value={companyInfo.rccm} 
                onChange={handleChange}
                placeholder="Ex: SN.DKR.2026.B.1234"
              />
            </div>
            <div className="form-group">
              <label className="form-label">NINEA</label>
              <input 
                type="text" 
                name="ninea"
                className="form-input" 
                value={companyInfo.ninea} 
                onChange={handleChange}
                placeholder="Ex: 000000000"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Slogan de la facture</label>
            <input 
              type="text" 
              name="slogan"
              className="form-input" 
              value={companyInfo.slogan} 
              onChange={handleChange}
              placeholder="Ex: La vue est chère mais pas les lunettes"
            />
          </div>

          <div className="form-actions">
            <Button variant="primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
