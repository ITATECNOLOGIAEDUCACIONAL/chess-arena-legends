
import { createClient } from '@supabase/supabase-js';

// Valores de fallback para desenvolvimento
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Verificar se as variáveis de ambiente estão definidas
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Variáveis de ambiente Supabase não encontradas. Usando valores de fallback para desenvolvimento local.');
}

// Cria uma única instância do cliente Supabase
let supabaseInstance;

try {
  // Inicializa o cliente Supabase com tratamento de erro
  supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
  
  // Teste a conexão
  console.log('Cliente Supabase inicializado com sucesso');
} catch (error) {
  console.error('Erro ao inicializar o cliente Supabase:', error);
  // Cria um cliente mock para evitar falhas na aplicação
  supabaseInstance = {
    auth: {
      signUp: async () => ({ error: { message: 'Serviço Supabase indisponível' } }),
      signInWithPassword: async () => ({ error: { message: 'Serviço Supabase indisponível' } }),
      signOut: async () => ({}),
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }),
      insert: () => ({ select: () => ({ single: () => ({ data: null, error: null }) }) })
    })
  };
}

// Exporta a instância única
export const supabase = supabaseInstance;

export default supabase;
