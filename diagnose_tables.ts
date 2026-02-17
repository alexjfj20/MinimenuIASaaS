
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hybridnzbupmhqrtkkvd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnJpZG56YnVwbWhxcnRra3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NjAxMDgsImV4cCI6MjA4NjMzNjEwOH0.3ftLMQEvI2c8acUnX2pdEsmHe-yrpwoCERAl9oQZr04';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
    console.log("Verificando existencia y acceso a la tabla 'tables'...");
    try {
        const { data, error } = await supabase
            .from('tables')
            .select('*')
            .limit(1);

        if (error) {
            if (error.code === 'P0001' || error.message.includes('not found') || error.message.includes('does not exist')) {
                console.error("ERROR: La tabla 'tables' NO parece existir en la base de datos.");
            }
            console.error("Detalle del error:", error);
        } else {
            console.log("ÉXITO: La tabla 'tables' existe y es accesible.");
            console.log("Data encontrada:", data);
        }
    } catch (err) {
        console.error("Error inesperado:", err);
    }
}

checkTables();
