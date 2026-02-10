import { Plan, PlanType, Business, HybridPlan } from './types';

export const PLANS: Record<PlanType, Plan> = {
  [PlanType.BASIC]: {
    id: PlanType.BASIC,
    name: 'Básico',
    price: 0,
    maxProducts: 10,
    maxVoiceAI: 5,
    features: ['Menú Digital', 'Gestión de Pedidos', '10 Productos', '5 Usos IA Voz']
  },
  [PlanType.PRO]: {
    id: PlanType.PRO,
    name: 'Pro',
    price: 29.99,
    maxProducts: 50,
    maxVoiceAI: 100,
    features: ['Menú Digital', 'Gestión de Pedidos', '50 Productos', '100 Usos IA Voz', 'Estadísticas']
  },
  [PlanType.ENTERPRISE]: {
    id: PlanType.ENTERPRISE,
    name: 'Empresarial',
    price: 99.99,
    maxProducts: 9999,
    maxVoiceAI: 9999,
    features: ['Todo Ilimitado', 'Soporte Prioritario', 'Personalización Total']
  }
};

export const MOCK_HYBRID_PLANS: HybridPlan[] = [
  {
    id: 'hp1',
    name: 'Plan Crecimiento',
    slug: 'plan-crecimiento',
    description: 'Costo base bajo con comisión por pedido exitoso.',
    basePrice: 15.00,
    pricePerOrder: 0.50,
    currency: 'USD',
    variableBillingFrequency: 'monthly',
    features: ['Productos Ilimitados', 'Soporte WhatsApp', 'Panel de Analítica'],
    isActive: true,
    isPublic: true,
    isPopular: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'hp2',
    name: 'Plan Escala',
    slug: 'plan-escala',
    description: 'Ideal para negocios de alto volumen con comisiones reducidas.',
    basePrice: 45.00,
    pricePerOrder: 0.25,
    currency: 'USD',
    variableBillingFrequency: 'biweekly',
    features: ['Todo Ilimitado', 'API de Domicilios', 'Gestión Multi-Sucursal'],
    isActive: true,
    isPublic: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

export const MOCK_BUSINESSES: Business[] = [
  {
    id: 'b1',
    name: 'Burgers & Co',
    type: 'Restaurante',
    email: 'admin@burgers.com',
    phone: '3001234567',
    location: 'Calle 123, Bogotá',
    planId: PlanType.PRO,
    logo: 'https://picsum.photos/seed/burger/200/200',
    avatar: 'https://i.pravatar.cc/150?u=b1',
    banner: 'https://picsum.photos/seed/foodbanner/1200/400',
    iva: 19,
    deliveryValue: 5000,
    socials: { whatsapp: '3001234567', instagram: '@burgersco' },
    paymentMethods: ['Nequi', 'Daviplata', 'Efectivo'],
    usage: { voiceAICount: 12, productCount: 4 }
  }
];

export const CATEGORIES = ['Entradas', 'Platos Fuertes', 'Bebidas', 'Postres', 'Combos'];