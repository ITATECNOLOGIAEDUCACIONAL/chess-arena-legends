
import React from 'react';
import { Player } from '@/types/chess';

interface GameInfoProps {
  currentPlayer: 'white' | 'black';
  players: [Player, Player] | null;
  isGameOver: boolean;
}

const GameInfo: React.FC<GameInfoProps> = ({ currentPlayer, players, isGameOver }) => {
  if (!players || isGameOver) return null;
  
  return (
    <div className="text-center font-semibold">
      <p className="mb-2">
        {currentPlayer === 'white' ? (
          <>Vez de <span className="text-blue-600">{players[0].name}</span> (brancas)</>
        ) : (
          <>Vez de <span className="text-blue-600">{players[1].name}</span> (pretas)</>
        )}
      </p>
    </div>
  );
};

export default GameInfo;
