
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppView, Business, Product, Order, UserSession } from './types';
import { MOCK_BUSINESSES } from './constants';
import LandingPage from './views/LandingPage';
import RegistrationForm from './views/RegistrationForm';
import LoginView from './views/LoginView';
import SuperAdminPanel from './views/SuperAdminPanel';
import BusinessAdminPanel from './views/BusinessAdminPanel';
import PublicMenu from './views/PublicMenu';
import { supabase } from './lib/supabaseClient';
import { businessService } from './services/businessService';
import { productService } from './services/productService';
import { orderService } from './services/orderService';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');
  const [session, setSession] = useState<UserSession | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSyncing = useRef(false);
  const SUPER_ADMIN_EMAIL = 'alexjfweb@gmail.com';

  const loadAdminData = useCallback(async (businessId: string) => {
    try {
      const [dbProducts, dbOrders] = await Promise.all([
        productService.getProducts(businessId).catch(() => []),
        orderService.getOrders(businessId).catch(() => [])
      ]);
      setProducts(dbProducts);
      setOrders(dbOrders);
    } catch (err) {
      console.error("Error cargando datos de admin:", err);
    }
  }, []);

  const syncState = useCallback(async (user: any) => {
    const params = new URLSearchParams(window.location.search);

    // GUARDIA: Si estamos viendo un menú público, no cambiar la vista aunque el usuario esté logueado
    if (params.has('business')) {
      setLoading(false);
      return;
    }

    if (isSyncing.current) return;
    isSyncing.current = true;

    try {
      if (!user) {
        setSession(null);
        setBusinesses(MOCK_BUSINESSES);
        if (!params.has('business')) setView('landing');
        setLoading(false);
        return;
      }

      const isSuperAdmin = user.email === SUPER_ADMIN_EMAIL;
      const cloudBusinesses = await businessService.getBusinesses(
        isSuperAdmin ? undefined : user.id
      );

      setBusinesses(cloudBusinesses);

      if (isSuperAdmin) {
        setSession({ role: 'superadmin' });
        setView('superadmin');
      } else if (cloudBusinesses.length > 0) {
        const myBusiness = cloudBusinesses[0];
        setSession({ role: 'businessadmin', businessId: myBusiness.id });
        // No bloqueamos la carga de la app esperando a los productos/pedidos
        loadAdminData(myBusiness.id);
        setView('businessadmin');
      } else {
        setSession({ role: 'businessadmin' });
        setView('register');
      }
    } catch (err: any) {
      console.error("Error en sincronización:", err);
    } finally {
      isSyncing.current = false;
      setLoading(false);
    }
  }, [loadAdminData]);

  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        const params = new URLSearchParams(window.location.search);

        // Prioridad 1: Vista pública (Detección de ?business=)
        if (params.has('business')) {
          if (mounted) {
            setView('publicmenu');
            setLoading(false);
          }
          // No hacemos return aquí para que la sesión se cargue en segundo plano
        }

        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

        if (mounted) {
          if (currentSession?.user) {
            await syncState(currentSession.user);
          } else {
            setLoading(false);
            if (!params.has('business')) setView('landing');
          }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sbSession) => {
          if (!mounted) return;
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (sbSession?.user) await syncState(sbSession.user);
          } else if (event === 'SIGNED_OUT') {
            setSession(null);
            setLoading(false);
            if (!params.has('business')) setView('landing');
          }
        });

        return () => { subscription.unsubscribe(); };
      } catch (err) {
        if (mounted) setLoading(false);
      }
    };

    initializeApp();
    return () => { mounted = false; };
  }, [syncState]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setSession(null);
      setBusinesses(MOCK_BUSINESSES);
      setProducts([]);
      setOrders([]);
      // Aseguramos que volvemos a la raíz para limpiar cualquier parámetro de búsqueda como ?business=
      window.history.replaceState({}, '', '/');
      setView('landing');
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-6 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">Sincronizando...</p>
      </div>
    );
  }

  const currentBusiness = session?.businessId ? businesses.find(b => b.id === session.businessId) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {view === 'landing' && <LandingPage setView={setView} />}
      {view === 'login' && <LoginView setView={setView} />}
      {view === 'register' && <RegistrationForm onRegister={async (data) => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const created = await businessService.createBusiness(data, user.id);
          setBusinesses(prev => [created, ...prev]);
          setSession({ role: 'businessadmin', businessId: created.id });
          await loadAdminData(created.id);
          setView('businessadmin');
        }
        setLoading(false);
      }} setView={setView} />}

      {view === 'superadmin' && session?.role === 'superadmin' && (
        <SuperAdminPanel businesses={businesses} setBusinesses={setBusinesses} onLogout={handleLogout} />
      )}

      {view === 'businessadmin' && currentBusiness && (
        <BusinessAdminPanel
          business={currentBusiness}
          setBusinesses={setBusinesses}
          products={products}
          setProducts={setProducts}
          orders={orders}
          setOrders={setOrders}
          onLogout={handleLogout}
        />
      )}

      {view === 'publicmenu' && (
        <PublicMenu
          businesses={businesses}
          products={products}
          addOrder={async (o) => {
            const created = await orderService.createOrder(o);
            setOrders(prev => [created, ...prev]);
          }}
        />
      )}
    </div>
  );
};

export default App;
