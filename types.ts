
export enum PlanType {
  BASIC = 'BASIC',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  maxProducts: number;
  maxVoiceAI: number;
  features: string[];
}

export interface Business {
  id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  location: string;
  planId: PlanType;
  logo: string;
  avatar?: string;
  banner?: string;
  iva?: number;
  deliveryValue?: number;
  googleMapsIframe?: string;
  socials: {
    whatsapp?: string;
    instagram?: string;
  };
  paymentMethods: string[];
  usage: {
    voiceAICount: number;
    productCount: number;
  };
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
  status: 'active' | 'inactive';
}

export interface Order {
  id: string;
  businessId: string;
  customerName: string;
  customerPhone: string;
  items: { productId: string; name: string; quantity: number; price: number }[];
  total: number;
  paymentMethod: string;
  status: 'pending' | 'preparing' | 'delivered' | 'cancelled';
  createdAt: number;
}

export type AppView = 'landing' | 'register' | 'superadmin' | 'businessadmin' | 'publicmenu';

export interface UserSession {
  role: 'superadmin' | 'businessadmin' | 'customer';
  businessId?: string;
}
