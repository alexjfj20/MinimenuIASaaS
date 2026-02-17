
import { supabase } from '../lib/supabaseClient';
import { Table } from '../types';

export const tableService = {
    async getTables(businessId: string) {
        const { data, error } = await supabase
            .from('tables')
            .select('*')
            .eq('business_id', businessId)
            .order('number', { ascending: true });

        if (error) throw error;
        return (data || []).map(t => ({
            ...t,
            businessId: t.business_id,
            createdAt: new Date(t.created_at).getTime()
        })) as Table[];
    },

    async createTable(table: Partial<Table>) {
        const payload = {
            business_id: table.businessId,
            number: table.number,
            capacity: table.capacity || 1,
            location: table.location || null,
            status: table.status || 'active',
            description: table.description || null
        };

        const { data, error } = await supabase
            .from('tables')
            .insert([payload])
            .select()
            .single();

        if (error) throw error;
        return {
            ...data,
            businessId: data.business_id,
            createdAt: new Date(data.created_at).getTime()
        } as Table;
    },

    async updateTable(tableId: string, updates: Partial<Table>) {
        const payload: any = {};
        if (updates.number !== undefined) payload.number = updates.number;
        if (updates.capacity !== undefined) payload.capacity = updates.capacity;
        if (updates.location !== undefined) payload.location = updates.location;
        if (updates.status !== undefined) payload.status = updates.status;
        if (updates.description !== undefined) payload.description = updates.description;

        const { data, error } = await supabase
            .from('tables')
            .update(payload)
            .eq('id', tableId)
            .select()
            .single();

        if (error) throw error;
        return {
            ...data,
            businessId: data.business_id,
            createdAt: new Date(data.created_at).getTime()
        } as Table;
    },

    async deleteTable(tableId: string) {
        const { error } = await supabase
            .from('tables')
            .delete()
            .eq('id', tableId);

        if (error) throw error;
        return true;
    }
};
