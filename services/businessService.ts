
import { supabase } from '../lib/supabaseClient';
import { Business, PlanType } from '../types';

export const businessService = {
  async getBusinesses(userId?: string) {
    let query = supabase.from('businesses').select('*');
    if (userId) query = query.eq('owner_id', userId);

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(b => this.mapBusiness(b)) as Business[];
  },

  /**
   * REGLA DE DOBLE VERIFICACIÓN:
   * 1. Busca por menu_slug (Alias personalizado)
   * 2. Si no existe, busca por ID (UUID)
   */
  async getBusinessByIdOrSlug(idOrSlug: string): Promise<Business | null> {
    if (!idOrSlug) return null;

    const cleanInput = idOrSlug.toLowerCase().trim();

    // 1. Intentar por Alias (Prioridad Máxima)
    const { data: slugData } = await supabase
      .from('businesses')
      .select('*')
      .eq('menu_slug', cleanInput)
      .maybeSingle();

    if (slugData) return this.mapBusiness(slugData);

    // 2. Intentar por ID (Solo si es formato UUID válido)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanInput);
    
    if (isUuid) {
      const { data: idData } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', cleanInput)
        .maybeSingle();
        
      if (idData) return this.mapBusiness(idData);
    }

    return null;
  },

  mapBusiness(b: any): Business {
    return {
      id: b.id,
      name: b.name || 'Negocio sin nombre',
      type: b.type || 'Restaurante',
      email: b.email || '',
      phone: b.phone || '',
      location: b.location || '',
      planId: b.plan_id || PlanType.BASIC,
      logo: b.logo || `https://picsum.photos/seed/${b.id}/200/200`,
      avatar: b.avatar || '',
      banner: b.banner || '',
      iva: b.iva || 0,
      deliveryValue: b.delivery_value || 0,
      menuSlug: b.menu_slug || '',
      menuSlugActive: b.menu_slug_active || false,
      customShareMessage: b.custom_share_message || '',
      socials: b.socials || { whatsapp: '', instagram: '' },
      paymentMethods: b.payment_methods || ['Efectivo'],
      usage: b.usage || { voiceAICount: 0, productCount: 0 }
    };
  },

  async createBusiness(business: Partial<Business>, userId: string) {
    const payload = {
      name: business.name,
      type: business.type,
      email: business.email,
      phone: business.phone,
      location: business.location,
      plan_id: business.planId,
      logo: business.logo,
      owner_id: userId,
      socials: business.socials || { whatsapp: business.phone },
      payment_methods: business.paymentMethods || ['Efectivo'],
      usage: { voiceAICount: 0, productCount: 0 },
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('businesses')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return this.mapBusiness(data);
  },

  async checkSlugAvailability(slug: string, currentBusinessId: string): Promise<boolean> {
    if (!slug) return true;
    const { data } = await supabase
      .from('businesses')
      .select('id')
      .eq('menu_slug', slug.toLowerCase().trim())
      .neq('id', currentBusinessId)
      .maybeSingle();
    
    return data === null;
  },

  async updateBusiness(id: string, updates: Partial<Business>) {
    const payload: any = {};
    if (updates.name) payload.name = updates.name;
    if (updates.planId) payload.plan_id = updates.planId;
    if (updates.menuSlug !== undefined) payload.menu_slug = updates.menuSlug.toLowerCase().trim();
    if (updates.menuSlugActive !== undefined) payload.menu_slug_active = updates.menuSlugActive;
    if (updates.customShareMessage !== undefined) payload.custom_share_message = updates.customShareMessage;
    if (updates.usage) payload.usage = updates.usage;
    
    const { data, error } = await supabase
      .from('businesses')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.mapBusiness(data);
  }
};
