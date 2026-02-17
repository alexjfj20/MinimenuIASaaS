
import { supabase } from '../lib/supabaseClient';
import { Business, PlanType, BusinessSocials } from '../types';

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
    const defaultSocials: BusinessSocials = { whatsapp: '', instagram: '', facebook: '', twitter: '', tiktok: '', youtube: '', website: '' };
    const defaultPaymentConfigs = {
      cash: { enabled: true },
      nequi: { enabled: false, accountHolder: '', accountNumber: '', qrImage: '' },
      daviplata: { enabled: false, accountHolder: '', accountNumber: '', qrImage: '' },
      bancolombia: { enabled: false, accountHolder: '', accountNumber: '', qrImage: '' },
      mercadoPago: { enabled: false, publicKey: '', accessToken: '', mode: 'sandbox' },
      stripe: { enabled: false, publicKey: '', secretKey: '', mode: 'sandbox' }
    };

    return {
      id: b.id,
      name: b.name || 'Negocio sin nombre',
      type: b.type || 'Restaurante',
      email: b.email || '',
      phone: b.phone || '',
      location: b.location || '',
      description: b.description || '',
      planId: b.plan_id || PlanType.BASIC,
      hybridPlanId: b.hybrid_plan_id,
      logo: b.logo || `https://picsum.photos/seed/${b.id}/200/200`,
      avatar: b.avatar || '',
      banner: b.banner || '',
      iva: b.iva || 0,
      deliveryValue: b.delivery_value || 0,
      googleMapsIframe: b.google_maps_iframe || '',
      menuSlug: b.menu_slug || '',
      menuSlugActive: b.menu_slug_active || false,
      customShareMessage: b.custom_share_message || '',
      customShareImageUrl: b.custom_share_image_url || '',
      countryCode: b.country_code || '57', // Default a 57 si no existe, como fallback seguro para este usuario
      socials: { ...defaultSocials, ...(b.socials || {}) },
      paymentMethods: b.payment_methods || ['cash'],
      paymentConfigs: {
        cash: { ...defaultPaymentConfigs.cash, ...(b.payment_configs?.cash || {}) },
        nequi: { ...defaultPaymentConfigs.nequi, ...(b.payment_configs?.nequi || {}) },
        daviplata: { ...defaultPaymentConfigs.daviplata, ...(b.payment_configs?.daviplata || {}) },
        bancolombia: { ...defaultPaymentConfigs.bancolombia, ...(b.payment_configs?.bancolombia || {}) },
        mercadoPago: { ...defaultPaymentConfigs.mercadoPago, ...(b.payment_configs?.mercadoPago || {}) },
        stripe: { ...defaultPaymentConfigs.stripe, ...(b.payment_configs?.stripe || {}) }
      },
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
      description: business.description,
      plan_id: business.planId,
      logo: business.logo,
      banner: business.banner,
      owner_id: userId,
      socials: business.socials || { whatsapp: business.phone },
      payment_methods: business.paymentMethods || ['cash'],
      payment_configs: business.paymentConfigs || { cash: { enabled: true } },
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
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.countryCode !== undefined) payload.country_code = updates.countryCode;
    if (updates.logo !== undefined) payload.logo = updates.logo;
    if (updates.avatar !== undefined) payload.avatar = updates.avatar;
    if (updates.banner !== undefined) payload.banner = updates.banner;
    if (updates.iva !== undefined) payload.iva = isNaN(Number(updates.iva)) ? 0 : Number(updates.iva);
    if (updates.deliveryValue !== undefined) payload.delivery_value = isNaN(Number(updates.deliveryValue)) ? 0 : Number(updates.deliveryValue);
    if (updates.googleMapsIframe !== undefined) payload.google_maps_iframe = updates.googleMapsIframe;
    if (updates.socials !== undefined) payload.socials = updates.socials;
    if (updates.paymentMethods !== undefined) payload.payment_methods = updates.paymentMethods;
    if (updates.paymentConfigs !== undefined) payload.payment_configs = updates.paymentConfigs;
    if (updates.planId !== undefined) payload.plan_id = updates.planId;
    if (updates.menuSlug !== undefined) {
      const cleaned = updates.menuSlug.toLowerCase().trim();
      payload.menu_slug = cleaned === '' ? null : cleaned;
    } if (updates.menuSlugActive !== undefined) payload.menu_slug_active = updates.menuSlugActive;
    if (updates.customShareMessage !== undefined) payload.custom_share_message = updates.customShareMessage;
    if (updates.customShareImageUrl !== undefined) payload.custom_share_image_url = updates.customShareImageUrl;
    if (updates.usage !== undefined) payload.usage = updates.usage;

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
