import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hybridnzbupmhqrtkkvd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnJpZG56YnVwbWhxcnRra3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NjAxMDgsImV4cCI6MjA4NjMzNjEwOH0.3ftLMQEvI2c8acUnX2pdEsmHe-yrpwoCERAl9oQZr04';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnose() {
    const targetId = 'e7415a19-ba68-4b96-8c11-d6fc4da45fb4';

    // 1. Verificar que el negocio existe
    console.log('1️⃣  Verificando que el negocio existe...');
    const { data: business, error: selectError } = await supabase
        .from('businesses')
        .select('id, name')
        .eq('id', targetId)
        .maybeSingle();

    if (selectError) {
        console.error('❌ Error al buscar:', selectError);
        return;
    }

    if (!business) {
        console.error('⚠️  EL NEGOCIO NO EXISTE EN LA BASE DE DATOS');
        console.log('Listando todos los negocios:');
        const { data: all } = await supabase.from('businesses').select('id, name').limit(5);
        console.log(all);
        return;
    }

    console.log('✅ Negocio encontrado:', business);

    // 2. Probar update mínimo
    console.log('\n2️⃣  Probando update mínimo (solo description)...');
    const { data: updateData, error: updateError } = await supabase
        .from('businesses')
        .update({ description: 'Test update ' + new Date().toISOString() })
        .eq('id', targetId)
        .select()
        .single();

    if (updateError) {
        console.error('❌ Error en update mínimo:', updateError);
    } else {
        console.log('✅ Update mínimo exitoso');
    }

    // 3. Probar con paymentConfigs
    console.log('\n3️⃣  Probando con payment_configs completo...');
    const { data: configData, error: configError } = await supabase
        .from('businesses')
        .update({
            payment_configs: {
                cash: { enabled: true },
                nequi: { enabled: false, accountHolder: '', accountNumber: '', qrImage: '' }
            }
        })
        .eq('id', targetId)
        .select()
        .single();

    if (configError) {
        console.error('❌ Error con payment_configs:', configError);
    } else {
        console.log('✅ Update con payment_configs exitoso');
    }
}

diagnose();
