
import { supabase } from '../lib/supabaseClient';
import { Order } from '../types';

export const orderService = {
  async getOrders(businessId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(o => ({
      ...o,
      businessId: o.business_id,
      customerName: o.customer_name,
      customerPhone: o.customer_phone,
      paymentMethod: o.payment_method,
      createdAt: new Date(o.created_at).getTime()
    })) as Order[];
  },

  async createOrder(order: Partial<Order>) {
    const payload = {
      business_id: order.businessId,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      items: order.items,
      total: order.total,
      payment_method: order.paymentMethod,
      status: order.status || 'pending',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  }
};
