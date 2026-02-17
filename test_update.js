import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hybridnzbupmhqrtkkvd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnJpZG56YnVwbWhxcnRra3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NjAxMDgsImV4cCI6MjA4NjMzNjEwOH0.3ftLMQEvI2c8acUnX2pdEsmHe-yrpwoCERAl9oQZr04';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProfileUpdate() {
    const targetId = 'e7415a19-ba68-4b96-8c11-d6fc4da45fb4';

    console.log('Testing profile update...');

    // Simular el payload exacto que enviaría el frontend
    const testPayload = {
        name: 'Tia toña',
        phone: '322883163',
        email: 'nona@gmail.com',
        iva: 0,
        delivery_value: 3000,
        menu_slug: null,
        payment_configs: {
            cash: { enabled: true },
            nequi: { enabled: false, accountHolder: '', accountNumber: '', qrImage: '' },
            daviplata: { enabled: false, accountHolder: '', accountNumber: '', qrImage: '' },
            bancolombia: { enabled: false, accountHolder: '', accountNumber: '', qrImage: '' },
            mercadoPago: { enabled: false, publicKey: '', accessToken: '', mode: 'sandbox' },
            stripe: { enabled: false, publicKey: '', secretKey: '', mode: 'sandbox' }
        },
        updated_at: new Date().toISOString()
    };

    console.log('Payload a enviar:', JSON.stringify(testPayload, null, 2));

    const { data, error } = await supabase
        .from('businesses')
        .update(testPayload)
        .eq('id', targetId)
        .select()
        .single();

    if (error) {
        console.error('❌ ERROR:', error);
        console.error('Código:', error.code);
        console.error('Mensaje:', error.message);
        console.error('Detalles:', error.details);
    } else {
        console.log('✅ Actualización exitosa:', data);
    }
}

testProfileUpdate();
