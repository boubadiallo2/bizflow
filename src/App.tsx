import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionGuard } from './components/SubscriptionGuard';

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
import { Depenses } from './pages/Depenses';
import { Users } from './pages/Users';

import { LandingPage } from './pages/LandingPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ContactPage } from './pages/ContactPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route element={<Layout />}>
            <Route path="app" element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="ventes" element={<Ventes />} />
            <Route path="devis" element={
              <SubscriptionGuard allowedSubscriptions={['Business', 'Enterprise']}>
                <Devis />
              </SubscriptionGuard>
            } />
            <Route path="pos" element={<PointDeVente />} />
            <Route path="inventaire" element={<Inventaire />} />
            <Route path="clients" element={<Clients />} />
            <Route path="fournisseurs" element={
              <SubscriptionGuard allowedSubscriptions={['Business', 'Enterprise']}>
                <Fournisseurs />
              </SubscriptionGuard>
            } />
            <Route path="rapports" element={
              <SubscriptionGuard allowedSubscriptions={['Business', 'Enterprise']}>
                <Rapports />
              </SubscriptionGuard>
            } />
            <Route path="facturation" element={
              <SubscriptionGuard allowedSubscriptions={['Business', 'Enterprise']}>
                <Facturation />
              </SubscriptionGuard>
            } />
            <Route path="abonnement" element={<Abonnement />} />
            <Route path="depenses" element={
              <SubscriptionGuard allowedSubscriptions={['Enterprise']}>
                <Depenses />
              </SubscriptionGuard>
            } />
            <Route path="users" element={
              <SubscriptionGuard allowedSubscriptions={['Business', 'Enterprise']}>
                <Users />
              </SubscriptionGuard>
            } />
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
