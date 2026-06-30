import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CreditCard, Building2, TrendingUp, ArrowUpRight } from 'lucide-react';
import { adminTenantsService } from '../../services/apiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';

const mockRevenueData = [
  { name: 'Jan', value: 120000 },
  { name: 'Fév', value: 150000 },
  { name: 'Mar', value: 180000 },
  { name: 'Avr', value: 250000 },
  { name: 'Mai', value: 420000 },
  { name: 'Juin', value: 580000 },
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    mrr: 0,
    activeClients: 0,
    proSubscriptions: 0,
    totalUsers: 0,
    recentClients: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminTenantsService.getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h1>Vue d'ensemble</h1>
        <p>Surveillez l'activité et la croissance de la plateforme Nexora.</p>
      </div>

      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Revenu Mensuel (MRR)</span>
            <div className="admin-kpi-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="admin-kpi-value">{loading ? '...' : `${stats.mrr.toLocaleString('fr-FR')} F`}</div>
          <div className="admin-kpi-trend positive">
            <ArrowUpRight size={16} />
            <span>Basé sur abonnements actifs</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Clients Actifs</span>
            <div className="admin-kpi-icon" style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
              <Building2 size={24} />
            </div>
          </div>
          <div className="admin-kpi-value">{loading ? '...' : stats.activeClients}</div>
          <div className="admin-kpi-trend positive">
            <ArrowUpRight size={16} />
            <span>Entreprises créées</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Abonnements Pro</span>
            <div className="admin-kpi-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
              <CreditCard size={24} />
            </div>
          </div>
          <div className="admin-kpi-value">{loading ? '...' : stats.proSubscriptions}</div>
          <div className="admin-kpi-trend neutral">
            <ArrowUpRight size={16} />
            <span>Pro & Enterprise</span>
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-title">Utilisateurs Totaux</span>
            <div className="admin-kpi-icon" style={{ backgroundColor: '#ffedd5', color: '#ea580c' }}>
              <Users size={24} />
            </div>
          </div>
          <div className="admin-kpi-value">{loading ? '...' : stats.totalUsers}</div>
          <div className="admin-kpi-trend positive">
            <ArrowUpRight size={16} />
            <span>Inscrits sur la plateforme</span>
          </div>
        </div>
      </div>

      <div className="admin-content-grid">
        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2>Croissance des revenus</h2>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip 
                  formatter={(value: any) => [`${value.toLocaleString('fr-FR')} F`, 'Revenu']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#bfdbfe" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <h2>Récents abonnements</h2>
            <button 
              onClick={() => navigate('/admin/abonnements')}
              style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '500', cursor: 'pointer' }}
            >
              Voir tout
            </button>
          </div>
          <div className="admin-recent-list">
            {loading ? (
              <p style={{ padding: '1rem', color: '#6b7280' }}>Chargement des clients...</p>
            ) : stats.recentClients.length === 0 ? (
              <p style={{ padding: '1rem', color: '#6b7280' }}>Aucun client récent</p>
            ) : (
              stats.recentClients.map((client: any) => (
                <div key={client.id} className="admin-recent-item">
                  <div className="admin-recent-info">
                    <div className="admin-recent-avatar">{client.initial}</div>
                    <div className="admin-recent-details">
                      <h4>{client.name}</h4>
                      <p>{client.owner}</p>
                    </div>
                  </div>
                  <div className="admin-recent-plan">
                    <span className={`admin-plan-badge ${client.plan.toLowerCase()}`}>
                      {client.plan}
                    </span>
                    <div className="admin-recent-date">{client.date}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
