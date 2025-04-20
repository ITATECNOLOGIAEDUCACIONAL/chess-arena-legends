
import { createClient } from '@supabase/supabase-js';

// Valores de fallback para desenvolvimento
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Checar se o ambiente tem as variáveis necessárias
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Variáveis de ambiente do Supabase não encontradas. Usando valores padrão para desenvolvimento.');
}

// Initialize Supabase client com valores seguros
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
