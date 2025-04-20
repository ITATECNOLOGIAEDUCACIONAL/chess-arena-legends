
import React, { useEffect } from 'react';
import PlayerRegistration from './PlayerRegistration';
import Authentication from './Authentication';
import { GameMode, Player } from '@/types/chess';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import { toast } from "@/components/ui/sonner";

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
  
  // Show toast to inform users about offline mode
  useEffect(() => {
    if (connectionError) {
      toast.info('Jogando em modo offline. Suas estatísticas não serão salvas.', {
        duration: 5000,
        id: 'offline-mode' // prevent duplicates
      });
    }
  }, [connectionError]);
  
  return (
    <div className="space-y-4">
      {connectionError && (
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Modo Offline</AlertTitle>
          <AlertDescription>
            O aplicativo está funcionando em modo offline. Você pode jogar normalmente, mas suas estatísticas não serão salvas.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-w-md mx-auto mb-4 text-center">
        <p className="text-green-800 text-sm">
          👋 Bem-vindo ao XadrezArena! Para começar a jogar, faça login ou use a conta de teste automática.
        </p>
      </div>
      
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
