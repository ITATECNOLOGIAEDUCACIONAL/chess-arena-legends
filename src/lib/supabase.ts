
import { createClient } from '@supabase/supabase-js';

// Valores de fallback para desenvolvimento
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Verificar se as variáveis de ambiente estão definidas
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('Variáveis de ambiente Supabase não encontradas. Usando valores de fallback para desenvolvimento local.');
}

// Cria uma única instância do cliente Supabase
const supabaseInstance = {
  auth: {
    signUp: async () => ({ data: { user: { id: 'test-user-id', email: 'test@xadrezarena.temp' } }, error: null }),
    signInWithPassword: async () => ({ 
      data: { 
        user: { 
          id: 'test-user-id', 
          email: 'test@xadrezarena.temp',
          user_metadata: { username: 'Jogador de Teste' } 
        },
        session: { access_token: 'fake-token' }
      }, 
      error: null 
    }),
    signOut: async () => ({}),
    getSession: async () => ({ 
      data: { 
        session: { 
          user: { 
            id: 'test-user-id', 
            email: 'test@xadrezarena.temp',
            user_metadata: { username: 'Jogador de Teste' }
          } 
        } 
      }, 
      error: null 
    }),
    onAuthStateChange: (callback) => {
      // Simula um login imediato
      setTimeout(() => {
        callback('SIGNED_IN', { 
          user: { 
            id: 'test-user-id', 
            email: 'test@xadrezarena.temp',
            user_metadata: { username: 'Jogador de Teste' }
          }
        });
      }, 500);
      
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        order: () => ({
          limit: () => ({ data: [], error: null }) 
        }),
        single: () => ({ data: null, error: null }) 
      })
    }),
    insert: () => ({ 
      select: () => ({ single: () => ({ data: { id: 'test-record', player_name: 'Jogador de Teste' }, error: null }) })
    }),
    update: () => ({
      eq: () => ({ data: { success: true }, error: null })
    })
  })
};

// Exporta a instância única
export const supabase = supabaseInstance;

export default supabase;
