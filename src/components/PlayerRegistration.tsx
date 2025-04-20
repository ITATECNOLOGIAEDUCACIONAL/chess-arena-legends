
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Player, PieceColor, GameMode } from '@/types/chess';
import { toast } from "@/components/ui/sonner";
import { PlayerCompetition } from '@/types/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface PlayerRegistrationProps {
  onPlayersSubmit: (players: [Player, Player]) => void;
  gameMode: GameMode;
}

const PlayerRegistration: React.FC<PlayerRegistrationProps> = ({ 
  onPlayersSubmit,
  gameMode
}) => {
  const { user, connectionError } = useAuth();
  const [whitePlayer, setWhitePlayer] = useState('');
  const [blackPlayer, setBlackPlayer] = useState('');
  const [registrationFailed, setRegistrationFailed] = useState(false);
  
  // Set defaults when user changes
  useEffect(() => {
    if (user) {
      // Use username from metadata if available, otherwise use email or default
      const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Jogador 1';
      setWhitePlayer(username);
    } else {
      setWhitePlayer('Jogador 1');
    }
    
    setBlackPlayer(gameMode === 'computer' ? 'Computador' : 'Jogador 2');
  }, [user, gameMode]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!whitePlayer.trim()) {
      toast.error('Por favor, informe o nome do jogador das peças brancas');
      return;
    }
    
    if (gameMode === 'players' && !blackPlayer.trim()) {
      toast.error('Por favor, informe o nome do jogador das peças pretas');
      return;
    }
    
    // Prepare players data
    const players: [Player, Player] = [
      {
        name: whitePlayer.trim(),
        color: 'white',
        isComputer: false,
        userId: user?.id
      },
      {
        name: gameMode === 'computer' ? 'Computador' : blackPlayer.trim(),
        color: 'black',
        isComputer: gameMode === 'computer',
        userId: gameMode === 'computer' ? null : user?.id
      }
    ];
    
    // Start the game without waiting for database operations
    onPlayersSubmit(players);
    toast.success('Jogo iniciado!');
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Registro de Jogadores</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {(connectionError || registrationFailed) && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Problema de conexão</AlertTitle>
              <AlertDescription>
                Não foi possível conectar ao servidor. O jogo continuará funcionando, mas suas estatísticas não serão salvas.
              </AlertDescription>
            </Alert>
          )}
        
          <div className="space-y-2">
            <Label htmlFor="whitePlayer">Jogador das Peças Brancas</Label>
            <Input
              id="whitePlayer"
              value={whitePlayer}
              onChange={(e) => setWhitePlayer(e.target.value)}
              placeholder="Nome do jogador 1"
              required
            />
          </div>
          
          {gameMode === 'players' && (
            <div className="space-y-2">
              <Label htmlFor="blackPlayer">Jogador das Peças Pretas</Label>
              <Input
                id="blackPlayer"
                value={blackPlayer}
                onChange={(e) => setBlackPlayer(e.target.value)}
                placeholder="Nome do jogador 2"
                required
              />
            </div>
          )}
          
          {gameMode === 'computer' && (
            <div className="p-3 bg-muted rounded-md text-center">
              Você jogará contra o computador como peças brancas
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Começar Jogo</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PlayerRegistration;
