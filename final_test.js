import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hybridnzbupmhqrtkkvd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnJpZG56YnVwbWhxcnRra3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NjAxMDgsImV4cCI6MjA4NjMzNjEwOH0.3ftLMQEvI2c8acUnX2pdEsmHe-yrpwoCERAl9oQZr04';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function finalTest() {
    const targetId = 'e7415a19-ba68-4b96-8c11-d6fc4da45fb4';

    console.log('🎯 PRUEBA FINAL - Simulando actualización de perfil como lo haría el frontend...\n');

    // Simular exactamente lo que haría el updateBusiness sin description
    const payload = {
        name: 'Tia toña',
        email: 'nona@gmail.com',
        phone: '322883163',
        location: '',
        // description: NO SE ENVÍA - este era el problema
        iva: 0,
        delivery_value: 3000,
        menu_slug: null,
        avatar: null,
        socials: { whatsapp: '', instagram: '', facebook: '', twitter: '', tiktok: '', youtube: '', website: '' },
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

    const { data, error } = await supabase
        .from('businesses')
        .update(payload)
        .eq('id', targetId)
        .select()
        .single();

    if (error) {
        console.error('❌ ERROR:', error.message);
        console.error('Código:', error.code);
    } else {
        console.log('✅ ¡ÉXITO! El perfil se actualizó correctamente');
        console.log('Nombre:', data.name);
        console.log('Email:', data.email);
        console.log('IVA:', data.iva);
        console.log('Delivery Value:', data.delivery_value);
    }
}

finalTest();
