import { supabase } from '../lib/supabaseClient';
import { LandingPlan } from '../types';

interface LandingPlanRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  period: string;
  features: string[];
  is_active: boolean;
  is_public: boolean;
  is_popular: boolean;
  order: number;
  icon: string;
  color: string;
  max_users: number;
  max_projects: number;
  hotmart_url: string | null;
  created_at?: string;
  updated_at?: string;
}

function rowToPlan(row: LandingPlanRow & { order?: number }): LandingPlan {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? '',
    price: Number(row.price),
    currency: row.currency,
    period: row.period as LandingPlan['period'],
    features: Array.isArray(row.features) ? row.features : [],
    isActive: Boolean(row.is_active),
    isPublic: Boolean(row.is_public),
    isPopular: Boolean(row.is_popular),
    order: Number(row.order) || 0,
    icon: row.icon ?? '✨',
    color: row.color ?? '#6366f1',
    maxUsers: Number(row.max_users) || 0,
    maxProjects: Number(row.max_projects) || 0,
    hotmartUrl: row.hotmart_url ?? undefined
  };
}

export const landingPlanService = {
  /**
   * Obtener planes públicos y activos para la landing (página de inicio).
   */
  async getPublicLandingPlans(): Promise<LandingPlan[]> {
    const { data, error } = await supabase
      .from('landing_plans')
      .select('*')
      .eq('is_public', true)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    const plans = (data ?? []).map((row: LandingPlanRow) => rowToPlan(row));
    return plans.sort((a, b) => a.order - b.order);
  },

  /**
   * Obtener todos los planes (Super Admin).
   */
  async getAllLandingPlans(): Promise<LandingPlan[]> {
    const { data, error } = await supabase
      .from('landing_plans')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    const plans = (data ?? []).map((row: LandingPlanRow) => rowToPlan(row));
    return plans.sort((a, b) => a.order - b.order);
  },

  async createLandingPlan(plan: Omit<LandingPlan, 'id'>): Promise<LandingPlan> {
    const payload = {
      slug: plan.slug,
      name: plan.name,
      description: plan.description || null,
      price: plan.price,
      currency: plan.currency,
      period: plan.period,
      features: plan.features,
      is_active: plan.isActive,
      is_public: plan.isPublic,
      is_popular: plan.isPopular,
      order: plan.order,
      icon: plan.icon,
      color: plan.color,
      max_users: plan.maxUsers,
      max_projects: plan.maxProjects,
      hotmart_url: plan.hotmartUrl ?? null
    };

    const { data, error } = await supabase
      .from('landing_plans')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return rowToPlan(data as LandingPlanRow);
  },

  async updateLandingPlan(id: string, updates: Partial<LandingPlan>): Promise<LandingPlan> {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.price !== undefined) payload.price = updates.price;
    if (updates.currency !== undefined) payload.currency = updates.currency;
    if (updates.period !== undefined) payload.period = updates.period;
    if (updates.features !== undefined) payload.features = updates.features;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.isPublic !== undefined) payload.is_public = updates.isPublic;
    if (updates.isPopular !== undefined) payload.is_popular = updates.isPopular;
    if (updates.order !== undefined) payload.order = updates.order;
    if (updates.icon !== undefined) payload.icon = updates.icon;
    if (updates.color !== undefined) payload.color = updates.color;
    if (updates.maxUsers !== undefined) payload.max_users = updates.maxUsers;
    if (updates.maxProjects !== undefined) payload.max_projects = updates.maxProjects;
    if (updates.hotmartUrl !== undefined) payload.hotmart_url = updates.hotmartUrl;

    const { data, error } = await supabase
      .from('landing_plans')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return rowToPlan(data as LandingPlanRow);
  },

  async deleteLandingPlan(id: string): Promise<void> {
    const { error } = await supabase.from('landing_plans').delete().eq('id', id);
    if (error) throw error;
  }
};
