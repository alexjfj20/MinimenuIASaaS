
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hybridnzbupmhqrtkkvd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5YnJpZG56YnVwbWhxcnRra3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NjAxMDgsImV4cCI6MjA4NjMzNjEwOH0.3ftLMQEvI2c8acUnX2pdEsmHe-yrpwoCERAl9oQZr04';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debug() {
    console.log('--- DEBUG START ---');

    // Test 1: Select count
    console.log('Testing SELECT count...');
    const res1 = await supabase.from('planes').select('*', { count: 'exact', head: true });
    console.log('Res1:', JSON.stringify(res1, null, 2));

    // Test 2: Select simple
    console.log('Testing SELECT simple...');
    const res2 = await supabase.from('planes').select('*').limit(1);
    console.log('Res2:', JSON.stringify(res2, null, 2));

    console.log('--- DEBUG END ---');
}

debug();
