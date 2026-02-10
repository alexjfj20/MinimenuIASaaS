
import { Plan, PlanType, Business } from './types';

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
