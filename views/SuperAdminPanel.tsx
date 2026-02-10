import React, { useState } from 'react';
import { Business, PlanType, GlobalPaymentConfig, Module, SystemService, LandingPlan, PlanAuditLog, HybridPlan } from '../types';
import { MOCK_HYBRID_PLANS } from '../constants';

interface SuperAdminPanelProps {
  businesses: Business[];
  setBusinesses: React.Dispatch<React.SetStateAction<Business[]>>;
  onLogout: () => void
}

type SuperTab = 'businesses' | 'plans' | 'hybrid-plans' | 'payment-methods' | 'services' | 'modules' | 'integrations';

const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ businesses, setBusinesses, onLogout }) => {
  const [activeTab, setActiveTab] = useState<SuperTab>('payment-methods');
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [isAddingService, setIsAddingService] = useState(false);

  // Modalidad de Facturación (Mensual/Anual)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  // Porcentaje de ahorro anual editable
  const [annualSavings, setAnnualSavings] = useState(20);

  // Sistema de Planes State
  const [landingPlans, setLandingPlans] = useState<LandingPlan[]>([
    {
      id: 'lp1',
      slug: 'plan-basico-mensual',
      name: 'Básico',
      description: 'Ideal para pequeños emprendimientos que inician su viaje digital.',
      price: 0,
      currency: 'USD',
      period: 'monthly',
      features: ['Menú Digital', '10 Productos', 'Soporte Básico'],
      isActive: true,
      isPublic: true,
      isPopular: false,
      order: 1,
      icon: '🌱',
      color: '#6366f1',
      maxUsers: 2,
      maxProjects: 1
    },
    {
      id: 'lp2',
      slug: 'plan-pro-mensual',
      name: 'Profesional',
      description: 'Potencia tu negocio con herramientas avanzadas e IA.',
      price: 29.99,
      currency: 'USD',
      period: 'monthly',
      features: ['Productos Ilimitados', 'IA por Voz', 'Reportes PRO'],
      isActive: true,
      isPublic: true,
      isPopular: true,
      order: 2,
      icon: '🚀',
      color: '#8b5cf6',
      maxUsers: 10,
      maxProjects: 5
    },
    {
      id: 'lp3',
      slug: 'plan-pro-anual',
      name: 'Profesional Anual',
      description: 'Ahorra 2 meses contratando el año completo.',
      price: 299.90,
      currency: 'USD',
      period: 'yearly',
      features: ['Productos Ilimitados', 'IA por Voz', 'Reportes PRO', 'Ahorro del 20%'],
      isActive: true,
      isPublic: true,
      isPopular: true,
      order: 2,
      icon: '💎',
      color: '#8b5cf6',
      maxUsers: 10,
      maxProjects: 5
    }
  ]);

  // Planes Híbridos State
  const [hybridPlans, setHybridPlans] = useState<HybridPlan[]>(MOCK_HYBRID_PLANS);
  const [isAddingHybridPlan, setIsAddingHybridPlan] = useState(false);
  const [editingHybridPlan, setEditingHybridPlan] = useState<HybridPlan | null>(null);
  const [newHybridPlan, setNewHybridPlan] = useState<Partial<HybridPlan>>({
    name: '',
    slug: '',
    description: '',
    basePrice: 0,
    pricePerOrder: 0,
    currency: 'USD',
    variableBillingFrequency: 'monthly',
    features: [],
    isActive: true,
    isPublic: true,
    isPopular: false
  });

  const [auditLogs, setAuditLogs] = useState<PlanAuditLog[]>([]);
  const [isEditingPlan, setIsEditingPlan] = useState<LandingPlan | null>(null);
  const [isAddingPlan, setIsAddingPlan] = useState(false);

  const [newPlan, setNewPlan] = useState<Partial<LandingPlan>>({
    name: '',
    slug: '',
    description: '',
    price: 0,
    currency: 'USD',
    period: 'monthly',
    features: [],
    isActive: true,
    isPublic: true,
    isPopular: false,
    order: 1,
    icon: '✨',
    color: '#6366f1',
    maxUsers: 5,
    maxProjects: 2
  });

  // Estado temporal para el input de características
  const [featureInput, setFeatureInput] = useState('');

  // Filtros para la pestaña de Negocios
  const [businessSearchTerm, setBusinessSearchTerm] = useState('');
  const [businessPlanFilter, setBusinessPlanFilter] = useState('Todos');

  // Módulos State
  const [modules, setModules] = useState<Module[]>([
    { id: 'm1', name: 'Gestión de Inventario', description: 'Control de stock avanzado con alertas de existencias bajas.', icon: '📦', price: 9.90, status: 'active' },
    { id: 'm2', name: 'Fidelización Pro', description: 'Sistema de puntos y recompensas para clientes recurrentes.', icon: '⭐', price: 15.00, status: 'active' },
    { id: 'm3', name: 'Reportes Avanzados', description: 'Analítica profunda de ventas y exportación a Excel/PDF.', icon: '📊', price: 12.50, status: 'active' }
  ]);

  // Servicios State
  const [systemServices, setSystemServices] = useState<SystemService[]>([
    { id: 's1', name: 'Google Gemini API', provider: 'Google AI', description: 'Motor de inteligencia artificial para generación de productos e imágenes.', status: 'active', endpoint: 'api.google.com/gemini' },
    { id: 's2', name: 'Twilio Messaging', provider: 'Twilio Inc.', description: 'Servicio de notificaciones vía WhatsApp y SMS para pedidos.', status: 'active', endpoint: 'api.twilio.com/v1' },
    { id: 's3', name: 'AWS S3 Storage', provider: 'Amazon Web Services', description: 'Almacenamiento de imágenes de productos y logos de negocios.', status: 'maintenance', endpoint: 's3.amazonaws.com/saas' }
  ]);

  const [newModule, setNewModule] = useState<Partial<Module>>({
    name: '',
    description: '',
    icon: '🧩',
    price: 0,
    status: 'active'
  });

  const [newService, setNewService] = useState<Partial<SystemService>>({
    name: '',
    provider: '',
    description: '',
    status: 'active',
    endpoint: ''
  });

  // Global Payment Configuration
  const [paymentConfig, setPaymentConfig] = useState<GlobalPaymentConfig>({
    nequi: { enabled: true, accountNumber: '3001234567', accountHolder: 'SaaS Admin', instructions: 'Escanea el QR y envía el comprobante.', qrImage: '' },
    bancolombia: { enabled: false, accountNumber: '', accountHolder: '', instructions: '', qrImage: '' },
    daviplata: { enabled: false, accountNumber: '', accountHolder: '', instructions: '', qrImage: '' },
    breB: { enabled: false, accountKey: '', instructions: '', qrImage: '' },
    stripe: { enabled: true, publicKey: 'pk_test_...', secretKey: 'sk_test_...', mode: 'sandbox', instructions: 'Pago seguro procesado por Stripe.' },
    mercadoPago: { enabled: false, publicKey: '', accessToken: '', mode: 'sandbox', instructions: '', qrImage: '' },
    paypal: { enabled: false, clientId: '', secretKey: '', mode: 'sandbox', instructions: '' },
    hotmartGlobal: { 
      enabled: true, 
      instructions: 'Finaliza tu compra en la plataforma segura de Hotmart.',
      planUrls: {
        [PlanType.BASIC]: '',
        [PlanType.PRO]: '',
        [PlanType.ENTERPRISE]: ''
      }
    }
  });

  const addAuditLog = (planId: string, planName: string, action: 'create' | 'update' | 'delete', details: string) => {
    const newLog: PlanAuditLog = {
      id: 'log-' + Date.now(),
      planId,
      planName,
      action,
      timestamp: Date.now(),
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleSavePayments = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('Configuración global de pagos guardada con éxito.');
    }, 1200);
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingPlan) {
      setLandingPlans(prev => prev.map(p => p.id === isEditingPlan.id ? isEditingPlan : p));
      addAuditLog(isEditingPlan.id, isEditingPlan.name, 'update', `Se actualizaron los parámetros del plan ${isEditingPlan.slug}`);
      setIsEditingPlan(null);
    } else {
      const planToCreate: LandingPlan = {
        ...(newPlan as LandingPlan),
        id: 'lp-' + Date.now(),
        slug: newPlan.slug || newPlan.name?.toLowerCase().replace(/\s+/g, '-') || 'plan-nuevo'
      };
      setLandingPlans(prev => [...prev, planToCreate]);
      addAuditLog(planToCreate.id, planToCreate.name, 'create', `Creación inicial del plan ${planToCreate.slug}`);
      setIsAddingPlan(false);
    }
  };

  const handleDeletePlan = (id: string) => {
    const plan = landingPlans.find(p => p.id === id);
    if (!plan) return;
    if (confirm(`¿Estás seguro de eliminar el plan "${plan.name}"? Esta acción no se puede deshacer.`)) {
      setLandingPlans(prev => prev.filter(p => p.id !== id));
      addAuditLog(id, plan.name, 'delete', `Eliminación del plan comercial ${plan.slug}`);
    }
  };

  // CRUD Híbrido
  const handleHybridPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHybridPlan) {
      const updatedPlan = { ...editingHybridPlan, updatedAt: Date.now() };
      setHybridPlans(prev => prev.map(p => p.id === editingHybridPlan.id ? updatedPlan : p));
      addAuditLog(updatedPlan.id, updatedPlan.name, 'update', `Actualización de parámetros del plan híbrido ${updatedPlan.slug}`);
      setEditingHybridPlan(null);
    } else {
      const planToCreate: HybridPlan = {
        ...(newHybridPlan as HybridPlan),
        id: 'hp-' + Date.now(),
        slug: newHybridPlan.slug || newHybridPlan.name?.toLowerCase().replace(/\s+/g, '-') || 'plan-hibrido-nuevo',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setHybridPlans(prev => [...prev, planToCreate]);
      addAuditLog(planToCreate.id, planToCreate.name, 'create', `Nuevo plan híbrido registrado: ${planToCreate.slug}`);
      setIsAddingHybridPlan(false);
    }
  };

  const handleDeleteHybridPlan = (id: string) => {
    const plan = hybridPlans.find(p => p.id === id);
    if (!plan) return;
    if (confirm(`¿Eliminar el plan híbrido "${plan.name}"? Los negocios suscritos mantendrán sus condiciones hasta el cierre de ciclo.`)) {
      setHybridPlans(prev => prev.filter(p => p.id !== id));
      addAuditLog(id, plan.name, 'delete', `Eliminación definitiva del plan híbrido ${plan.slug}`);
    }
  };

  // Funciones para manejar características (compatibles con ambos tipos)
  const handleAddFeature = (target: 'landing' | 'hybrid') => {
    if (!featureInput.trim()) return;
    
    if (target === 'landing') {
      if (isEditingPlan) {
        if (isEditingPlan.features.includes(featureInput.trim())) return;
        setIsEditingPlan({ ...isEditingPlan, features: [...isEditingPlan.features, featureInput.trim()] });
      } else {
        const currentFeatures = newPlan.features || [];
        if (currentFeatures.includes(featureInput.trim())) return;
        setNewPlan({ ...newPlan, features: [...currentFeatures, featureInput.trim()] });
      }
    } else {
      if (editingHybridPlan) {
        if (editingHybridPlan.features.includes(featureInput.trim())) return;
        setEditingHybridPlan({ ...editingHybridPlan, features: [...editingHybridPlan.features, featureInput.trim()] });
      } else {
        const currentFeatures = newHybridPlan.features || [];
        if (currentFeatures.includes(featureInput.trim())) return;
        setNewHybridPlan({ ...newHybridPlan, features: [...currentFeatures, featureInput.trim()] });
      }
    }
    setFeatureInput('');
  };

  const handleRemoveFeature = (feature: string, target: 'landing' | 'hybrid') => {
    if (target === 'landing') {
      if (isEditingPlan) {
        setIsEditingPlan({ ...isEditingPlan, features: isEditingPlan.features.filter(f => f !== feature) });
      } else {
        const currentFeatures = newPlan.features || [];
        setNewPlan({ ...newPlan, features: currentFeatures.filter(f => f !== feature) });
      }
    } else {
      if (editingHybridPlan) {
        setEditingHybridPlan({ ...editingHybridPlan, features: editingHybridPlan.features.filter(f => f !== feature) });
      } else {
        const currentFeatures = newHybridPlan.features || [];
        setNewHybridPlan({ ...newHybridPlan, features: currentFeatures.filter(f => f !== feature) });
      }
    }
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModule.name || !newModule.description) return;

    const moduleToAdd: Module = {
      id: 'm' + Date.now(),
      name: newModule.name || '',
      description: newModule.description || '',
      icon: newModule.icon || '🧩',
      price: Number(newModule.price) || 0,
      status: (newModule.status as 'active' | 'inactive') || 'active'
    };

    setModules([...modules, moduleToAdd]);
    setIsAddingModule(false);
    setNewModule({ name: '', description: '', icon: '🧩', price: 0, status: 'active' });
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name || !newService.provider) return;

    const serviceToAdd: SystemService = {
      id: 's' + Date.now(),
      name: newService.name || '',
      provider: newService.provider || '',
      description: newService.description || '',
      status: (newService.status as 'active' | 'maintenance' | 'offline') || 'active',
      endpoint: newService.endpoint || ''
    };

    setSystemServices([...systemServices, serviceToAdd]);
    setIsAddingService(false);
    setNewService({ name: '', provider: '', description: '', status: 'active', endpoint: '' });
  };

  const handleQRUpload = (e: React.ChangeEvent<HTMLInputElement>, method: keyof GlobalPaymentConfig) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPaymentConfig(prev => ({
          ...prev,
          [method]: { 
            ...(prev[method] as object), 
            qrImage: result 
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateBusinessPlan = (id: string, newPlanId: PlanType) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, planId: newPlanId } : b));
  };

  // Filtrar planes por el ciclo de facturación seleccionado
  const filteredPlansByCycle = landingPlans.filter(p => p.period === billingCycle || p.period === 'lifetime');

  // Lógica de filtrado de negocios
  const filteredBusinessesList = businesses.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(businessSearchTerm.toLowerCase()) || 
                         b.email.toLowerCase().includes(businessSearchTerm.toLowerCase()) || 
                         b.type.toLowerCase().includes(businessSearchTerm.toLowerCase());
    const matchesPlan = businessPlanFilter === 'Todos' || b.planId === businessPlanFilter;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 font-bold text-xl border-b border-slate-800 flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
          Super Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">Gestión Core</div>
          <button onClick={() => setActiveTab('businesses')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'businesses' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
            Negocios
          </button>
          <button onClick={() => setActiveTab('plans')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'plans' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            Planes Fijos
          </button>
          <button onClick={() => setActiveTab('hybrid-plans')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'hybrid-plans' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            Planes Híbridos
          </button>
          
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 pt-4">Finanzas</div>
          <button onClick={() => setActiveTab('payment-methods')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'payment-methods' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            Pasarelas de Pago
          </button>

          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 pt-4">Conectividad</div>
          <button onClick={() => setActiveTab('integrations')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'integrations' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            Integraciones
          </button>

          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2 pt-4 text-white/50">Sistema</div>
          <button onClick={() => setActiveTab('services')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'services' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg> Servicios</button>
          <button onClick={() => setActiveTab('modules')} className={`w-full text-left p-3 rounded-lg transition flex items-center gap-3 ${activeTab === 'modules' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a2 2 0 002 2h1a2 2 0 110 4h-1a2 2 0 00-2 2v1a2 2 0 11-4 0V11a2 2 0 00-2-2H7a2 2 0 110-4h1a2 2 0 002-2V4z"></path></svg> Módulos</button>
        </nav>
        <button onClick={onLogout} className="p-6 border-t border-slate-800 hover:text-red-400 transition text-left text-sm font-bold flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          Cerrar Sesión
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 capitalize">
              {activeTab === 'payment-methods' ? 'Pasarelas de Pago Globales' : activeTab === 'plans' ? 'Gestión de Planes' : activeTab === 'hybrid-plans' ? 'Planes Híbridos' : activeTab.replace('-', ' ')}
            </h2>
            <p className="text-slate-500 text-sm">
              {activeTab === 'plans' ? 'Configura la oferta comercial fija.' : activeTab === 'hybrid-plans' ? 'Configuración de planes base + comisión.' : 'Ajustes maestros del sistema.'}
            </p>
          </div>
          {(activeTab === 'payment-methods' || activeTab === 'plans' || activeTab === 'hybrid-plans' || activeTab === 'modules' || activeTab === 'services') && (
            <button 
              onClick={
                activeTab === 'modules' ? () => setIsAddingModule(true) : 
                activeTab === 'services' ? () => setIsAddingService(true) : 
                activeTab === 'plans' ? () => {
                  setNewPlan(prev => ({ ...prev, period: billingCycle }));
                  setIsAddingPlan(true);
                } :
                activeTab === 'hybrid-plans' ? () => setIsAddingHybridPlan(true) :
                handleSavePayments
              }
              disabled={isSaving}
              className={`px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg transition flex items-center gap-2 ${isSaving ? 'opacity-70 animate-pulse cursor-wait' : 'hover:bg-indigo-700 active:scale-95'}`}
            >
              {activeTab === 'modules' ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Agregar Módulo
                </>
              ) : activeTab === 'services' ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Agregar Servicio
                </>
              ) : activeTab === 'plans' ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  Nuevo Plan Fijo
                </>
              ) : activeTab === 'hybrid-plans' ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Nuevo Plan Híbrido
                </>
              ) : (isSaving ? 'Guardando...' : 'Guardar Configuración')}
            </button>
          )}
        </header>

        {activeTab === 'plans' && (
          <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            
            {/* CONFIGURACIÓN DE OFERTA Y SELECTOR DE CICLO */}
            <div className="flex flex-col items-center gap-6">
               {/* Ajuste de Porcentaje de Ahorro Anual */}
               <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Indicador Ahorro Anual</label>
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="number" 
                        min="0"
                        max="100"
                        className="w-12 text-center bg-slate-50 border-none rounded-lg text-sm font-black text-indigo-600 focus:ring-1 focus:ring-indigo-500 p-0.5"
                        value={annualSavings}
                        onChange={(e) => setAnnualSavings(Number(e.target.value))}
                      />
                      <span className="text-xs font-bold text-slate-400">%</span>
                    </div>
                  </div>
               </div>

               {/* TOGGLE MENSUAL / ANUAL */}
               <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-1">
                  <button 
                    onClick={() => setBillingCycle('monthly')} 
                    className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                  >
                    Mensual
                  </button>
                  <button 
                    onClick={() => setBillingCycle('yearly')} 
                    className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                  >
                    Anual
                    <span className="bg-emerald-100 text-emerald-600 text-[8px] px-1.5 py-0.5 rounded-md font-black tracking-tighter">-{annualSavings}%</span>
                  </button>
               </div>
            </div>

            {/* Grid de Planes Filtrados */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPlansByCycle.sort((a, b) => a.order - b.order).map(plan => (
                <div key={plan.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden animate-in zoom-in-95 duration-500">
                   {plan.isPopular && (
                     <div className="absolute top-0 right-0 p-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest rounded-bl-3xl shadow-lg">Popular</div>
                   )}
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner" style={{ backgroundColor: plan.color + '15', color: plan.color }}>
                        {plan.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-800">{plan.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{plan.slug}</p>
                      </div>
                   </div>
                   
                   <p className="text-sm text-slate-500 mb-8 h-10 line-clamp-2 leading-relaxed">{plan.description}</p>
                   
                   <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-4xl font-black text-slate-900">${plan.price}</span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">/ {plan.period === 'monthly' ? 'mes' : plan.period === 'yearly' ? 'año' : 'de por vida'}</span>
                   </div>

                   <div className="space-y-3 mb-8">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase">Mesas</span>
                        <span className="font-black text-slate-800">{plan.maxProjects === -1 ? 'Ilimitado' : plan.maxProjects}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold uppercase">Empleados</span>
                        <span className="font-black text-slate-800">{plan.maxUsers === -1 ? 'Ilimitado' : plan.maxUsers}</span>
                      </div>
                      <div className="flex gap-2 pt-2">
                        {plan.isActive && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded-full">Activo</span>}
                        {plan.isPublic && <span className="px-2 py-0.5 bg-sky-50 text-sky-600 text-[8px] font-black uppercase rounded-full">Público</span>}
                      </div>
                   </div>

                   <div className="flex gap-3 pt-4 border-t border-slate-50">
                      <button onClick={() => setIsEditingPlan(plan)} className="flex-1 py-3 bg-slate-50 text-slate-600 font-bold text-xs uppercase rounded-xl hover:bg-slate-100 transition">Editar</button>
                      <button onClick={() => handleDeletePlan(plan.id)} className="px-4 py-3 bg-rose-50 text-rose-600 font-bold text-xs uppercase rounded-xl hover:bg-rose-100 transition">Eliminar</button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB PLANES HÍBRIDOS */}
        {activeTab === 'hybrid-plans' && (
          <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {hybridPlans.map(plan => (
                 <div key={plan.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden animate-in zoom-in-95 duration-500">
                    {plan.isPopular && (
                      <div className="absolute top-0 right-0 p-4 bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest rounded-bl-3xl shadow-lg">Destacado</div>
                    )}
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-3xl text-amber-600 shadow-inner">
                         ⚡
                       </div>
                       <div>
                         <h3 className="text-xl font-black text-slate-800">{plan.name}</h3>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hybrid Model</p>
                       </div>
                    </div>
                    
                    <p className="text-sm text-slate-500 mb-8 h-10 line-clamp-2 leading-relaxed">{plan.description}</p>
                    
                    <div className="space-y-2 mb-8">
                      <div className="flex items-baseline gap-1">
                         <span className="text-3xl font-black text-slate-900">${plan.basePrice}</span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ Mes Fijo</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                         <span className="text-2xl font-black text-indigo-600">+ ${plan.pricePerOrder}</span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ Por Pedido</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                       <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-400 font-bold uppercase">Corte de Comisiones</span>
                         <span className="font-black text-indigo-800 uppercase tracking-tighter">{plan.variableBillingFrequency}</span>
                       </div>
                       <div className="flex gap-2 pt-2">
                         {plan.isActive && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded-full">Activo</span>}
                         {plan.isPublic && <span className="px-2 py-0.5 bg-sky-50 text-sky-600 text-[8px] font-black uppercase rounded-full">Público</span>}
                       </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-50">
                       <button onClick={() => setEditingHybridPlan(plan)} className="flex-1 py-3 bg-slate-50 text-slate-600 font-bold text-xs uppercase rounded-xl hover:bg-slate-100 transition">Editar</button>
                       <button onClick={() => handleDeleteHybridPlan(plan.id)} className="px-4 py-3 bg-rose-50 text-rose-600 font-bold text-xs uppercase rounded-xl hover:bg-rose-100 transition">Eliminar</button>
                    </div>
                 </div>
               ))}
               {hybridPlans.length === 0 && (
                 <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800">No hay planes híbridos configurados</h3>
                    <p className="text-sm text-slate-400 mt-2">Agrega el primer plan con modelo de comisiones.</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {/* Modal CRUD Planes Híbridos */}
        {(isAddingHybridPlan || editingHybridPlan) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-3xl font-black text-slate-800">{editingHybridPlan ? 'Editar Plan Híbrido' : 'Nuevo Plan Híbrido'}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configuración de ingresos base + variable</p>
                </div>
                <button onClick={() => { setIsAddingHybridPlan(false); setEditingHybridPlan(null); }} className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <form onSubmit={handleHybridPlanSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre del Plan</label>
                      <input 
                        required
                        type="text" 
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800" 
                        value={editingHybridPlan ? editingHybridPlan.name : newHybridPlan.name}
                        onChange={e => editingHybridPlan ? setEditingHybridPlan({...editingHybridPlan, name: e.target.value}) : setNewHybridPlan({...newHybridPlan, name: e.target.value})}
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Slug</label>
                      <input 
                        required
                        type="text" 
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs text-indigo-600" 
                        value={editingHybridPlan ? editingHybridPlan.slug : newHybridPlan.slug}
                        onChange={e => editingHybridPlan ? setEditingHybridPlan({...editingHybridPlan, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')}) : setNewHybridPlan({...newHybridPlan, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                      <textarea 
                        required
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl h-24 resize-none text-sm text-slate-600" 
                        value={editingHybridPlan ? editingHybridPlan.description : newHybridPlan.description}
                        onChange={e => editingHybridPlan ? setEditingHybridPlan({...editingHybridPlan, description: e.target.value}) : setNewHybridPlan({...newHybridPlan, description: e.target.value})}
                      />
                   </div>

                   {/* GESTOR DE CARACTERÍSTICAS HÍBRIDO */}
                   <div className="space-y-4 pt-4 border-t border-slate-50">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Características Incluidas</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Ej: Reportes de Comisiones"
                          className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700" 
                          value={featureInput}
                          onChange={e => setFeatureInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddFeature('hybrid'))}
                        />
                        <button 
                          type="button" 
                          onClick={() => handleAddFeature('hybrid')}
                          className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition shadow-sm active:scale-95"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 min-h-[40px] p-4 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                        {(editingHybridPlan ? editingHybridPlan.features : (newHybridPlan.features || [])).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm animate-in fade-in zoom-in duration-200">
                            <span className="text-xs font-bold text-slate-700">{feature}</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveFeature(feature, 'hybrid')}
                              className="w-5 h-5 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tarifa Base ($)</label>
                        <input 
                          required
                          type="number" 
                          step="0.01"
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800" 
                          value={editingHybridPlan ? editingHybridPlan.basePrice : newHybridPlan.basePrice}
                          onChange={e => editingHybridPlan ? setEditingHybridPlan({...editingHybridPlan, basePrice: Number(e.target.value)}) : setNewHybridPlan({...newHybridPlan, basePrice: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Costo por Pedido ($)</label>
                        <input 
                          required
                          type="number" 
                          step="0.01"
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-indigo-600" 
                          value={editingHybridPlan ? editingHybridPlan.pricePerOrder : newHybridPlan.pricePerOrder}
                          onChange={e => editingHybridPlan ? setEditingHybridPlan({...editingHybridPlan, pricePerOrder: Number(e.target.value)}) : setNewHybridPlan({...newHybridPlan, pricePerOrder: Number(e.target.value)})}
                        />
                      </div>
                   </div>

                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Frecuencia de Liquidación</label>
                      <select 
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800"
                        value={editingHybridPlan ? editingHybridPlan.variableBillingFrequency : newHybridPlan.variableBillingFrequency}
                        onChange={e => editingHybridPlan ? setEditingHybridPlan({...editingHybridPlan, variableBillingFrequency: e.target.value as any}) : setNewHybridPlan({...newHybridPlan, variableBillingFrequency: e.target.value as any})}
                      >
                        <option value="weekly">Semanal (7 días)</option>
                        <option value="biweekly">Quincenal (15 días)</option>
                        <option value="monthly">Mensual (30 días)</option>
                      </select>
                   </div>

                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Hotmart URL Checkout (Opcional)</label>
                      <input 
                        type="text" 
                        placeholder="https://pay.hotmart.com/..."
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs" 
                        value={editingHybridPlan ? editingHybridPlan.hotmartUrl : newHybridPlan.hotmartUrl}
                        onChange={e => editingHybridPlan ? setEditingHybridPlan({...editingHybridPlan, hotmartUrl: e.target.value}) : setNewHybridPlan({...newHybridPlan, hotmartUrl: e.target.value})}
                      />
                   </div>

                   <div className="flex gap-4 pt-4">
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-xl">
                        <input type="checkbox" className="w-4 h-4 rounded text-indigo-600" checked={editingHybridPlan ? editingHybridPlan.isPopular : newHybridPlan.isPopular} onChange={e => editingHybridPlan ? setEditingHybridPlan({...editingHybridPlan, isPopular: e.target.checked}) : setNewHybridPlan({...newHybridPlan, isPopular: e.target.checked})} />
                        <span className="text-[10px] font-black uppercase text-slate-600">Popular</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-xl">
                        <input type="checkbox" className="w-4 h-4 rounded text-indigo-600" checked={editingHybridPlan ? editingHybridPlan.isPublic : newHybridPlan.isPublic} onChange={e => editingHybridPlan ? setEditingHybridPlan({...editingHybridPlan, isPublic: e.target.checked}) : setNewHybridPlan({...newHybridPlan, isPublic: e.target.checked})} />
                        <span className="text-[10px] font-black uppercase text-slate-600">Público</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-xl">
                        <input type="checkbox" className="w-4 h-4 rounded text-indigo-600" checked={editingHybridPlan ? editingHybridPlan.isActive : newHybridPlan.isActive} onChange={e => editingHybridPlan ? setEditingHybridPlan({...editingHybridPlan, isActive: e.target.checked}) : setNewHybridPlan({...newHybridPlan, isActive: e.target.checked})} />
                        <span className="text-[10px] font-black uppercase text-slate-600">Activo</span>
                      </label>
                   </div>
                </div>

                <div className="md:col-span-2 pt-10 border-t flex gap-4">
                  <button type="button" onClick={() => { setIsAddingHybridPlan(false); setEditingHybridPlan(null); }} className="flex-1 py-5 text-slate-400 font-bold hover:bg-slate-50 rounded-3xl transition">Cancelar</button>
                  <button type="submit" className="flex-[2] py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 transition">
                    {editingHybridPlan ? 'Guardar Cambios Híbridos' : 'Lanzar Plan Híbrido'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal CRUD Planes Fijos (Se mantiene igual pero con target 'landing' en el feature adder) */}
        {(isAddingPlan || isEditingPlan) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-3xl font-black text-slate-800">{isEditingPlan ? 'Editar Plan Fijo' : 'Nuevo Plan Fijo'}</h3>
                </div>
                <button onClick={() => { setIsAddingPlan(false); setIsEditingPlan(null); }} className="p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <form onSubmit={handlePlanSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Información Básica */}
                <div className="space-y-6">
                   <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Nombre Comercial</label>
                      <input 
                        required
                        type="text" 
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800" 
                        value={isEditingPlan ? isEditingPlan.name : newPlan.name}
                        onChange={e => isEditingPlan ? setIsEditingPlan({...isEditingPlan, name: e.target.value}) : setNewPlan({...newPlan, name: e.target.value})}
                      />
                   </div>
                   
                   {/* GESTOR DE CARACTERÍSTICAS FIJO */}
                   <div className="space-y-4 pt-4 border-t border-slate-50">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Características del Plan</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Ej: Menú Dinámico"
                          className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-700" 
                          value={featureInput}
                          onChange={e => setFeatureInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddFeature('landing'))}
                        />
                        <button 
                          type="button" 
                          onClick={() => handleAddFeature('landing')}
                          className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition shadow-sm active:scale-95"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 min-h-[40px] p-4 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                        {(isEditingPlan ? isEditingPlan.features : (newPlan.features || [])).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm animate-in fade-in zoom-in duration-200">
                            <span className="text-xs font-bold text-slate-700">{feature}</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveFeature(feature, 'landing')}
                              className="w-5 h-5 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Precio</label>
                        <input 
                          required
                          type="number" 
                          step="0.01"
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-800 outline-none" 
                          value={isEditingPlan ? isEditingPlan.price : newPlan.price}
                          onChange={e => isEditingPlan ? setIsEditingPlan({...isEditingPlan, price: Number(e.target.value)}) : setNewPlan({...newPlan, price: Number(e.target.value)})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Periodo</label>
                        <select 
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none"
                          value={isEditingPlan ? isEditingPlan.period : newPlan.period}
                          onChange={e => isEditingPlan ? setIsEditingPlan({...isEditingPlan, period: e.target.value as any}) : setNewPlan({...newPlan, period: e.target.value as any})}
                        >
                          <option value="monthly">Mensual</option>
                          <option value="yearly">Anual</option>
                          <option value="lifetime">De por vida</option>
                        </select>
                      </div>
                   </div>
                   <div className="flex gap-4 pt-4">
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-xl">
                        <input type="checkbox" className="w-4 h-4 rounded text-indigo-600" checked={isEditingPlan ? isEditingPlan.isPopular : newPlan.isPopular} onChange={e => isEditingPlan ? setIsEditingPlan({...isEditingPlan, isPopular: e.target.checked}) : setNewPlan({...newPlan, isPopular: e.target.checked})} />
                        <span className="text-[10px] font-black uppercase text-slate-600">Popular</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-xl">
                        <input type="checkbox" className="w-4 h-4 rounded text-indigo-600" checked={isEditingPlan ? isEditingPlan.isActive : newPlan.isActive} onChange={e => isEditingPlan ? setIsEditingPlan({...isEditingPlan, isActive: e.target.checked}) : setNewPlan({...newPlan, isActive: e.target.checked})} />
                        <span className="text-[10px] font-black uppercase text-slate-600">Activo</span>
                      </label>
                   </div>
                </div>

                <div className="md:col-span-2 pt-10 border-t flex gap-4">
                  <button type="button" onClick={() => { setIsAddingPlan(false); setIsEditingPlan(null); }} className="flex-1 py-5 text-slate-400 font-bold hover:bg-slate-50 rounded-3xl transition">Cancelar</button>
                  <button type="submit" className="flex-[2] py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">
                    {isEditingPlan ? 'Guardar Cambios' : 'Crear Plan Fijo'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ... Se mantienen las otras pestañas (payment-methods, businesses, services, modules) sin cambios ... */}
        {activeTab === 'payment-methods' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500 pb-20">
             <div className="lg:col-span-2 space-y-8">
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                 <div className="flex justify-between items-center border-b pb-4">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner font-black">ST</div>
                     <div>
                       <h3 className="text-xl font-black text-slate-800">Stripe Global</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pasarela Maestra</p>
                     </div>
                   </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                     <input type="checkbox" className="sr-only peer" checked={paymentConfig.stripe.enabled} onChange={() => setPaymentConfig({...paymentConfig, stripe: {...paymentConfig.stripe, enabled: !paymentConfig.stripe.enabled}})} />
                     <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                   </label>
                 </div>
               </div>
             </div>
          </div>
        )}

        {activeTab === 'businesses' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
              <input 
                type="text" 
                placeholder="Buscar negocio..." 
                className="flex-1 w-full p-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none"
                value={businessSearchTerm}
                onChange={e => setBusinessSearchTerm(e.target.value)}
              />
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b">
                     <tr><th className="px-6 py-4 font-bold text-xs uppercase text-slate-400">Negocio</th><th className="px-6 py-4 font-bold text-xs uppercase text-slate-400">Acción</th></tr>
                  </thead>
                  <tbody>
                     {filteredBusinessesList.map(b => (
                       <tr key={b.id} className="hover:bg-slate-50 border-b"><td className="px-6 py-4 font-bold">{b.name}</td><td className="px-6 py-4"><button className="text-indigo-600 font-bold text-xs">Gestionar</button></td></tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {/* ... Resto de componentes (Mantenimiento de módulos y servicios) ... */}
        {activeTab === 'services' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {systemServices.map(svc => (
              <div key={svc.id} className="bg-white p-8 rounded-[2rem] border border-slate-200">
                <h3 className="text-xl font-black">{svc.name}</h3>
                <p className="text-sm text-slate-500">{svc.description}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SuperAdminPanel;