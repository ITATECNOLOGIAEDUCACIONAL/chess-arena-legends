
import React, { useState, useEffect } from 'react';
import ChessSquare from './ChessSquare';
import { Cell, ChessPiece, ChessMove, ChessGameState, PieceColor } from '@/types/chess';
import { getValidMoves, isKingInCheck, isCheckmate, isStalemate, getComputerMove, simulateMove } from '@/utils/chessUtils';
import { toast } from "@/components/ui/sonner";

interface ChessBoardProps {
  gameState: ChessGameState;
  onMove: (from: string, to: string) => void;
  isComputerTurn: boolean;
  computerColor: PieceColor;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ 
  gameState, 
  onMove, 
  isComputerTurn,
  computerColor
}) => {
  const { board, currentPlayer, selectedCell, validMoves } = gameState;
  
  useEffect(() => {
    // Fazer o movimento do computador após um pequeno delay
    if (isComputerTurn && currentPlayer === computerColor) {
      const timer = setTimeout(() => {
        const computerMove = getComputerMove(board, currentPlayer, gameState.moveHistory);
        if (computerMove) {
          onMove(computerMove.from, computerMove.to);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isComputerTurn, currentPlayer, computerColor, board, gameState.moveHistory, onMove]);
  
  const handleSquareClick = (position: string) => {
    if (isComputerTurn && currentPlayer === computerColor) {
      toast.info("É a vez do computador");
      return;
    }
    
    const cell = board[position];
    
    // Se nenhuma célula estiver selecionada e a peça pertence ao jogador atual
    if (!selectedCell && cell.piece && cell.piece.color === currentPlayer) {
      onMove(position, ''); // Isto selecionará a célula e calculará movimentos válidos
      return;
    }
    
    // Se uma célula já estiver selecionada
    if (selectedCell) {
      // Clique na mesma célula = desselecionar
      if (selectedCell === position) {
        onMove('', ''); // Isto desseleciona a célula
        return;
      }
      
      // Clique em outra célula do mesmo jogador = trocar seleção
      if (cell.piece && cell.piece.color === currentPlayer) {
        onMove(position, ''); // Trocar seleção
        return;
      }
      
      // Clique em uma célula válida = fazer o movimento
      if (validMoves.includes(position)) {
        onMove(selectedCell, position);
        return;
      }
    }
    
    // Se nada acima for verdadeiro, apenas ignorar o clique
  };
  
  // Ordenar as posições para renderizar o tabuleiro na ordem correta
  const positions = Object.keys(board).sort((a, b) => {
    const rankDiff = b[1].localeCompare(a[1]); // Classificar por rank em ordem decrescente
    if (rankDiff !== 0) return rankDiff;
    return a[0].localeCompare(b[0]); // Classificar por file em ordem crescente
  });

  return (
    <div className="w-full max-w-md mx-auto aspect-square grid grid-cols-8 gap-0 border-4 border-chess-wood shadow-xl">
      {positions.map((position) => {
        const [file, rank] = position.split('');
        const fileIndex = 'abcdefgh'.indexOf(file);
        const rankIndex = '12345678'.indexOf(rank);
        const isLightSquare = (fileIndex + rankIndex) % 2 === 0;
        
        return (
          <ChessSquare
            key={position}
            cell={{
              ...board[position],
              highlighted: selectedCell === position || validMoves.includes(position)
            }}
            isLightSquare={isLightSquare}
            onClick={() => handleSquareClick(position)}
          />
        );
      })}
    </div>
  );
};

export default ChessBoard;
