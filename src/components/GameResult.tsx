
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieceColor, Player } from '@/types/chess';
import { Trophy } from 'lucide-react';

interface GameResultProps {
  winner: PieceColor | null;
  isDraw: boolean;
  players: [Player, Player];
  onNewGame: () => void;
}

const GameResult: React.FC<GameResultProps> = ({ winner, isDraw, players, onNewGame }) => {
  // Encontra o jogador vencedor
  const winningPlayer = winner ? players.find(p => p.color === winner) : null;
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
          <Trophy className="text-chess-gold" />
          {isDraw ? 'Empate!' : 'Fim de Jogo!'}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        {isDraw ? (
          <p className="text-lg">O jogo terminou em empate por afogamento!</p>
        ) : (
          <div>
            <p className="text-lg mb-2">
              <span className="font-bold">{winningPlayer?.name}</span> venceu o jogo!
            </p>
            <p className="text-sm text-muted-foreground">
              Vitória por xeque-mate com as peças {winner === 'white' ? 'brancas' : 'pretas'}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={onNewGame}>Jogar Novamente</Button>
      </CardFooter>
    </Card>
  );
};

export default GameResult;
