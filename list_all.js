import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hybridnzbupmhqrtkkvd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnJpZG56YnVwbWhxcnRra3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NjAxMDgsImV4cCI6MjA4NjMzNjEwOH0.3ftLMQEvI2c8acUnX2pdEsmHe-yrpwoCERAl9oQZr04';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listAllBusinesses() {
    console.log('Listando TODOS los negocios disponibles:\n');

    const { data, error } = await supabase
        .from('businesses')
        .select('id, name, owner_id')
        .limit(10);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('⚠️  No hay negocios en la base de datos');
        return;
    }

    console.log(`Encontrados ${data.length} negocios:\n`);
    data.forEach((b, i) => {
        console.log(`${i + 1}. ID: ${b.id}`);
        console.log(`   Nombre: ${b.name}`);
        console.log(`   Owner: ${b.owner_id}\n`);
    });
}

listAllBusinesses();
