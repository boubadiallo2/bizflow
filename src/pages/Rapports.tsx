import React from 'react';
import { Download, TrendingUp, ShoppingBag, CreditCard, Users } from 'lucide-react';
import { Button } from '../components/Button';
import './Rapports.css';

export const Rapports: React.FC = () => {
  return (
    <div className="rapports-container">
      <div className="rapports-header">
        <div>
          <h2>Rapports de ventes</h2>
          <p className="text-muted text-sm mt-1">Analyse et export de vos performances</p>
        </div>
        <div className="header-controls">
          <select className="period-select">
            <option value="today">Aujourd'hui</option>
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          <Button variant="primary" icon={<Download size={16} />}>
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
            <h3>CA Global</h3>
            <div className="stat-value">0 F</div>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon icon-green">
            <ShoppingBag size={24} />
          </div>
          <div className="report-stat-content">
            <h3>Ventes POS</h3>
            <div className="stat-value">0 F</div>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon icon-orange">
            <CreditCard size={24} />
          </div>
          <div className="report-stat-content">
            <h3>Transactions</h3>
            <div className="stat-value">0</div>
          </div>
        </div>

        <div className="report-stat-card">
          <div className="report-stat-icon icon-blue">
            <Users size={24} />
          </div>
          <div className="report-stat-content">
            <h3>Vendeurs Actifs</h3>
            <div className="stat-value">-</div>
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h4>Évolution des ventes POS — Aujourd'hui</h4>
          <div className="chart-empty-state">
            Aucune donnée pour cette période
          </div>
        </div>
        
        <div className="chart-card">
          <h4>Modes de paiement</h4>
          <div className="chart-empty-state">
            Aucune donnée
          </div>
        </div>
      </div>
    </div>
  );
};
