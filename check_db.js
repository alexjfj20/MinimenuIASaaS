import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hybridnzbupmhqrtkkvd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnJpZG56YnVwbWhxcnRra3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NjAxMDgsImV4cCI6MjA4NjMzNjEwOH0.3ftLMQEvI2c8acUnX2pdEsmHe-yrpwoCERAl9oQZr04';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectRecord() {
    const targetId = 'e7415a19-ba68-4b96-8c11-d6fc4da45fb4';
    console.log(`Inspeccionando negocio ID: ${targetId}`);

    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', targetId)
        .single();

    if (error) {
        console.error('Error al consultar:', error);
        return;
    }

    if (data) {
        console.log('--- DATOS DEL NEGOCIO ---');
        console.log('ID:', data.id);
        console.log('Plan ID:', data.plan_id, '(Tipo:', typeof data.plan_id, ')');
        console.log('Menu Slug:', data.menu_slug, '(Tipo:', typeof data.menu_slug, ')');
        console.log('IVA:', data.iva, '(Tipo:', typeof data.iva, ')');
        console.log('Delivery Value:', data.delivery_value, '(Tipo:', typeof data.delivery_value, ')');
        console.log('Payment Configs:', JSON.stringify(data.payment_configs, null, 2));
        console.log('Payment Methods:', data.payment_methods);
        console.log('Avatar:', data.avatar);
    } else {
        console.log('No se encontró el negocio.');
    }
}

inspectRecord();
