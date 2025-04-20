
import React from 'react';
import PlayerRegistration from './PlayerRegistration';
import Authentication from './Authentication';
import { GameMode, Player } from '@/types/chess';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

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
  const { connectionError } = useAuth();
  
  return (
    <div className="space-y-4">
      {connectionError && (
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Problema de conexão</AlertTitle>
          <AlertDescription>
            Não foi possível conectar ao servidor. O jogo continuará funcionando, mas suas estatísticas não serão salvas.
          </AlertDescription>
        </Alert>
      )}
      
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
