
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hybridnzbupmhqrtkkvd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnJpZG56YnVwbWhxcnRra3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NjAxMDgsImV4cCI6MjA4NjMzNjEwOH0.3ftLMQEvI2c8acUnX2pdEsmHe-yrpwoCERAl9oQZr04';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMigration() {
    console.log('Verificando existencia de tabla "planes"...');
    const { data, error } = await supabase.from('planes').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('❌ Error al acceder a la tabla "planes":');
        console.error(error.message);
        if (error.code === '42P01') {
            console.log('⚠️ CONFIRMADO: La tabla "planes" NO existe. Se requiere migración manual.');
        }
    } else {
        console.log('✅ La tabla "planes" existe y es accesible.');
    }
}

checkMigration();
