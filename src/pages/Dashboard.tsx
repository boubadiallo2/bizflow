import React, { useState, useEffect } from 'react';
import { ShoppingCart, FileText, Banknote, AlertTriangle } from 'lucide-react';
import { Card } from '../components/Card';

import { productsService, salesService, invoicesService, expensesService, settingsService } from '../services/apiService';
import './Dashboard.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const [todayCA, setTodayCA] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [stockAlertsCount, setStockAlertsCount] = useState(0);
  const [topAlerts, setTopAlerts] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [unpaidInvoicesCount, setUnpaidInvoicesCount] = useState(0);
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [todayExpenses, setTodayExpenses] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      // 1. Process Sales
      let sales: any[] = [];
      try {
        sales = await salesService.getAll();
      } catch (e) {
        console.error('Erreur chargement ventes:', e);
      }
    
      // Load Invoices
      let invoices: any[] = [];
      try {
        invoices = await invoicesService.getAll();
      } catch (e) {
        console.error('Erreur chargement factures:', e);
      }

      const todayStr = new Date().toISOString().split('T')[0];
    
      let ca = 0;
      let orders = 0;
      let unpaidCount = 0;
      const dailyStats: Record<string, number> = {};
    
      // Initialize last 7 days for the chart
      for(let i=6; i>=0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dayStr = d.toISOString().split('T')[0];
          dailyStats[dayStr] = 0;
      }
    
      // Add sales to stats
      sales.forEach((s: any) => {
          const saleDate = s.date.split('T')[0];
          if (saleDate === todayStr) {
              ca += s.amount;
              orders++;
          }
          if (dailyStats[saleDate] !== undefined) {
              dailyStats[saleDate] += s.amount;
          }
      });

      // Add paid invoices to stats, count unpaid
      invoices.forEach((inv: any) => {
          if (inv.status !== 'Payée') {
              unpaidCount++;
          } else {
              // Si la facture est payée, on l'ajoute au CA (en supposant createdAt ou date pour la date)
              const invDate = (inv.createdAt || inv.date || new Date().toISOString()).split('T')[0];
              if (invDate === todayStr) {
                  ca += inv.totalTTC || inv.amount || 0;
              }
              if (dailyStats[invDate] !== undefined) {
                  dailyStats[invDate] += inv.totalTTC || inv.amount || 0;
              }
          }
      });
    
      setTodayCA(ca);
      setTodayOrders(orders);
      setUnpaidInvoicesCount(unpaidCount);
    
      setTodayCA(ca);
      setTodayOrders(orders);
    
      const newChartData = Object.keys(dailyStats).map(dateStr => {
          const d = new Date(dateStr);
          return {
              name: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
              ventes: dailyStats[dateStr]
          };
      });
      setChartData(newChartData);

      // Check Enterprise and Expenses
      try {
          const settings = await settingsService.get();
          if (settings?.subscription === 'Enterprise') {
              setIsEnterprise(true);
              const allExpenses = await expensesService.getAll();
              let expToday = 0;
              allExpenses.forEach((exp: any) => {
                  if (exp.date.split('T')[0] === todayStr) {
                      expToday += exp.amount || 0;
                  }
              });
              setTodayExpenses(expToday);
          }
      } catch (e) {
          console.error('Erreur chargement expenses:', e);
      }
    
      // 2. Process Inventory Alerts
      try {
          const inventory = await productsService.getAll();
          const alerts = inventory.filter((p: any) => p.stock <= p.minStock);
          setStockAlertsCount(alerts.length);
          setTopAlerts(alerts.slice(0, 3));
      } catch (e) {
          console.error('Erreur chargement inventaire:', e);
      }
    };
    loadData();
  }, []);

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h2>Tableau de bord</h2>
          <p className="text-muted text-sm mt-1">Vue d'ensemble de votre activité</p>
        </div>
      </div>

      <div className="dashboard-filters">
        <select className="filter-select" defaultValue="today">
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois-ci</option>
          <option value="year">Cette année</option>
          <option value="custom">Période personnalisée...</option>
        </select>
        
        <select className="filter-select" defaultValue="all">
          <option value="all">Toutes les succursales</option>
          <option value="main">Boutique Principale</option>
          <option value="annex">Annexe Sud</option>
        </select>
      </div>

      <div className="stats-grid">
        <Card className="stat-card bg-primary-light">
          <div className="stat-header">
            <span className="stat-title text-muted">CA DU JOUR</span>
            <div className="stat-icon bg-white text-primary rounded-full">
              <Banknote size={20} />
            </div>
          </div>
          <div className="stat-value">{todayCA.toLocaleString('fr-FR')} F</div>
        </Card>

        {isEnterprise && (
          <Card className="stat-card" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <div className="stat-header">
              <span className="stat-title text-success" style={{ fontWeight: 'bold' }}>BÉNÉFICE NET</span>
              <div className="stat-icon bg-white text-success rounded-md">
                <Banknote size={18} />
              </div>
            </div>
            <div className="stat-value text-success">{(todayCA - todayExpenses).toLocaleString('fr-FR')} F</div>
            <div className="stat-footer text-muted text-sm" style={{ marginTop: '4px' }}>CA - Dépenses ({todayExpenses.toLocaleString()} F)</div>
          </Card>
        )}
        
        <Card className="stat-card">
          <div className="stat-header">
            <span className="stat-title text-muted">COMMANDES</span>
            <div className="stat-icon bg-bg text-muted rounded-md">
              <ShoppingCart size={18} />
            </div>
          </div>
          <div className="stat-value">{todayOrders}</div>
          <div className="stat-footer text-muted text-sm">→ aujourd'hui</div>
        </Card>

        <Card className="stat-card">
          <div className="stat-header">
            <span className="stat-title text-muted">FACTURES IMPAYÉES</span>
            <div className="stat-icon bg-bg text-muted rounded-md">
              <FileText size={18} />
            </div>
          </div>
          <div className="stat-value">{unpaidInvoicesCount}</div>
        </Card>

        <Card className="stat-card bg-danger-light border-danger">
          <div className="stat-header">
            <span className="stat-title text-danger">ALERTES STOCK</span>
            <div className="stat-icon bg-white text-danger rounded-md">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="stat-value text-danger">{stockAlertsCount}</div>
        </Card>
      </div>

      <div className="dashboard-content">
        <Card className="chart-card">
          <div className="card-title flex items-center gap-2 mb-6">
            <Banknote size={18} className="text-primary" />
            <h3 className="font-semibold">Ventes sur 7 jours</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Line type="monotone" dataKey="ventes" stroke="#14b885" strokeWidth={2} dot={{ r: 4, fill: '#14b885' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="alerts-card">
          <div className="card-title flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-warning" />
            <h3 className="font-semibold">Alertes stock</h3>
          </div>
          <div className="alerts-list">
            {topAlerts.length === 0 ? (
              <div className="text-muted text-sm">Aucune alerte stock !</div>
            ) : (
              topAlerts.map(alert => (
                <div key={alert.id} className="alert-item">
                  <span className="alert-name">{alert.name}</span>
                  <span className="alert-badge bg-danger text-white rounded-md px-2 py-1 text-sm font-semibold">{alert.stock}/{alert.minStock}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
