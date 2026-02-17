
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hybridnzbupmhqrtkkvd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnJpZG56YnVwbWhxcnRra3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NjAxMDgsImV4cCI6MjA4NjMzNjEwOH0.3ftLMQEvI2c8acUnX2pdEsmHe-yrpwoCERAl9oQZr04';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("1. Buscando negocio...");
    const { data: businesses, error: busError } = await supabase.from('businesses').select('*').limit(1);

    if (busError) {
        console.error("ERROR al buscar negocio:", busError);
        return;
    }

    const business = businesses[0];
    console.log(`Negocio: ${business.name} (${business.id})`);
    console.log("Campos actuales:", Object.keys(business));

    console.log("\n2. Intentando UPDATE simple (nombre)...");
    const { error: updateError1 } = await supabase
        .from('businesses')
        .update({ name: business.name + ' (Updated)' })
        .eq('id', business.id);

    if (updateError1) {
        console.error("FALLÓ UPDATE simple:", updateError1);
    } else {
        console.log("UPDATE simple exitoso.");
        // Revertir nombre
        await supabase.from('businesses').update({ name: business.name }).eq('id', business.id);
    }

    console.log("\n3. Intentando UPDATE con campo 'description'...");
    const { error: updateError2 } = await supabase
        .from('businesses')
        .update({ description: 'Test description from script' })
        .eq('id', business.id);

    if (updateError2) {
        console.error("FALLÓ UPDATE description:", updateError2);
        if (updateError2.code === '42703') { // Undefined column
            console.log(">>> CONFIRMADO: La columna 'description' NO existe en la base de datos.");
        }
    } else {
        console.log("UPDATE description exitoso. (La columna EXISTE)");
    }

    console.log("\n4. Intentando UPDATE completo simulando el Panel...");
    const payload = {
        name: business.name,
        phone: business.phone,
        email: business.email,
        iva: 19,
        delivery_value: 3000,
        updated_at: new Date().toISOString()
        // Note: description intentionally omitted as per service code
    };

    const { error: updateError3 } = await supabase
        .from('businesses')
        .update(payload)
        .eq('id', business.id);

    if (updateError3) {
        console.error("FALLÓ UPDATE completo simulación:", updateError3);
    } else {
        console.log("UPDATE completo simulación exitoso.");
    }

}

main().catch(console.error);
