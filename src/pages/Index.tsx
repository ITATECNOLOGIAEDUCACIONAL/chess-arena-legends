
import React, { useState, useEffect } from 'react';
import GameBoard from '@/components/GameBoard';
import GameControls from '@/components/GameControls';
import MoveHistory from '@/components/MoveHistory';
import ChessRules from '@/components/ChessRules';
import HeaderBar from '@/components/HeaderBar';
import GameSetup from '@/components/GameSetup';
import GameInfo from '@/components/GameInfo';
import { useChessGame } from '@/hooks/useChessGame';
import { toast } from "@/components/ui/sonner";
import { GameMode, Player } from '@/types/chess';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  // Auth state
  const { user } = useAuth();
  
  // App state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('players');
  const [showRules, setShowRules] = useState(false);
  const [players, setPlayers] = useState<[Player, Player] | null>(null);
  
  // Game logic from custom hook
  const { 
    gameState, 
    handleMove, 
    handleRestart, 
    handleUndo, 
    handleNewGame 
  } = useChessGame(gameMode, players);
  
  // Change game mode
  const handleChangeGameMode = (mode: GameMode) => {
    if (gameStarted && gameState.moveHistory.length > 0) {
      toast.info("Por favor, reinicie o jogo para mudar o modo de jogo");
      return;
    }
    
    setGameMode(mode);
    
    if (gameStarted) {
      handleRestart();
      setGameStarted(false);
      setPlayers(null);
    }
  };
  
  // Register players
  const handlePlayersSubmit = (newPlayers: [Player, Player]) => {
    setPlayers(newPlayers);
    setGameStarted(true);
  };
  
  // Handle post-game actions
  const onNewGame = () => {
    handleNewGame();
    if (gameMode === 'players') {
      setGameStarted(false);
      setPlayers(null);
    }
  };

  // Handle authentication change
  const handleAuthChange = (authUser: any) => {
    if (authUser) {
      toast.success(`Bem-vindo, ${authUser.email?.split('@')[0]}!`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 py-8 px-4">
      <div className="container max-w-5xl mx-auto">
        <HeaderBar />
        
        <div className="grid gap-8 md:grid-cols-[1fr_300px]">
          <div className="space-y-8">
            {!gameStarted ? (
              <GameSetup 
                user={user}
                gameMode={gameMode}
                onPlayersSubmit={handlePlayersSubmit}
                onAuthChange={handleAuthChange}
              />
            ) : (
              <>
                <GameBoard 
                  gameState={gameState}
                  players={players!}
                  gameMode={gameMode}
                  onMove={handleMove}
                  onNewGame={onNewGame}
                />
                
                <GameInfo
                  currentPlayer={gameState.currentPlayer}
                  players={players}
                  isGameOver={gameState.isGameOver}
                />
              </>
            )}
          </div>
          
          <div className="space-y-6">
            {user && (
              <GameControls 
                currentPlayer={gameState.currentPlayer}
                onRestart={handleRestart}
                onUndo={handleUndo}
                gameMode={gameMode}
                setGameMode={handleChangeGameMode}
                onShowRules={() => setShowRules(true)}
              />
            )}
            
            {gameStarted && (
              <MoveHistory moves={gameState.moveHistory} />
            )}
          </div>
        </div>
      </div>
      
      <ChessRules isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
};

export default Index;
