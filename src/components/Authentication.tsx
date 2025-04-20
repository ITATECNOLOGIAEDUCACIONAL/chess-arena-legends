
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { User } from '@supabase/supabase-js';
import { Eye, EyeOff, User as UserIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthProps {
  onAuthChange: (user: User | null) => void;
}

const Authentication: React.FC<AuthProps> = ({ onAuthChange }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Cria um email temporário baseado no nome do usuário se não fornecido
    const userEmail = email || `${username.replace(/\s+/g, '').toLowerCase()}@xadrezarena.temp`;

    try {
      const { data, error } = await supabase.auth.signUp({
        email: userEmail,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        toast.error(`Erro no registro: ${error.message}`);
      } else {
        toast.success('Registro realizado com sucesso! Você já pode jogar.');
        onAuthChange(data.user);
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('Erro ao tentar registrar. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verifica se o usuário forneceu um email completo ou apenas um nome de usuário
      const loginIdentifier = email.includes('@') ? email : `${email.replace(/\s+/g, '').toLowerCase()}@xadrezarena.temp`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginIdentifier,
        password,
      });

      if (error) {
        toast.error(`Erro no login: ${error.message}`);
      } else {
        toast.success('Login realizado com sucesso!');
        onAuthChange(data.user);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Erro ao tentar fazer login. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">XadrezArena</CardTitle>
        <CardDescription className="text-center">
          Entre ou registre-se para jogar e acompanhar suas estatísticas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Registrar</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={handleSignIn} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Nome de Usuário ou Email</Label>
                <Input
                  id="login-email"
                  placeholder="seu_nome ou email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Senha</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={handleSignUp} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="register-username">Nome de Usuário <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="register-username"
                    type="text"
                    placeholder="Seu nome de jogador"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="pl-10"
                  />
                  <UserIcon className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email <span className="text-gray-400">(opcional)</span></Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Senha <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading || !username || !password}>
                {loading ? 'Registrando...' : 'Registrar'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Authentication;
