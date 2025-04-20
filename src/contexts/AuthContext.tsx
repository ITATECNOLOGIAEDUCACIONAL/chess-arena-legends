
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { toast } from "@/components/ui/sonner";
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  connectionError: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  connectionError: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    // Check for current session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao verificar sessão:', error);
          setConnectionError(true);
        } else {
          setUser(data.session?.user || null);
          setConnectionError(false);
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        setConnectionError(true);
        toast.error('Erro ao verificar sua sessão. O jogo continuará sem salvar estatísticas.');
      } finally {
        setLoading(false);
      }
    };

    // Call it once
    checkSession();

    try {
      // Subscribe to auth changes
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('Auth state changed:', event);
          setUser(session?.user || null);
          setLoading(false);
        }
      );

      return () => {
        if (authListener?.subscription?.unsubscribe) {
          authListener.subscription.unsubscribe();
        }
      };
    } catch (error) {
      console.error('Erro ao configurar listener de autenticação:', error);
      setConnectionError(true);
      setLoading(false);
    }
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.success('Sessão encerrada com sucesso');
    } catch (error) {
      console.error('Erro ao sair da conta:', error);
      toast.error('Erro ao tentar sair. Por favor, tente novamente.');
    }
  };

  const value = {
    user,
    loading,
    signOut,
    connectionError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
