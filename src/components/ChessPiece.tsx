
import React from 'react';
import { ChessPiece as ChessPieceType } from '@/types/chess';

interface ChessPieceProps {
  piece: ChessPieceType;
  isDragging?: boolean;
}

const ChessPiece: React.FC<ChessPieceProps> = ({ piece, isDragging }) => {
  // Mapeia o tipo e cor da peça para o emoji Unicode correspondente
  const getPieceSymbol = () => {
    switch (piece.type) {
      case 'pawn':
        return piece.color === 'white' ? '♙' : '♟';
      case 'rook':
        return piece.color === 'white' ? '♖' : '♜';
      case 'knight':
        return piece.color === 'white' ? '♘' : '♞';
      case 'bishop':
        return piece.color === 'white' ? '♗' : '♝';
      case 'queen':
        return piece.color === 'white' ? '♕' : '♛';
      case 'king':
        return piece.color === 'white' ? '♔' : '♚';
      default:
        return '';
    }
  };

  return (
    <div 
      className={`absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl md:text-5xl transition-transform
                 ${isDragging ? 'z-50 scale-110' : 'z-10'}
                 ${piece.color === 'white' ? 'text-white' : 'text-black'}`}
    >
      {getPieceSymbol()}
    </div>
  );
};

export default ChessPiece;
