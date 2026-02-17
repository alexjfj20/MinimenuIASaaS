
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
      orderType: o.order_type,
      tableNumber: o.table_number,
      createdAt: new Date(o.created_at).getTime()
    })) as Order[];
  },

  async createOrder(order: Partial<Order>) {
    const payload = {
      business_id: order.businessId,
      customer_name: order.customerName || 'Cliente',
      customer_phone: order.customerPhone || '',
      items: order.items || [],
      total: order.total || 0,
      payment_method: order.paymentMethod || 'Efectivo',
      order_type: order.orderType || 'domicilio',
      table_number: order.tableNumber || null,
      address: order.address || null,
      city: order.city || null,
      department: order.department || null,
      notes: order.notes || null,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      businessId: data.business_id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      paymentMethod: data.payment_method,
      orderType: data.order_type,
      tableNumber: data.table_number,
      createdAt: new Date(data.created_at).getTime()
    } as Order;
  },

  async updateOrderStatus(orderId: string, status: Order['status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  }
};
