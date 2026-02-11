
import { supabase } from '../lib/supabaseClient';
import { Product } from '../types';

export const productService = {
  async getProducts(businessId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id,
      businessId: p.business_id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image,
      quantity: p.quantity,
      status: p.status
    })) as Product[];
  },

  async createProduct(product: Partial<Product>) {
    const payload = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      business_id: product.businessId,
      quantity: product.quantity || 0,
      status: product.status || 'active',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      businessId: data.business_id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image,
      quantity: data.quantity,
      status: data.status
    } as Product;
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const payload: any = { ...updates };
    if (updates.businessId) {
      payload.business_id = updates.businessId;
      delete payload.businessId;
    }

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Product;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};
