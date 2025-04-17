
import React from 'react';
import ChessBoard from './ChessBoard';
import GameResult from './GameResult';
import { ChessGameState, Player } from '@/types/chess';

interface GameBoardProps {
  gameState: ChessGameState;
  players: [Player, Player];
  gameMode: 'players' | 'computer';
  onMove: (from: string, to: string) => void;
  onNewGame: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  players,
  gameMode,
  onMove,
  onNewGame
}) => {
  if (gameState.isGameOver) {
    return (
      <GameResult 
        winner={gameState.winner} 
        isDraw={gameState.stalemate} 
        players={players}
        onNewGame={onNewGame}
      />
    );
  }
  
  return (
    <ChessBoard 
      gameState={gameState} 
      onMove={onMove}
      isComputerTurn={gameMode === 'computer'}
      computerColor="black"
    />
  );
};

export default GameBoard;
