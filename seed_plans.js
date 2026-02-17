
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hybridnzbupmhqrtkkvd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnJpZG56YnVwbWhxcnRra3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NjAxMDgsImV4cCI6MjA4NjMzNjEwOH0.3ftLMQEvI2c8acUnX2pdEsmHe-yrpwoCERAl9oQZr04';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEFAULT_PLANS = [
    {
        nombre: 'Plan Básico',
        descripcion: 'Ideal para pequeños negocios que están empezando.',
        precio: 19.99,
        tipo: 'mensual',
        estado: 'activo'
    },
    {
        nombre: 'Plan Pro',
        descripcion: 'Funcionalidades avanzadas para negocios en crecimiento.',
        precio: 49.99,
        tipo: 'mensual',
        estado: 'activo'
    },
    {
        nombre: 'Plan Enterprise',
        descripcion: 'Solución completa para grandes volúmenes.',
        precio: 499.00,
        tipo: 'anual',
        estado: 'activo'
    }
];

async function seedPlans() {
    console.log('Iniciando carga de planes por defecto...');

    for (const plan of DEFAULT_PLANS) {
        // Verificar si ya existe para no duplicar
        const { data: existing } = await supabase
            .from('planes')
            .select('id')
            .eq('nombre', plan.nombre)
            .maybeSingle();

        if (existing) {
            console.log(`ℹ️ El plan "${plan.nombre}" ya existe. Saltando.`);
            continue;
        }

        const { data, error } = await supabase
            .from('planes')
            .insert([plan])
            .select()
            .single();

        if (error) {
            console.error(`❌ Error al crear "${plan.nombre}":`, error.message);
        } else {
            console.log(`✅ Plan creado: "${plan.nombre}" (ID: ${data.id})`);
        }
    }

    console.log('Proceso finalizado.');
}

seedPlans();
