
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hybridnzbupmhqrtkkvd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnJpZG56YnVwbWhxcnRra3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NjAxMDgsImV4cCI6MjA4NjMzNjEwOH0.3ftLMQEvI2c8acUnX2pdEsmHe-yrpwoCERAl9oQZr04';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("1. Buscando un negocio válido...");
    const { data: businesses, error: busError } = await supabase.from('businesses').select('id, name').limit(1);

    if (busError) {
        console.error("ERROR al buscar negocio:", busError);
        return;
    }

    if (!businesses || businesses.length === 0) {
        console.error("No se encontraron negocios.");
        return;
    }

    const business = businesses[0];
    console.log(`Negocio encontrado: ${business.name} (${business.id})`);

    console.log("2. Intentando insertar un Pedido (Simulation)...");

    const testOrder = {
        business_id: business.id,
        customer_name: 'Debug Script User MJS',
        customer_phone: '3001234567',
        items: [],
        total: 1000,
        payment_method: 'Efectivo',
        order_type: 'domicilio',
        status: 'pending',
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('orders')
        .insert([testOrder])
        .select()
        .single();

    if (error) {
        console.error("FALLÓ LA INSERCIÓN DEL PEDIDO:", error);
        if (error.code === '42501') {
            console.log("\n>>> DIAGNÓSTICO: La política RLS está bloqueando la creación de pedidos (Error 42501).");
            console.log(">>> SOLUCIÓN: Ejecutar script SQL para permitir INSERT público en tabla orders.");
        }
    } else {
        console.log("INSERCIÓN EXITOSA. ID del Pedido:", data.id);
    }
}

main().catch(err => console.error("Error fatal:", err));
