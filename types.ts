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
  hotmartUrl?: string;
}

export interface LandingPlan {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  period: 'monthly' | 'yearly' | 'lifetime';
  features: string[];
  isActive: boolean;
  isPublic: boolean;
  isPopular: boolean;
  order: number;
  icon: string;
  color: string;
  maxUsers: number;
  maxProjects: number;
}

export interface PlanAuditLog {
  id: string;
  planId: string;
  planName: string;
  action: 'create' | 'update' | 'delete';
  timestamp: number;
  details: string;
}

export interface HybridPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  pricePerOrder: number;
  currency: string;
  variableBillingFrequency: 'weekly' | 'biweekly' | 'monthly';
  features: string[];
  isActive: boolean;
  isPublic: boolean;
  isPopular?: boolean;
  hotmartUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  status: 'active' | 'inactive';
}

export interface SystemService {
  id: string;
  name: string;
  provider: string;
  description: string;
  status: 'active' | 'maintenance' | 'offline';
  endpoint: string;
}

export interface GlobalPaymentConfig {
  nequi: { enabled: boolean; accountNumber: string; accountHolder: string; instructions: string; qrImage?: string };
  bancolombia: { enabled: boolean; accountNumber: string; accountHolder: string; instructions: string; qrImage?: string };
  daviplata: { enabled: boolean; accountNumber: string; accountHolder: string; instructions: string; qrImage?: string };
  breB: { enabled: boolean; accountKey: string; instructions: string; qrImage?: string };
  stripe: { enabled: boolean; publicKey: string; secretKey: string; mode: 'sandbox' | 'production'; instructions: string };
  mercadoPago: { enabled: boolean; publicKey: string; accessToken: string; mode: 'sandbox' | 'production'; instructions: string; qrImage?: string };
  paypal: { enabled: boolean; clientId: string; secretKey: string; mode: 'sandbox' | 'production'; instructions: string; qrImage?: string };
  hotmartGlobal: { enabled: boolean; instructions: string; planUrls: Record<string, string> };
}

export interface Business {
  id: string;
  name: string;
  type: string;
  email: string;
  phone: string;
  location: string;
  planId: PlanType;
  hybridPlanId?: string;
  logo: string;
  avatar?: string;
  banner?: string;
  iva?: number;
  deliveryValue?: number;
  googleMapsIframe?: string;
  menuSlug?: string;
  menuSlugActive?: boolean;
  customShareMessage?: string;
  customShareImageUrl?: string;
  socials: {
    whatsapp?: string;
    instagram?: string;
  };
  paymentMethods: string[];
  paymentConfigs?: Record<string, { account?: string; instructions?: string; qrImage?: string }>;
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