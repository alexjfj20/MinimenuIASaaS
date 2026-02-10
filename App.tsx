
import React, { useState, useEffect } from 'react';
import { AppView, Business, PlanType, Product, Order, UserSession } from './types';
import { MOCK_BUSINESSES, PLANS } from './constants';
import LandingPage from './views/LandingPage';
import RegistrationForm from './views/RegistrationForm';
import SuperAdminPanel from './views/SuperAdminPanel';
import BusinessAdminPanel from './views/BusinessAdminPanel';
import PublicMenu from './views/PublicMenu';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');
  const [session, setSession] = useState<UserSession | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>(MOCK_BUSINESSES);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Simple state persistence in LocalStorage
  useEffect(() => {
    const savedBusinesses = localStorage.getItem('saas_businesses');
    if (savedBusinesses) setBusinesses(JSON.parse(savedBusinesses));

    const savedProducts = localStorage.getItem('saas_products');
    if (savedProducts) setProducts(JSON.parse(savedProducts));

    const savedOrders = localStorage.getItem('saas_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));

    // Detección de ruta para menú público vía URL Params
    const params = new URLSearchParams(window.location.search);
    if (params.has('business')) {
      setView('publicmenu');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('saas_businesses', JSON.stringify(businesses));
    localStorage.setItem('saas_products', JSON.stringify(products));
    localStorage.setItem('saas_orders', JSON.stringify(orders));
  }, [businesses, products, orders]);

  const handleRegister = (newBusiness: Business) => {
    setBusinesses([...businesses, newBusiness]);
    setSession({ role: 'businessadmin', businessId: newBusiness.id });
    setView('businessadmin');
  };

  const handleLogin = (role: 'superadmin' | 'businessadmin', businessId?: string) => {
    setSession({ role, businessId });
    setView(role === 'superadmin' ? 'superadmin' : 'businessadmin');
  };

  const currentBusiness = session?.businessId ? businesses.find(b => b.id === session.businessId) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {view === 'landing' && <LandingPage setView={setView} onLogin={handleLogin} />}
      {view === 'register' && <RegistrationForm onRegister={handleRegister} setView={setView} />}
      {view === 'superadmin' && (
        <SuperAdminPanel 
          businesses={businesses} 
          setBusinesses={setBusinesses} 
          onLogout={() => { setSession(null); setView('landing'); }}
        />
      )}
      {view === 'businessadmin' && currentBusiness && (
        <BusinessAdminPanel 
          business={currentBusiness}
          setBusinesses={setBusinesses}
          products={products.filter(p => p.businessId === currentBusiness.id)}
          setProducts={setProducts}
          orders={orders.filter(o => o.businessId === currentBusiness.id)}
          setOrders={setOrders}
          onLogout={() => { setSession(null); setView('landing'); }}
        />
      )}
      {view === 'publicmenu' && (
        <PublicMenu 
          businesses={businesses} 
          products={products}
          addOrder={(o) => setOrders([...orders, o])}
        />
      )}
    </div>
  );
};

export default App;
