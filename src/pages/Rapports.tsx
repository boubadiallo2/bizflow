import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, ShoppingBag, CreditCard, Users, X } from 'lucide-react';
import { Button } from '../components/Button';
import { salesService, settingsService } from '../services/apiService';
import html2pdf from 'html2pdf.js';
import './Rapports.css';

export const Rapports: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [period, setPeriod] = useState('today');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  const [exportConfig, setExportConfig] = useState({
    openingHour: '08:00',
    closingHour: '20:00'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesData, settingsData] = await Promise.all([
          salesService.getAll(),
          settingsService.get()
        ]);
        setSales(salesData);
        setSettings(settingsData);
      } catch (err) {
        console.error("Erreur de chargement des données", err);
      }
    };
    fetchData();
  }, []);

  const filterSales = (periodType: string) => {
    const now = new Date();
    return sales.filter(s => {
      const saleDate = new Date(s.date);
      if (periodType === 'today') {
        return saleDate.toDateString() === now.toDateString();
      } else if (periodType === 'month') {
        return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
      } else if (periodType === 'year') {
        return saleDate.getFullYear() === now.getFullYear();
      } else if (periodType === 'week') {
        const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        return saleDate >= firstDayOfWeek;
      }
      return true;
    });
  };

  const filteredSales = filterSales(period);
  const totalAmount = filteredSales.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
  const totalTransactions = filteredSales.length;

  const handleExportPDF = () => {
    const reportSales = filterSales(period);
    const total = reportSales.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
    
    let periodText = '';
    if (period === 'today') periodText = 'du jour';
    else if (period === 'month') periodText = 'du mois';
    else if (period === 'year') periodText = 'de l\\'année';
    else if (period === 'week') periodText = 'de la semaine';

    const element = document.createElement('div');
    element.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          ${settings?.logo ? `<img src="${settings.logo}" style="max-height: 80px; margin-bottom: 10px;" />` : ''}
          <h1 style="font-size: 24px; margin: 0;">${settings?.name || 'Notre Boutique'}</h1>
          <p style="margin: 5px 0; color: #666;">${settings?.address || ''}</p>
          <p style="margin: 5px 0; font-size: 14px;">Heures d'ouverture : ${exportConfig.openingHour} - ${exportConfig.closingHour}</p>
        </div>
        
        <h2 style="font-size: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px;">
          Rapport des ventes ${periodText}
        </h2>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; flex: 1; margin-right: 15px;">
            <div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Total Ventes</div>
            <div style="font-size: 24px; font-weight: bold;">${total.toLocaleString('fr-FR')} F</div>
          </div>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; flex: 1;">
            <div style="font-size: 12px; color: #64748b; text-transform: uppercase;">Transactions</div>
            <div style="font-size: 24px; font-weight: bold;">${reportSales.length}</div>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="padding: 12px; text-align: left; border-bottom: 1px solid #cbd5e1;">Date & Heure</th>
              <th style="padding: 12px; text-align: left; border-bottom: 1px solid #cbd5e1;">Ticket N°</th>
              <th style="padding: 12px; text-align: left; border-bottom: 1px solid #cbd5e1;">Méthode</th>
              <th style="padding: 12px; text-align: right; border-bottom: 1px solid #cbd5e1;">Montant</th>
            </tr>
          </thead>
          <tbody>
            ${reportSales.map(s => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${new Date(s.date).toLocaleString()}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${s.ticketId}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">${s.method || 'Espèces'}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: right; font-weight: 500;">${Number(s.amount).toLocaleString('fr-FR')} F</td>
              </tr>
            `).join('')}
            ${reportSales.length === 0 ? '<tr><td colspan="4" style="padding: 20px; text-align: center; color: #64748b;">Aucune vente pour cette période.</td></tr>' : ''}
          </tbody>
        </table>
        
        <div style="margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center;">
          Document généré le ${new Date().toLocaleString('fr-FR')}
        </div>
      </div>
    `;

    html2pdf().from(element).set({
      margin: 10,
      filename: \`rapport_ventes_\${period}.pdf\`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save();
    
    setIsExportModalOpen(false);
  };

  return (
    <div className="rapports-container">
      <div className="rapports-header">
        <div>
          <h2>Rapports de ventes</h2>
          <p className="text-muted text-sm mt-1">Analyse et export de vos performances</p>
        </div>
        <div className="header-controls">
          <select className="period-select" value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          <Button variant="primary" icon={<Download size={16} />} onClick={() => setIsExportModalOpen(true)}>
            Exporter PDF
          </Button>
        </div>
      </div>

      <div className="stats-row">
        <div className="report-stat-card">
          <div className="report-stat-icon icon-green">
            <TrendingUp size={24} />
          </div>
          <div className="report-stat-content">
            <h3>CA Période</h3>
            <div className="stat-value">{totalAmount.toLocaleString('fr-FR')} F</div>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon icon-green">
            <ShoppingBag size={24} />
          </div>
          <div className="report-stat-content">
            <h3>Ventes POS</h3>
            <div className="stat-value">{totalAmount.toLocaleString('fr-FR')} F</div>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon icon-orange">
            <CreditCard size={24} />
          </div>
          <div className="report-stat-content">
            <h3>Transactions</h3>
            <div className="stat-value">{totalTransactions}</div>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon icon-blue">
            <Users size={24} />
          </div>
          <div className="report-stat-content">
            <h3>Vendeurs Actifs</h3>
            <div className="stat-value">1</div>
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h4>Historique des ventes ({period})</h4>
          <div className="chart-empty-state">
            {filteredSales.length === 0 ? "Aucune donnée pour cette période" : 
              <div style={{ width: '100%', padding: '0 20px', maxHeight: '250px', overflowY: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Date</th>
                      <th style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Ticket</th>
                      <th style={{ padding: '8px', borderBottom: '1px solid #eee' }}>Montant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSales.slice(0, 10).map(s => (
                      <tr key={s.id}>
                        <td style={{ padding: '8px', borderBottom: '1px solid #f8fafc', fontSize: '14px' }}>{new Date(s.date).toLocaleDateString()}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #f8fafc', fontSize: '14px' }}>{s.ticketId}</td>
                        <td style={{ padding: '8px', borderBottom: '1px solid #f8fafc', fontSize: '14px', fontWeight: '500' }}>{Number(s.amount).toLocaleString('fr-FR')} F</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
        
        <div className="chart-card">
          <h4>Modes de paiement</h4>
          <div className="chart-empty-state">
             {filteredSales.length === 0 ? "Aucune donnée" : "Données disponibles"}
          </div>
        </div>
      </div>

      {isExportModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Options d'exportation PDF</h3>
              <button className="close-btn" onClick={() => setIsExportModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Heure d'ouverture de la boutique</label>
                <input 
                  type="time" 
                  className="form-input" 
                  value={exportConfig.openingHour}
                  onChange={e => setExportConfig({...exportConfig, openingHour: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Heure de fermeture de la boutique</label>
                <input 
                  type="time" 
                  className="form-input" 
                  value={exportConfig.closingHour}
                  onChange={e => setExportConfig({...exportConfig, closingHour: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={() => setIsExportModalOpen(false)}>Annuler</Button>
              <Button variant="primary" icon={<Download size={16} />} onClick={handleExportPDF}>Télécharger</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
