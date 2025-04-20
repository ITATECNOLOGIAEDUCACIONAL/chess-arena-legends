
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
      setWhitePlayer(user.email?.split('@')[0] || 'Jogador 1');
    } else {
      setWhitePlayer('Jogador 1');
    }
    
    setBlackPlayer(gameMode === 'computer' ? 'Computador' : 'Jogador 2');
  }, [user, gameMode]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare players data
      const players: [Player, Player] = [
        {
          name: whitePlayer || 'Jogador 1',
          color: 'white',
          isComputer: false,
          userId: user?.id
        },
        {
          name: gameMode === 'computer' ? 'Computador' : (blackPlayer || 'Jogador 2'),
          color: 'black',
          isComputer: gameMode === 'computer',
          userId: gameMode === 'computer' ? null : user?.id
        }
      ];

      // If we have connection issues, skip database operations
      if (connectionError) {
        toast.warning('Jogando sem salvar estatísticas devido a problemas de conexão');
        onPlayersSubmit(players);
        return;
      }

      // Save or update player competition data
      const playerCompetitions: PlayerCompetition[] = await Promise.all(
        players.map(async (player) => {
          if (player.isComputer) return null;

          try {
            // Check if player already exists
            const { data: existingPlayer, error: fetchError } = await supabase
              .from('player_competitions')
              .select('*')
              .eq('player_name', player.name)
              .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
              console.error('Erro ao buscar jogador:', fetchError);
              return null;
            }

            if (existingPlayer) {
              return existingPlayer;
            }

            // Create new player record if not exists
            const { data: newPlayer, error: insertError } = await supabase
              .from('player_competitions')
              .insert({
                player_name: player.name,
                game_mode: gameMode,
                wins: 0,
                losses: 0,
                draws: 0,
                total_games: 0,
                last_played: new Date(),
                user_id: player.userId
              })
              .select()
              .single();

            if (insertError) {
              throw insertError;
            }

            return newPlayer;
          } catch (error) {
            console.error('Erro ao processar jogador:', error);
            setRegistrationFailed(true);
            return null;
          }
        })
      );

      // Filter out null values (failed registrations)
      const validRegistrations = playerCompetitions.filter(Boolean);
      
      if (validRegistrations.length > 0) {
        // Proceed with game start
        onPlayersSubmit(players);
        toast.success('Jogadores registrados com sucesso!');
      } else {
        setRegistrationFailed(true);
        toast.error('Falha ao registrar jogadores no banco de dados, mas o jogo continuará.');
        onPlayersSubmit(players);
      }
    } catch (error) {
      console.error('Erro ao registrar jogadores:', error);
      setRegistrationFailed(true);
      toast.error('Erro ao conectar com o banco de dados. O jogo continuará sem salvar estatísticas.');
      
      // Allow the game to continue anyway
      const players: [Player, Player] = [
        {
          name: whitePlayer || 'Jogador 1',
          color: 'white',
          isComputer: false,
          userId: user?.id
        },
        {
          name: gameMode === 'computer' ? 'Computador' : (blackPlayer || 'Jogador 2'),
          color: 'black',
          isComputer: gameMode === 'computer',
          userId: gameMode === 'computer' ? null : user?.id
        }
      ];
      
      onPlayersSubmit(players);
    }
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
