import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AuthProvider } from './contexts/AuthContext';

import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminClients } from './pages/admin/AdminClients';
import { AdminAbonnements } from './pages/admin/AdminAbonnements';
import { AdminSettings } from './pages/admin/AdminSettings';

import { Dashboard } from './pages/Dashboard';
import { Clients } from './pages/Clients';
import { Facturation } from './pages/Facturation';
import { Abonnement } from './pages/Abonnement';
import { Ventes } from './pages/Ventes';
import { Devis } from './pages/Devis';
import { PointDeVente } from './pages/PointDeVente';
import { Inventaire } from './pages/Inventaire';
import { Fournisseurs } from './pages/Fournisseurs';
import { Rapports } from './pages/Rapports';
import { Parametres } from './pages/Parametres';

import { LandingPage } from './pages/LandingPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<Layout />}>
            <Route path="app" element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="ventes" element={<Ventes />} />
            <Route path="devis" element={<Devis />} />
            <Route path="pos" element={<PointDeVente />} />
            <Route path="inventaire" element={<Inventaire />} />
            <Route path="clients" element={<Clients />} />
            <Route path="fournisseurs" element={<Fournisseurs />} />
            <Route path="rapports" element={<Rapports />} />
            <Route path="facturation" element={<Facturation />} />
            <Route path="abonnement" element={<Abonnement />} />
            <Route path="parametres" element={<Parametres />} />
            {/* Add more routes here */}
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="abonnements" element={<AdminAbonnements />} />
            <Route path="parametres" element={<AdminSettings />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
