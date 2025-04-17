
import React from 'react';
import { Cell } from '@/types/chess';
import ChessPiece from './ChessPiece';

interface ChessSquareProps {
  cell: Cell;
  isLightSquare: boolean;
  onClick: () => void;
}

const ChessSquare: React.FC<ChessSquareProps> = ({ cell, isLightSquare, onClick }) => {
  return (
    <div 
      className={`relative w-full pb-[100%] cursor-pointer border border-transparent
                ${isLightSquare ? 'bg-chess-light-square' : 'bg-chess-dark-square'}
                ${cell.highlighted ? 'border-2 border-chess-highlight !bg-opacity-80' : ''}
                ${cell.lastMove ? 'ring-2 ring-chess-move ring-opacity-50' : ''}
                ${cell.check ? 'ring-4 ring-red-500 ring-opacity-70' : ''}
                hover:opacity-90 transition-all duration-150`}
      onClick={onClick}
      data-position={cell.position}
    >
      {/* Coordenadas */}
      {(cell.position[0] === 'a' || cell.position[0] === 'h') && (
        <div 
          className={`absolute bottom-0 left-0 text-xs p-0.5 
                    ${isLightSquare ? 'text-chess-dark-square' : 'text-chess-light-square'}`}
        >
          {cell.position[1]}
        </div>
      )}
      {(cell.position[1] === '1' || cell.position[1] === '8') && (
        <div 
          className={`absolute top-0 right-0 text-xs p-0.5
                    ${isLightSquare ? 'text-chess-dark-square' : 'text-chess-light-square'}`}
        >
          {cell.position[0]}
        </div>
      )}
      
      {/* Marcador de movimento possível */}
      {cell.highlighted && !cell.piece && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-chess-highlight rounded-full opacity-70"></div>
        </div>
      )}
      
      {/* Peça de xadrez */}
      {cell.piece && <ChessPiece piece={cell.piece} />}
    </div>
  );
};

export default ChessSquare;
