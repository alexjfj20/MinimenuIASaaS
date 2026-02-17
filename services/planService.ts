import { supabase } from '../lib/supabaseClient';
import { SaasPlan, BusinessPlanAssignment } from '../types';

export const planService = {
    /**
     * Obtener todos los planes disponibles
     */
    async getPlans(): Promise<SaasPlan[]> {
        const { data, error } = await supabase
            .from('planes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map((p: any) => ({
            id: p.id,
            name: p.nombre,
            description: p.descripcion,
            price: Number(p.precio),
            type: p.tipo,
            status: p.estado,
            createdAt: p.created_at,
            updatedAt: p.updated_at
        }));
    },

    /**
     * Crear un nuevo plan maestro
     */
    async createPlan(plan: Omit<SaasPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<SaasPlan> {
        const { data, error } = await supabase
            .from('planes')
            .insert([{
                nombre: plan.name,
                descripcion: plan.description,
                precio: plan.price,
                tipo: plan.type,
                estado: plan.status
            }])
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.nombre,
            description: data.descripcion,
            price: Number(data.precio),
            type: data.tipo,
            status: data.estado,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    },

    /**
     * Actualizar un plan existente
     */
    async updatePlan(id: string, updates: Partial<SaasPlan>): Promise<SaasPlan> {
        const payload: any = {};
        if (updates.name !== undefined) payload.nombre = updates.name;
        if (updates.description !== undefined) payload.descripcion = updates.description;
        if (updates.price !== undefined) payload.precio = updates.price;
        if (updates.type !== undefined) payload.tipo = updates.type;
        if (updates.status !== undefined) payload.estado = updates.status;

        const { data, error } = await supabase
            .from('planes')
            .update({ ...payload, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.nombre,
            description: data.descripcion,
            price: Number(data.precio),
            type: data.tipo,
            status: data.estado,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    },

    /**
     * Asignar un plan a un negocio (Desactiva el anterior automáticamente)
     */
    async assignPlanToBusiness(businessId: string, planId: string): Promise<BusinessPlanAssignment> {
        // 1. Desactivar planes anteriores
        await supabase
            .from('negocio_planes')
            .update({ estado: 'vencido', fecha_fin: new Date().toISOString() })
            .eq('negocio_id', businessId)
            .eq('estado', 'activo');

        // 2. Asignar nuevo plan
        const { data, error } = await supabase
            .from('negocio_planes')
            .insert([{
                negocio_id: businessId,
                plan_id: planId,
                fecha_inicio: new Date().toISOString(),
                estado: 'activo'
            }])
            .select(`
        *,
        plan:planes(nombre, precio, tipo)
      `)
            .single();

        if (error) throw error;

        return {
            id: data.id,
            businessId: data.negocio_id,
            planId: data.plan_id,
            startDate: data.fecha_inicio,
            endDate: data.fecha_fin,
            status: data.estado,
            planName: data.plan?.nombre,
            planPrice: data.plan?.precio,
            planType: data.plan?.tipo
        };
    },

    /**
     * Obtener el plan activo de un negocio
     */
    async getActiveBusinessPlan(businessId: string): Promise<BusinessPlanAssignment | null> {
        const { data, error } = await supabase
            .from('negocio_planes')
            .select(`
        *,
        plan:planes(nombre, precio, tipo)
      `)
            .eq('negocio_id', businessId)
            .eq('estado', 'activo')
            .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error; // Ignorar error si no hay registros
        if (!data) return null;

        return {
            id: data.id,
            businessId: data.negocio_id,
            planId: data.plan_id,
            startDate: data.fecha_inicio,
            endDate: data.fecha_fin,
            status: data.estado,
            planName: data.plan?.nombre,
            planPrice: data.plan?.precio,
            planType: data.plan?.tipo
        };
    }
};
