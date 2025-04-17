
import React from 'react';
import { Button } from "@/components/ui/button";
import { Rotate, RotateCcw, BookOpen, User, Bot } from 'lucide-react';
import { GameMode, PieceColor } from '@/types/chess';

interface GameControlsProps {
  currentPlayer: PieceColor;
  onRestart: () => void;
  onUndo: () => void;
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  onShowRules: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  currentPlayer, 
  onRestart, 
  onUndo, 
  gameMode,
  setGameMode,
  onShowRules
}) => {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <div
          className={`px-4 py-3 text-center rounded-md transition-all ${
            gameMode === 'players'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
          onClick={() => setGameMode('players')}
        >
          <div className="flex items-center justify-center gap-2">
            <User size={18} />
            <span>Jogador vs Jogador</span>
          </div>
        </div>
        
        <div
          className={`px-4 py-3 text-center rounded-md transition-all ${
            gameMode === 'computer'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
          onClick={() => setGameMode('computer')}
        >
          <div className="flex items-center justify-center gap-2">
            <Bot size={18} />
            <span>Contra Computador</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between gap-2">
        <Button 
          variant="secondary" 
          className="flex-1 flex items-center justify-center gap-1" 
          onClick={onUndo}
        >
          <RotateCcw size={18} />
          <span>Voltar</span>
        </Button>
        
        <Button 
          variant="secondary" 
          className="flex-1 flex items-center justify-center gap-1" 
          onClick={onRestart}
        >
          <Rotate size={18} />
          <span>Reiniciar</span>
        </Button>
      </div>
      
      <Button 
        variant="outline" 
        className="flex items-center justify-center gap-1" 
        onClick={onShowRules}
      >
        <BookOpen size={18} />
        <span>Regras do Xadrez</span>
      </Button>
      
      <div className={`p-3 rounded-md text-center font-semibold
                     ${currentPlayer === 'white' 
                       ? 'bg-white text-black border border-gray-300' 
                       : 'bg-gray-900 text-white'}`}>
        Vez do jogador: {currentPlayer === 'white' ? 'Brancas' : 'Pretas'}
      </div>
    </div>
  );
};

export default GameControls;
