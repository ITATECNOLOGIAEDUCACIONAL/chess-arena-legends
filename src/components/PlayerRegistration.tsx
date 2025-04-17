
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Player, PieceColor, GameMode } from '@/types/chess';
import { createClient } from '@supabase/supabase-js';
import { toast } from "@/components/ui/sonner";
import { PlayerCompetition } from '@/types/supabase';

// Initialize Supabase client (ensure these are your actual Supabase project URL and anon key)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface PlayerRegistrationProps {
  onPlayersSubmit: (players: [Player, Player]) => void;
  gameMode: GameMode;
}

const PlayerRegistration: React.FC<PlayerRegistrationProps> = ({ 
  onPlayersSubmit,
  gameMode
}) => {
  const [whitePlayer, setWhitePlayer] = useState('Jogador 1');
  const [blackPlayer, setBlackPlayer] = useState(gameMode === 'computer' ? 'Computador' : 'Jogador 2');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare players data
      const players: [Player, Player] = [
        {
          name: whitePlayer || 'Jogador 1',
          color: 'white',
          isComputer: false
        },
        {
          name: gameMode === 'computer' ? 'Computador' : (blackPlayer || 'Jogador 2'),
          color: 'black',
          isComputer: gameMode === 'computer'
        }
      ];

      // Save or update player competition data
      const playerCompetitions: PlayerCompetition[] = await Promise.all(
        players.map(async (player) => {
          if (player.isComputer) return null;

          // Check if player already exists
          const { data: existingPlayer, error: fetchError } = await supabase
            .from('player_competitions')
            .select('*')
            .eq('player_name', player.name)
            .single();

          if (fetchError && fetchError.code !== 'PGRST116') {
            toast.error(`Erro ao buscar jogador: ${fetchError.message}`);
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
              last_played: new Date()
            })
            .select()
            .single();

          if (insertError) {
            toast.error(`Erro ao criar jogador: ${insertError.message}`);
            return null;
          }

          return newPlayer;
        })
      );

      // Proceed with game start
      onPlayersSubmit(players);
      toast.success('Jogadores registrados com sucesso!');
    } catch (error) {
      toast.error('Erro ao registrar jogadores');
      console.error(error);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl">Registro de Jogadores</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
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
