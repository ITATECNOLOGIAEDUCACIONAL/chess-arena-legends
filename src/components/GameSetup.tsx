
import React from 'react';
import PlayerRegistration from './PlayerRegistration';
import Authentication from './Authentication';
import { GameMode, Player } from '@/types/chess';

interface GameSetupProps {
  user: any;
  gameMode: GameMode;
  onPlayersSubmit: (players: [Player, Player]) => void;
  onAuthChange: (user: any) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ 
  user, 
  gameMode, 
  onPlayersSubmit, 
  onAuthChange 
}) => {
  return (
    <div>
      {!user ? (
        <Authentication onAuthChange={onAuthChange} />
      ) : (
        <PlayerRegistration 
          onPlayersSubmit={onPlayersSubmit} 
          gameMode={gameMode} 
        />
      )}
    </div>
  );
};

export default GameSetup;
