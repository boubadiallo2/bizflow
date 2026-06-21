import React, { useState, useRef, useEffect } from 'react';
import { Settings, Building2, Upload, X, ImageIcon } from 'lucide-react';
import { Button } from '../components/Button';
import { settingsService } from '../services/apiService';
import './Parametres.css';

export const Parametres: React.FC = () => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [logoSaved, setLogoSaved] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Boubacar Diallo',
    commerceType: 'restaurant',
    country: 'sn',
    city: 'Dakar',
    phone: '773858381',
    email: 'Boudiallo20@gmail.com',
    address: 'Dakar'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load from Firebase
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
          }));
        }
      } catch (e) {
        console.error('Erreur chargement paramètres:', e);
      }
    };
    loadSettings();
  }, []);

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
      // Save to Firebase
      await settingsService.save({ ...companyInfo, logo: base64 });
      // Also keep in localStorage for Sidebar real-time update
      localStorage.setItem('company_logo', base64);
      setLogoSaved(true);
      setTimeout(() => setLogoSaved(false), 3000);
      window.dispatchEvent(new Event('logo-updated'));
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
    await settingsService.save({ ...companyInfo, logo: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.dispatchEvent(new Event('logo-updated'));
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
        
        <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label className="form-label">Nom de l'entreprise</label>
            <input 
              type="text" 
              className="form-input" 
              defaultValue="Boubacar Diallo" 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Type de commerce</label>
              <select className="form-select" defaultValue="restaurant">
                <option value="restaurant">Restaurant</option>
                <option value="retail">Boutique / Détail</option>
                <option value="services">Services</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Pays</label>
              <select className="form-select" defaultValue="sn">
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
              className="form-input" 
              defaultValue="Dakar" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Téléphone</label>
            <input 
              type="tel" 
              className="form-input" 
              defaultValue="773858381" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-input" 
              defaultValue="Boudiallo20@gmail.com" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Adresse</label>
            <input 
              type="text" 
              className="form-input" 
              defaultValue="Dakar" 
            />
          </div>

          <div className="form-actions">
            <Button variant="primary" type="submit">Enregistrer les modifications</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
