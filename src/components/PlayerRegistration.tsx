
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Player, PieceColor, GameMode } from '@/types/chess';

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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    onPlayersSubmit(players);
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
