
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hybridnzbupmhqrtkkvd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnJpZG56YnVwbWhxcnRra3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NjAxMDgsImV4cCI6MjA4NjMzNjEwOH0.3ftLMQEvI2c8acUnX2pdEsmHe-yrpwoCERAl9oQZr04';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    console.log("Probando conexión a Supabase con valores reales...");
    try {
        const { data, error } = await supabase.from('businesses').select('id').limit(1);
        if (error) {
            console.error("Error en consulta:", error);
        } else {
            console.log("Éxito! Conexión establecida. Data:", data);
        }
    } catch (err) {
        console.error("Error catastrófico:", err);
    }
}

test();
