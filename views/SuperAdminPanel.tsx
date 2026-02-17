import React, { useState, useEffect } from 'react';
import { Business, PlanType, GlobalPaymentConfig, Module, SystemService, LandingPlan, PlanAuditLog, HybridPlan, Integration, SaasPlan } from '../types';
import { MOCK_HYBRID_PLANS } from '../constants';
import { planService } from '../services/planService';

interface SuperAdminPanelProps {
  businesses: Business[];
  setBusinesses: React.Dispatch<React.SetStateAction<Business[]>>;
  onLogout: () => void
}

type SuperTab = 'businesses' | 'plans' | 'saas-plans' | 'hybrid-plans' | 'payment-methods' | 'services' | 'modules' | 'integrations';

const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ businesses, setBusinesses, onLogout }) => {
  const [activeTab, setActiveTab] = useState<SuperTab>('payment-methods');
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingService, setEditingService] = useState<SystemService | null>(null);
  const [isAddingIntegration, setIsAddingIntegration] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [isSavingBusiness, setIsSavingBusiness] = useState(false);

  // Planes SaaS Base State (Fase 3)
  const [saasPlans, setSaasPlans] = useState<SaasPlan[]>([]);
  const [isAddingSaasPlan, setIsAddingSaasPlan] = useState(false);
  const [editingSaasPlan, setEditingSaasPlan] = useState<SaasPlan | null>(null);
  const [newSaasPlan, setNewSaasPlan] = useState<Partial<SaasPlan>>({
    name: '',
    description: '',
    price: 0,
    type: 'mensual',
    status: 'active'
  });

  // Cargar planes al montar
  useEffect(() => {
    loadSaasPlans();
  }, []);

  const loadSaasPlans = async () => {
    try {
      const plans = await planService.getPlans();
      setSaasPlans(plans);
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const handleCreateSaasPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSaasPlan.name || newSaasPlan.price === undefined) return;

    try {
      const plan = await planService.createPlan(newSaasPlan as any);
      setSaasPlans(prev => [plan, ...prev]);
      setIsAddingSaasPlan(false);
      setNewSaasPlan({ name: '', description: '', price: 0, type: 'mensual', status: 'active' });
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('Error al crear el plan');
    }
  };

  const handleUpdateSaasPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSaasPlan) return;

    try {
      const updated = await planService.updatePlan(editingSaasPlan.id, editingSaasPlan);
      setSaasPlans(prev => prev.map(p => p.id === updated.id ? updated : p));
      setEditingSaasPlan(null);
    } catch (error) {
      console.error('Error updating plan:', error);
      alert('Error al actualizar el plan');
    }
  };

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
  const [businessStatusFilter, setBusinessStatusFilter] = useState<'Todos' | 'Activo' | 'Inactivo'>('Todos');

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

  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 'i1', name: 'Zapier', description: 'Automatiza flujos de trabajo enviando pedidos a miles de otras apps.', icon: '⚡', status: 'active', docsUrl: 'https://zapier.com' },
    { id: 'i2', name: 'Pabbly Connect', description: 'Alternativa a Zapier para conectar el SaaS con otros servicios.', icon: '🔌', status: 'active', docsUrl: 'https://pabbly.com' },
    { id: 'i3', name: 'Make (Integromat)', description: 'Constructor visual de automatizaciones para procesos complejos.', icon: '🌀', status: 'inactive', docsUrl: 'https://make.com' }
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

  const [newIntegration, setNewIntegration] = useState<Partial<Integration>>({
    name: '',
    description: '',
    icon: '🔌',
    status: 'active',
    docsUrl: ''
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
    const matchesStatus = businessStatusFilter === 'Todos' ||
      (businessStatusFilter === 'Activo' && b.isActive !== false) ||
      (businessStatusFilter === 'Inactivo' && b.isActive === false);
    return matchesSearch && matchesPlan && matchesStatus;
  });

  const handleUpdateBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;

    setIsSavingBusiness(true);
    // Simular guardado y actualizar estado local
    setTimeout(() => {
      setBusinesses(prev => prev.map(b => b.id === editingBusiness.id ? editingBusiness : b));
      setIsSavingBusiness(false);
      setEditingBusiness(null);
    }, 800);
  };

  const handleDeleteBusiness = (id: string) => {
    if (confirm("¿Estás SEGURO de eliminar este negocio? Esta acción es irreversible y eliminará todos sus datos.")) {
      setBusinesses(prev => prev.filter(b => b.id !== id));
      setEditingBusiness(null);
    }
  };

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
          <button
            onClick={() => setActiveTab('plans')}
            className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 font-bold ${activeTab === 'plans' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Planes Fijos
          </button>

          <button
            onClick={() => setActiveTab('hybrid-plans')}
            className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 font-bold ${activeTab === 'hybrid-plans' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
            Planes Híbridos
          </button>

          <button
            onClick={() => setActiveTab('saas-plans')}
            className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 font-bold ${activeTab === 'saas-plans' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Planes SaaS (Base)
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
              {activeTab === 'businesses' ? 'Negocios' :
                activeTab === 'plans' ? 'Planes Fijos' :
                  activeTab === 'saas-plans' ? 'Planes SaaS (Base)' :
                    activeTab === 'hybrid-plans' ? 'Planes Híbridos' :
                      activeTab === 'payment-methods' ? 'Pasarelas de Pago' :
                        activeTab === 'integrations' ? 'Integraciones' :
                          activeTab === 'services' ? 'Servicios' :
                            'Módulos'}
            </h2>
            <p className="text-slate-500 text-sm">
              {activeTab === 'plans' ? 'Configura la oferta comercial fija.' : activeTab === 'hybrid-plans' ? 'Configuración de planes base + comisión.' : 'Ajustes maestros del sistema.'}
            </p>
          </div>
          {(activeTab === 'payment-methods' || activeTab === 'plans' || activeTab === 'saas-plans' || activeTab === 'hybrid-plans' || activeTab === 'modules' || activeTab === 'services' || activeTab === 'integrations') && (
            <button
              onClick={
                activeTab === 'modules' ? () => setIsAddingModule(true) :
                  activeTab === 'services' ? () => setIsAddingService(true) :
                    activeTab === 'saas-plans' ? () => setIsAddingSaasPlan(true) :
                      activeTab === 'plans' ? () => {
                        setNewPlan(prev => ({ ...prev, period: billingCycle }));
                        setIsAddingPlan(true);
                      } :
                        activeTab === 'hybrid-plans' ? () => setIsAddingHybridPlan(true) :
                          activeTab === 'integrations' ? () => setIsAddingIntegration(true) :
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
              ) : activeTab === 'saas-plans' ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  Nuevo Plan Base
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
              ) : activeTab === 'integrations' ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Agregar Integración
                </>
              ) : (isSaving ? 'Guardando...' : 'Guardar Configuración')}
            </button>
          )}
        </header>

        {
          activeTab === 'plans' && (
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
          )
        }

        {/* TAB PLANES HÍBRIDOS */}
        {
          activeTab === 'hybrid-plans' && (
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
          )
        }

        {/* Modal CRUD Planes Híbridos */}
        {
          (isAddingHybridPlan || editingHybridPlan) && (
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
                        onChange={e => editingHybridPlan ? setEditingHybridPlan({ ...editingHybridPlan, name: e.target.value }) : setNewHybridPlan({ ...newHybridPlan, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Slug</label>
                      <input
                        required
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs text-indigo-600"
                        value={editingHybridPlan ? editingHybridPlan.slug : newHybridPlan.slug}
                        onChange={e => editingHybridPlan ? setEditingHybridPlan({ ...editingHybridPlan, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }) : setNewHybridPlan({ ...newHybridPlan, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                      <textarea
                        required
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl h-24 resize-none text-sm text-slate-600"
                        value={editingHybridPlan ? editingHybridPlan.description : newHybridPlan.description}
                        onChange={e => editingHybridPlan ? setEditingHybridPlan({ ...editingHybridPlan, description: e.target.value }) : setNewHybridPlan({ ...newHybridPlan, description: e.target.value })}
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
                          onChange={e => editingHybridPlan ? setEditingHybridPlan({ ...editingHybridPlan, basePrice: Number(e.target.value) }) : setNewHybridPlan({ ...newHybridPlan, basePrice: Number(e.target.value) })}
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
                          onChange={e => editingHybridPlan ? setEditingHybridPlan({ ...editingHybridPlan, pricePerOrder: Number(e.target.value) }) : setNewHybridPlan({ ...newHybridPlan, pricePerOrder: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Frecuencia de Liquidación</label>
                      <select
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800"
                        value={editingHybridPlan ? editingHybridPlan.variableBillingFrequency : newHybridPlan.variableBillingFrequency}
                        onChange={e => editingHybridPlan ? setEditingHybridPlan({ ...editingHybridPlan, variableBillingFrequency: e.target.value as any }) : setNewHybridPlan({ ...newHybridPlan, variableBillingFrequency: e.target.value as any })}
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
                        onChange={e => editingHybridPlan ? setEditingHybridPlan({ ...editingHybridPlan, hotmartUrl: e.target.value }) : setNewHybridPlan({ ...newHybridPlan, hotmartUrl: e.target.value })}
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-xl">
                        <input type="checkbox" className="w-4 h-4 rounded text-indigo-600" checked={editingHybridPlan ? editingHybridPlan.isPopular : newHybridPlan.isPopular} onChange={e => editingHybridPlan ? setEditingHybridPlan({ ...editingHybridPlan, isPopular: e.target.checked }) : setNewHybridPlan({ ...newHybridPlan, isPopular: e.target.checked })} />
                        <span className="text-[10px] font-black uppercase text-slate-600">Popular</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-xl">
                        <input type="checkbox" className="w-4 h-4 rounded text-indigo-600" checked={editingHybridPlan ? editingHybridPlan.isPublic : newHybridPlan.isPublic} onChange={e => editingHybridPlan ? setEditingHybridPlan({ ...editingHybridPlan, isPublic: e.target.checked }) : setNewHybridPlan({ ...newHybridPlan, isPublic: e.target.checked })} />
                        <span className="text-[10px] font-black uppercase text-slate-600">Público</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-xl">
                        <input type="checkbox" className="w-4 h-4 rounded text-indigo-600" checked={editingHybridPlan ? editingHybridPlan.isActive : newHybridPlan.isActive} onChange={e => editingHybridPlan ? setEditingHybridPlan({ ...editingHybridPlan, isActive: e.target.checked }) : setNewHybridPlan({ ...newHybridPlan, isActive: e.target.checked })} />
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
          )
        }

        {/* Modal CRUD Planes Fijos (Se mantiene igual pero con target 'landing' en el feature adder) */}
        {
          (isAddingPlan || isEditingPlan) && (
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
                        onChange={e => isEditingPlan ? setIsEditingPlan({ ...isEditingPlan, name: e.target.value }) : setNewPlan({ ...newPlan, name: e.target.value })}
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
                          onChange={e => isEditingPlan ? setIsEditingPlan({ ...isEditingPlan, price: Number(e.target.value) }) : setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Periodo</label>
                        <select
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none"
                          value={isEditingPlan ? isEditingPlan.period : newPlan.period}
                          onChange={e => isEditingPlan ? setIsEditingPlan({ ...isEditingPlan, period: e.target.value as any }) : setNewPlan({ ...newPlan, period: e.target.value as any })}
                        >
                          <option value="monthly">Mensual</option>
                          <option value="yearly">Anual</option>
                          <option value="lifetime">De por vida</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-xl">
                        <input type="checkbox" className="w-4 h-4 rounded text-indigo-600" checked={isEditingPlan ? isEditingPlan.isPopular : newPlan.isPopular} onChange={e => isEditingPlan ? setIsEditingPlan({ ...isEditingPlan, isPopular: e.target.checked }) : setNewPlan({ ...newPlan, isPopular: e.target.checked })} />
                        <span className="text-[10px] font-black uppercase text-slate-600">Popular</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-2 rounded-xl">
                        <input type="checkbox" className="w-4 h-4 rounded text-indigo-600" checked={isEditingPlan ? isEditingPlan.isActive : newPlan.isActive} onChange={e => isEditingPlan ? setIsEditingPlan({ ...isEditingPlan, isActive: e.target.checked }) : setNewPlan({ ...newPlan, isActive: e.target.checked })} />
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
          )
        }

        {/* ... Se mantienen las otras pestañas (payment-methods, businesses, services, modules) sin cambios ... */}
        {
          activeTab === 'payment-methods' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500 pb-20">
              {/* Columna Izquierda: Pasarelas Directas (8/12) */}
              <div className="lg:col-span-8 space-y-6">

                {/* Manual/QR Methods */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { id: 'nequi', name: 'Nequi', color: 'bg-emerald-500', icon: '📱' },
                    { id: 'bancolombia', name: 'Bancolombia', color: 'bg-yellow-400', icon: '🏦' },
                    { id: 'daviplata', name: 'Daviplata', color: 'bg-rose-600', icon: '💳' }
                  ].map(method => (
                    <div key={method.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${method.color} text-white rounded-xl flex items-center justify-center text-lg shadow-sm`}>
                            {method.icon}
                          </div>
                          <div>
                            <h3 className="font-black text-slate-800">{method.name}</h3>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Transferencia Directa</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={(paymentConfig as any)[method.id].enabled} onChange={() => setPaymentConfig({ ...paymentConfig, [method.id]: { ...(paymentConfig as any)[method.id], enabled: !(paymentConfig as any)[method.id].enabled } })} />
                          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                        </label>
                      </div>

                      {(paymentConfig as any)[method.id].enabled && (
                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Número de Cuenta</label>
                            <input
                              type="text"
                              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700"
                              value={(paymentConfig as any)[method.id].accountNumber}
                              onChange={e => setPaymentConfig({ ...paymentConfig, [method.id]: { ...(paymentConfig as any)[method.id], accountNumber: e.target.value } })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Titular</label>
                            <input
                              type="text"
                              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700"
                              value={(paymentConfig as any)[method.id].accountHolder}
                              onChange={e => setPaymentConfig({ ...paymentConfig, [method.id]: { ...(paymentConfig as any)[method.id], accountHolder: e.target.value } })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Imagen QR</label>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center border border-dashed border-slate-300 text-slate-400">
                                {(paymentConfig as any)[method.id].qrImage ? <img src={(paymentConfig as any)[method.id].qrImage} className="w-full h-full object-cover rounded-lg" /> : 'QR'}
                              </div>
                              <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Subir QR</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* API Gateways */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { id: 'stripe', name: 'Stripe Global', icon: '💳', color: 'bg-indigo-600' },
                    { id: 'mercadoPago', name: 'Mercado Pago', icon: '🤝', color: 'bg-sky-400' }
                  ].map(gateway => (
                    <div key={gateway.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 ${gateway.color} text-white rounded-2xl flex items-center justify-center text-xl shadow-lg`}>
                            {gateway.icon}
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-slate-800">{gateway.name}</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Pasarela API</span>
                              <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase ${(paymentConfig as any)[gateway.id].mode === 'production' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {(paymentConfig as any)[gateway.id].mode}
                              </span>
                            </div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={(paymentConfig as any)[gateway.id].enabled} onChange={() => setPaymentConfig({ ...paymentConfig, [gateway.id]: { ...(paymentConfig as any)[gateway.id], enabled: !(paymentConfig as any)[gateway.id].enabled } })} />
                          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                        </label>
                      </div>

                      {(paymentConfig as any)[gateway.id].enabled && (
                        <div className="space-y-4 animate-in fade-in duration-500">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Modo</label>
                              <select
                                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-700 outline-none"
                                value={(paymentConfig as any)[gateway.id].mode}
                                onChange={e => setPaymentConfig({ ...paymentConfig, [gateway.id]: { ...(paymentConfig as any)[gateway.id], mode: e.target.value as any } })}
                              >
                                <option value="sandbox">Sandbox</option>
                                <option value="production">Producción</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Public Key</label>
                              <input
                                type="password"
                                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-mono"
                                value={(paymentConfig as any)[gateway.id].publicKey}
                                onChange={e => setPaymentConfig({ ...paymentConfig, [gateway.id]: { ...(paymentConfig as any)[gateway.id], publicKey: e.target.value } })}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">{gateway.id === 'stripe' ? 'Secret Key' : 'Access Token'}</label>
                            <input
                              type="password"
                              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-mono"
                              value={gateway.id === 'stripe' ? (paymentConfig as any).stripe.secretKey : (paymentConfig as any).mercadoPago.accessToken}
                              onChange={e => setPaymentConfig({ ...paymentConfig, [gateway.id]: { ...(paymentConfig as any)[gateway.id], [gateway.id === 'stripe' ? 'secretKey' : 'accessToken']: e.target.value } })}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Columna Derecha: Hotmart (4/12) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-8 rounded-[3rem] border-2 border-indigo-100 shadow-xl shadow-indigo-50/50 space-y-8 sticky top-8">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl">
                        🔥
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-800">Hotmart Global</h3>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Checkout Externo</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={paymentConfig.hotmartGlobal.enabled} onChange={() => setPaymentConfig({ ...paymentConfig, hotmartGlobal: { ...paymentConfig.hotmartGlobal, enabled: !paymentConfig.hotmartGlobal.enabled } })} />
                      <div className="w-14 h-7 bg-slate-200 rounded-full peer peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
                    </label>
                  </div>

                  {paymentConfig.hotmartGlobal.enabled && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-500">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Instrucciones de Pago</label>
                        <textarea
                          className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-600 h-24 resize-none"
                          value={paymentConfig.hotmartGlobal.instructions}
                          onChange={e => setPaymentConfig({ ...paymentConfig, hotmartGlobal: { ...paymentConfig.hotmartGlobal, instructions: e.target.value } })}
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Links de Checkout por Plan</div>

                        <div className="space-y-6 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-slate-100">
                          {/* Landing Plans */}
                          <div className="space-y-3">
                            <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-tighter">Planes Fijos</div>
                            {landingPlans.map(plan => (
                              <div key={plan.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-black text-slate-700">{plan.name}</span>
                                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{plan.period}</span>
                                </div>
                                <input
                                  type="text"
                                  placeholder="https://pay.hotmart.com/..."
                                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-mono text-indigo-600 outline-none focus:ring-1 focus:ring-indigo-500"
                                  value={plan.hotmartUrl || ''}
                                  onChange={e => setLandingPlans(prev => prev.map(p => p.id === plan.id ? { ...p, hotmartUrl: e.target.value } : p))}
                                />
                              </div>
                            ))}
                          </div>

                          {/* Hybrid Plans */}
                          <div className="space-y-3">
                            <div className="text-[9px] font-bold text-amber-500 uppercase tracking-tighter">Planes Híbridos</div>
                            {hybridPlans.map(plan => (
                              <div key={plan.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-black text-slate-700">{plan.name}</span>
                                  <span className="text-[8px] font-bold text-amber-500 uppercase tracking-tighter">Híbrido</span>
                                </div>
                                <input
                                  type="text"
                                  placeholder="https://pay.hotmart.com/..."
                                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-mono text-indigo-600 outline-none focus:ring-1 focus:ring-indigo-500"
                                  value={plan.hotmartUrl || ''}
                                  onChange={e => setHybridPlans(prev => prev.map(p => p.id === plan.id ? { ...p, hotmartUrl: e.target.value } : p))}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }

        {
          activeTab === 'businesses' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <input
                    type="text"
                    placeholder="Buscar negocio..."
                    className="w-full p-4 pl-12 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 transition-all"
                    value={businessSearchTerm}
                    onChange={e => setBusinessSearchTerm(e.target.value)}
                  />
                  <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <select
                    className="flex-1 md:w-40 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500"
                    value={businessPlanFilter}
                    onChange={e => setBusinessPlanFilter(e.target.value)}
                  >
                    <option value="Todos">Todos los Planes</option>
                    <optgroup label="Planes Fijos">
                      {landingPlans.map(p => <option key={p.id} value={p.slug}>{p.name}</option>)}
                    </optgroup>
                    <optgroup label="Planes Híbridos">
                      {hybridPlans.map(p => <option key={p.id} value={p.slug}>{p.name} (H)</option>)}
                    </optgroup>
                  </select>

                  <select
                    className="flex-1 md:w-36 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500"
                    value={businessStatusFilter}
                    onChange={e => setBusinessStatusFilter(e.target.value as any)}
                  >
                    <option value="Todos">Todos los Estados</option>
                    <option value="Activo">Activos</option>
                    <option value="Inactivo">Inactivos</option>
                  </select>
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b">
                    <tr><th className="px-6 py-4 font-bold text-xs uppercase text-slate-400">Negocio</th><th className="px-6 py-4 font-bold text-xs uppercase text-slate-400">Acción</th></tr>
                  </thead>
                  <tbody>
                    {filteredBusinessesList.map(b => (
                      <tr key={b.id} className="hover:bg-slate-50 border-b">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={b.logo} className="w-8 h-8 rounded-full object-cover border" alt="" />
                            <div>
                              <div className="font-bold text-slate-800 leading-none">{b.name}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{b.type}</div>
                                <div className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase ${b.isActive !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                  {b.isActive !== false ? 'Activo' : 'Inactivo'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setEditingBusiness(b)}
                            className="px-4 py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-xl hover:bg-indigo-100 transition active:scale-95"
                          >
                            Gestionar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }

        {
          activeTab === 'modules' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500 pb-20">
              {modules.map(mod => (
                <div key={mod.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                      {mod.icon}
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xl font-black text-indigo-600">${mod.price}</div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pago Único/Mes</div>
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">{mod.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6 h-10 overflow-hidden line-clamp-2">
                    {mod.description}
                  </p>
                  <div className="pt-6 border-t flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${mod.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {mod.status === 'active' ? 'Disponible' : 'Desactivado'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingModule(mod)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Estás seguro de eliminar el módulo "${mod.name}"?`)) {
                            setModules(prev => prev.filter(m => m.id !== mod.id));
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        }

        {
          activeTab === 'services' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500 pb-20">
              {systemServices.map(svc => (
                <div key={svc.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                      {svc.name.includes('Google') ? '🤖' : svc.name.includes('Twilio') ? '📱' : svc.name.includes('AWS') ? '☁️' : '🛠️'}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${svc.status === 'active' ? 'bg-emerald-50 text-emerald-600' : svc.status === 'maintenance' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
                      {svc.status}
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-1">{svc.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">{svc.provider}</p>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6 h-10 overflow-hidden line-clamp-2">
                    {svc.description}
                  </p>
                  <div className="pt-6 border-t flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Endpoint</span>
                      <span className="text-[10px] font-mono text-slate-600 truncate max-w-[150px]">{svc.endpoint}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingService(svc)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Estás seguro de eliminar el servicio "${svc.name}"?`)) {
                            setSystemServices(prev => prev.filter(s => s.id !== svc.id));
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        }

        {/* Planes SaaS Grid */}
        {activeTab === 'saas-plans' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500 pb-20">
            {saasPlans.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-300">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-slate-400 mb-1">No hay planes base creados</h3>
                <button onClick={() => setIsAddingSaasPlan(true)} className="text-indigo-600 font-bold hover:underline">Crear el primer plan</button>
              </div>
            ) : (
              saasPlans.map(plan => (
                <div key={plan.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 p-4 rounded-bl-[2rem] text-xs font-black uppercase tracking-widest ${plan.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {plan.status === 'active' ? 'Activo' : 'Inactivo'}
                  </div>

                  <div className="mb-6">
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                      {plan.type === 'mensual' ? 'Mensual' : plan.type === 'anual' ? 'Anual' : 'Pago Único'}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-800 mb-2">{plan.name}</h3>
                  <div className="text-4xl font-black text-slate-800 mb-4">
                    ${plan.price}
                    <span className="text-sm text-slate-400 font-bold ml-1">/{plan.type === 'mensual' ? 'mes' : plan.type === 'anual' ? 'año' : 'vez'}</span>
                  </div>

                  <p className="text-sm text-slate-500 leading-relaxed mb-8 min-h-[60px]">
                    {plan.description}
                  </p>

                  <div className="pt-6 border-t flex gap-2">
                    <button
                      onClick={() => setEditingSaasPlan(plan)}
                      className="flex-1 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      Editar
                    </button>
                  </div>
                </div>
              )))}
          </div>
        )}

        {
          activeTab === 'integrations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500 pb-20">
              {integrations.map(integration => (
                <div key={integration.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-slate-50 text-2xl rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner group-hover:scale-110 transition-transform">
                      {integration.icon}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${integration.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {integration.status === 'active' ? 'Activo' : 'Inactivo'}
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-2">{integration.name}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-6 h-10 overflow-hidden line-clamp-2">
                    {integration.description}
                  </p>
                  <div className="pt-6 border-t flex items-center justify-between">
                    {integration.docsUrl && (
                      <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                        Docs
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                      </a>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingIntegration(integration)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Estás seguro de eliminar la integración "${integration.name}"?`)) {
                            setIntegrations(prev => prev.filter(i => i.id !== integration.id));
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        }
        {/* Modal: Nuevo Plan SaaS */}
        {isAddingSaasPlan && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">Nuevo Plan SaaS</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Define un nuevo nivel de servicio</p>
                </div>
                <button
                  onClick={() => setIsAddingSaasPlan(false)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleCreateSaasPlan}>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre del Plan</label>
                  <input
                    required
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Ej. Empleados PRO"
                    value={newSaasPlan.name}
                    onChange={e => setNewSaasPlan({ ...newSaasPlan, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Precio</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={newSaasPlan.price}
                      onChange={e => setNewSaasPlan({ ...newSaasPlan, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Frecuencia</label>
                    <select
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none"
                      value={newSaasPlan.type}
                      onChange={e => setNewSaasPlan({ ...newSaasPlan, type: e.target.value as any })}
                    >
                      <option value="mensual">Mensual</option>
                      <option value="anual">Anual</option>
                      <option value="unico">Pago Único</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                  <textarea
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Detalles y beneficios del plan..."
                    value={newSaasPlan.description}
                    onChange={e => setNewSaasPlan({ ...newSaasPlan, description: e.target.value })}
                  />
                </div>

                <div className="pt-6 border-t flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsAddingSaasPlan(false)}
                    className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    Crear Plan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Editar Plan SaaS */}
        {editingSaasPlan && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-800">Editar Plan SaaS</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Modificar parámetros del plan</p>
                </div>
                <button
                  onClick={() => setEditingSaasPlan(null)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleUpdateSaasPlan}>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre del Plan</label>
                  <input
                    required
                    type="text"
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editingSaasPlan.name}
                    onChange={e => setEditingSaasPlan({ ...editingSaasPlan, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Precio</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={editingSaasPlan.price}
                      onChange={e => setEditingSaasPlan({ ...editingSaasPlan, price: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Estado</label>
                    <select
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none"
                      value={editingSaasPlan.status}
                      onChange={e => setEditingSaasPlan({ ...editingSaasPlan, status: e.target.value as any })}
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                  <textarea
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={editingSaasPlan.description || ''}
                    onChange={e => setEditingSaasPlan({ ...editingSaasPlan, description: e.target.value })}
                  />
                </div>

                <div className="pt-6 border-t flex gap-4">
                  <button
                    type="button"
                    onClick={() => setEditingSaasPlan(null)}
                    className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal: Gestión de Negocio */}
        {
          editingBusiness && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <img src={editingBusiness.logo} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm" alt="" />
                    <div>
                      <h3 className="text-2xl font-black text-slate-800">Gestionar Negocio</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: {editingBusiness.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingBusiness(null)}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <form onSubmit={handleUpdateBusiness} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre del Negocio</label>
                      <input
                        required
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800"
                        value={editingBusiness.name}
                        onChange={e => setEditingBusiness({ ...editingBusiness, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email del Dueño</label>
                      <input
                        required
                        type="email"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800"
                        value={editingBusiness.email}
                        onChange={e => setEditingBusiness({ ...editingBusiness, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tipo de Negocio</label>
                      <input
                        required
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800"
                        value={editingBusiness.type}
                        onChange={e => setEditingBusiness({ ...editingBusiness, type: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Plan Asignado</label>
                      <select
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-indigo-600 outline-none"
                        value={editingBusiness.planId}
                        onChange={e => setEditingBusiness({ ...editingBusiness, planId: e.target.value as any })}
                      >
                        <option value="">Seleccionar plan...</option>
                        <optgroup label="Planes SaaS Base">
                          {saasPlans.map(p => <option key={p.id} value={p.id}>{p.name} (${p.price}/{p.type === 'mensual' ? 'mes' : 'año'})</option>)}
                        </optgroup>
                        <optgroup label="Planes Fijos">
                          {landingPlans.map(p => <option key={p.id} value={p.slug}>{p.name} ({p.period})</option>)}
                        </optgroup>
                        <optgroup label="Planes Híbridos">
                          {hybridPlans.map(p => <option key={p.id} value={p.slug}>{p.name} (Híbrido)</option>)}
                        </optgroup>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <div className={`p-3 rounded-xl ${editingBusiness.isActive !== false ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-black text-slate-800">Estado del Negocio</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{editingBusiness.isActive !== false ? 'Vigilado y Activo en la plataforma' : 'Acceso restringido temporalmente'}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={editingBusiness.isActive !== false} onChange={e => setEditingBusiness({ ...editingBusiness, isActive: e.target.checked })} />
                      <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  <div className="pt-8 border-t flex flex-col md:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => handleDeleteBusiness(editingBusiness.id)}
                      className="px-8 py-4 bg-rose-50 text-rose-600 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-rose-100 transition active:scale-95"
                    >
                      Eliminar Negocio
                    </button>
                    <div className="flex-1"></div>
                    <button
                      type="button"
                      onClick={() => setEditingBusiness(null)}
                      className="px-8 py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingBusiness}
                      className="px-10 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-indigo-700 transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSavingBusiness ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : 'Guardar Cambios'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }

        {/* Modal: Agregar Integración */}
        {/* Modal: Editar Integración */}
        {
          editingIntegration && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">Gestionar Integración</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Modifica los parámetros de conexión comercial</p>
                  </div>
                  <button
                    onClick={() => setEditingIntegration(null)}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  setIntegrations(prev => prev.map(i => i.id === editingIntegration.id ? editingIntegration : i));
                  setEditingIntegration(null);
                }}>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                    <input
                      required
                      type="text"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={editingIntegration.name}
                      onChange={e => setEditingIntegration({ ...editingIntegration, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                    <textarea
                      required
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={editingIntegration.description}
                      onChange={e => setEditingIntegration({ ...editingIntegration, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Icono (Emoji)</label>
                      <input
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-2xl"
                        value={editingIntegration.icon}
                        onChange={e => setEditingIntegration({ ...editingIntegration, icon: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Estado</label>
                      <select
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none"
                        value={editingIntegration.status}
                        onChange={e => setEditingIntegration({ ...editingIntegration, status: e.target.value as any })}
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">URL de Documentación</label>
                    <input
                      type="url"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-mono"
                      value={editingIntegration.docsUrl || ''}
                      onChange={e => setEditingIntegration({ ...editingIntegration, docsUrl: e.target.value })}
                    />
                  </div>

                  <div className="pt-6 border-t flex gap-4">
                    <button
                      type="button"
                      onClick={() => setEditingIntegration(null)}
                      className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }
        {
          isAddingIntegration && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">Nueva Integración</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Conecta con herramientas externas</p>
                  </div>
                  <button
                    onClick={() => setIsAddingIntegration(false)}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  const integrationToCreate: Integration = {
                    ...newIntegration as Integration,
                    id: 'i' + Date.now()
                  };
                  setIntegrations(prev => [...prev, integrationToCreate]);
                  setIsAddingIntegration(false);
                  setNewIntegration({ name: '', description: '', icon: '🔌', status: 'active', docsUrl: '' });
                }}>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                    <input
                      required
                      type="text"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Ej. Zapier"
                      value={newIntegration.name}
                      onChange={e => setNewIntegration({ ...newIntegration, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                    <textarea
                      required
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Describe qué hace esta integración..."
                      value={newIntegration.description}
                      onChange={e => setNewIntegration({ ...newIntegration, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Icono (Emoji)</label>
                      <input
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-2xl"
                        value={newIntegration.icon}
                        onChange={e => setNewIntegration({ ...newIntegration, icon: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Estado</label>
                      <select
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none"
                        value={newIntegration.status}
                        onChange={e => setNewIntegration({ ...newIntegration, status: e.target.value as any })}
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">URL de Documentación (Opcional)</label>
                    <input
                      type="url"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-mono"
                      placeholder="https://docs.ejemplo.com"
                      value={newIntegration.docsUrl}
                      onChange={e => setNewIntegration({ ...newIntegration, docsUrl: e.target.value })}
                    />
                  </div>

                  <div className="pt-6 border-t flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsAddingIntegration(false)}
                      className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                      Crear Integración
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }
        {/* Modal: Editar Servicio */}
        {
          editingService && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">Gestionar Servicio</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configuración técnica maestra</p>
                  </div>
                  <button
                    onClick={() => setEditingService(null)}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  setSystemServices(prev => prev.map(s => s.id === editingService.id ? editingService : s));
                  setEditingService(null);
                }}>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                      <input
                        required
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={editingService.name}
                        onChange={e => setEditingService({ ...editingService, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Proveedor</label>
                      <input
                        required
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={editingService.provider}
                        onChange={e => setEditingService({ ...editingService, provider: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                    <textarea
                      required
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={editingService.description}
                      onChange={e => setEditingService({ ...editingService, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Estado Operativo</label>
                      <select
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none"
                        value={editingService.status}
                        onChange={e => setEditingService({ ...editingService, status: e.target.value as any })}
                      >
                        <option value="active">Activo</option>
                        <option value="maintenance">Mantenimiento</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Endpoint / API Link</label>
                      <input
                        required
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={editingService.endpoint}
                        onChange={e => setEditingService({ ...editingService, endpoint: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t flex gap-4">
                    <button
                      type="button"
                      onClick={() => setEditingService(null)}
                      className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }
        {/* Modal: Agregar Servicio */}
        {
          isAddingService && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">Nuevo Servicio Central</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Configuración de infraestructura maestra</p>
                  </div>
                  <button
                    onClick={() => setIsAddingService(false)}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  const serviceToCreate: SystemService = {
                    ...newService as SystemService,
                    id: 's' + Date.now()
                  };
                  setSystemServices(prev => [...prev, serviceToCreate]);
                  setIsAddingService(false);
                  setNewService({ name: '', provider: '', description: '', status: 'active', endpoint: '' });
                }}>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre del Servicio</label>
                      <input
                        required
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Ej. AWS S3"
                        value={newService.name}
                        onChange={e => setNewService({ ...newService, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Proveedor</label>
                      <input
                        required
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Ej. Amazon"
                        value={newService.provider}
                        onChange={e => setNewService({ ...newService, provider: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                    <textarea
                      required
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="¿Para qué se usa este servicio?"
                      value={newService.description}
                      onChange={e => setNewService({ ...newService, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Estado Operativo</label>
                      <select
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none"
                        value={newService.status}
                        onChange={e => setNewService({ ...newService, status: e.target.value as any })}
                      >
                        <option value="active">Activo</option>
                        <option value="maintenance">Mantenimiento</option>
                        <option value="offline">Offline</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Endpoint / API Link</label>
                      <input
                        required
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="api.example.com/v1"
                        value={newService.endpoint}
                        onChange={e => setNewService({ ...newService, endpoint: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsAddingService(false)}
                      className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                      Registrar Servicio
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }
        {/* Modal: Editar Módulo */}
        {
          editingModule && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">Gestionar Módulo</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ajustes comerciales y de disponibilidad</p>
                  </div>
                  <button
                    onClick={() => setEditingModule(null)}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  setModules(prev => prev.map(m => m.id === editingModule.id ? editingModule : m));
                  setEditingModule(null);
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre</label>
                      <input
                        required
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={editingModule.name}
                        onChange={e => setEditingModule({ ...editingModule, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Icono</label>
                      <input
                        required
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={editingModule.icon}
                        onChange={e => setEditingModule({ ...editingModule, icon: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Descripción</label>
                    <textarea
                      required
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={editingModule.description}
                      onChange={e => setEditingModule({ ...editingModule, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Precio Mensual (USD)</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={editingModule.price}
                        onChange={e => setEditingModule({ ...editingModule, price: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Estado</label>
                      <select
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={editingModule.status}
                        onChange={e => setEditingModule({ ...editingModule, status: e.target.value as any })}
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 border-t flex gap-4">
                    <button
                      type="button"
                      onClick={() => setEditingModule(null)}
                      className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }
        {/* Modal: Agregar Módulo */}
        {
          isAddingModule && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-800">Nuevo Módulo Extra</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Expande las capacidades de los negocios</p>
                  </div>
                  <button
                    onClick={() => setIsAddingModule(false)}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <form className="space-y-6" onSubmit={(e) => {
                  e.preventDefault();
                  const moduleToCreate: Module = {
                    ...newModule as Module,
                    id: 'm' + Date.now()
                  };
                  setModules(prev => [...prev, moduleToCreate]);
                  setIsAddingModule(false);
                  setNewModule({ name: '', description: '', icon: '🧩', price: 0, status: 'active' });
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre del Módulo</label>
                      <input
                        required
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Ej. Control de Turnos"
                        value={newModule.name}
                        onChange={e => setNewModule({ ...newModule, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Icono (Emoji)</label>
                      <input
                        required
                        type="text"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={newModule.icon}
                        onChange={e => setNewModule({ ...newModule, icon: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Descripción Comercial</label>
                    <textarea
                      required
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 h-24 resize-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Describe los beneficios para el cliente..."
                      value={newModule.description}
                      onChange={e => setNewModule({ ...newModule, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Precio Adicional (USD)</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={newModule.price}
                        onChange={e => setNewModule({ ...newModule, price: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Estado de Lanzamiento</label>
                      <select
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                        value={newModule.status}
                        onChange={e => setNewModule({ ...newModule, status: e.target.value as any })}
                      >
                        <option value="active">Activo / Disponible</option>
                        <option value="inactive">Inactivo / Oculto</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-6 border-t flex gap-4">
                    <button
                      type="button"
                      onClick={() => setIsAddingModule(false)}
                      className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-[2] py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                      Crear Módulo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )
        }
      </main >
    </div >
  );
};

export default SuperAdminPanel;
