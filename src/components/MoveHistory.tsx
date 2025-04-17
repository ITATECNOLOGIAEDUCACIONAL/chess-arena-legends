
import React from 'react';
import { ChessMove } from '@/types/chess';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MoveHistoryProps {
  moves: ChessMove[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves }) => {
  // Formatar a notação do movimento
  const formatMove = (move: ChessMove): string => {
    const getPieceNotation = () => {
      switch (move.piece.type) {
        case 'pawn': return '';
        case 'knight': return 'C';
        case 'bishop': return 'B';
        case 'rook': return 'T';
        case 'queen': return 'D';
        case 'king': return 'R';
      }
    };
    
    let notation = getPieceNotation();
    
    // Adicionar x para capturas
    if (move.captured) {
      if (move.piece.type === 'pawn') {
        notation += move.from[0];
      }
      notation += 'x';
    }
    
    notation += move.to;
    
    // Adicionar promoção
    if (move.promotion) {
      notation += '=';
      switch (move.promotion) {
        case 'queen': notation += 'D'; break;
        case 'rook': notation += 'T'; break;
        case 'bishop': notation += 'B'; break;
        case 'knight': notation += 'C'; break;
      }
    }
    
    // Adicionar notação para roque
    if (move.castling) {
      if (move.castling === 'kingside') {
        return 'O-O';
      } else {
        return 'O-O-O';
      }
    }
    
    return notation;
  };

  // Agrupar movimentos em pares (branco/preto)
  const moveGroups: { white: string; black?: string }[] = [];
  
  for (let i = 0; i < moves.length; i += 2) {
    const whiteMove = moves[i];
    const blackMove = moves[i + 1];
    
    moveGroups.push({
      white: formatMove(whiteMove),
      black: blackMove ? formatMove(blackMove) : undefined
    });
  }

  return (
    <div className="border rounded-md w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold p-2 border-b bg-muted">Histórico de Jogadas</h3>
      <ScrollArea className="h-48">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="px-3 py-2 text-left">N°</th>
              <th className="px-3 py-2 text-left">Brancas</th>
              <th className="px-3 py-2 text-left">Pretas</th>
            </tr>
          </thead>
          <tbody>
            {moveGroups.map((group, index) => (
              <tr key={index} className="border-b hover:bg-muted/30">
                <td className="px-3 py-2">{index + 1}</td>
                <td className="px-3 py-2 font-mono">{group.white}</td>
                <td className="px-3 py-2 font-mono">{group.black || ''}</td>
              </tr>
            ))}
            {moveGroups.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-center text-muted-foreground">
                  Nenhum movimento ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
};

export default MoveHistory;
