import { Cell, ChessPiece, PieceColor, PieceType, ChessMove } from '@/types/chess';

// Função para criar o tabuleiro inicial
export const createInitialBoard = (): Record<string, Cell> => {
  const board: Record<string, Cell> = {};
  const files = 'abcdefgh';
  const ranks = '12345678';

  for (let fileIndex = 0; fileIndex < 8; fileIndex++) {
    const file = files[fileIndex];
    for (let rankIndex = 0; rankIndex < 8; rankIndex++) {
      const rank = ranks[rankIndex];
      const position = file + rank;
      
      let piece: ChessPiece | null = null;
      
      // Pawns
      if (rank === '2') {
        piece = { type: 'pawn', color: 'white' };
      } else if (rank === '7') {
        piece = { type: 'pawn', color: 'black' };
      }
      
      // Other pieces
      if (rank === '1') {
        if (file === 'a' || file === 'h') piece = { type: 'rook', color: 'white' };
        if (file === 'b' || file === 'g') piece = { type: 'knight', color: 'white' };
        if (file === 'c' || file === 'f') piece = { type: 'bishop', color: 'white' };
        if (file === 'd') piece = { type: 'queen', color: 'white' };
        if (file === 'e') piece = { type: 'king', color: 'white' };
      } else if (rank === '8') {
        if (file === 'a' || file === 'h') piece = { type: 'rook', color: 'black' };
        if (file === 'b' || file === 'g') piece = { type: 'knight', color: 'black' };
        if (file === 'c' || file === 'f') piece = { type: 'bishop', color: 'black' };
        if (file === 'd') piece = { type: 'queen', color: 'black' };
        if (file === 'e') piece = { type: 'king', color: 'black' };
      }
      
      board[position] = {
        position,
        piece,
        highlighted: false,
        lastMove: false,
        check: false
      };
    }
  }
  
  return board;
};

// Função para obter movimentos válidos para cada peça
export const getValidMoves = (
  position: string,
  board: Record<string, Cell>,
  moveHistory: ChessMove[]
): string[] => {
  const cell = board[position];
  if (!cell || !cell.piece) return [];
  
  const piece = cell.piece;
  const validMoves: string[] = [];
  
  const [file, rank] = position.split('');
  const fileIndex = 'abcdefgh'.indexOf(file);
  const rankIndex = parseInt(rank) - 1;
  
  // Funções auxiliares
  const isValidPosition = (f: number, r: number): boolean => {
    return f >= 0 && f < 8 && r >= 0 && r < 8;
  };
  
  const getPositionFromIndices = (f: number, r: number): string => {
    return 'abcdefgh'[f] + (r + 1).toString();
  };
  
  const isOccupiedByOpponent = (pos: string): boolean => {
    const targetCell = board[pos];
    return !!targetCell.piece && targetCell.piece.color !== piece.color;
  };
  
  const isOccupied = (pos: string): boolean => {
    return !!board[pos].piece;
  };
  
  const canAddMove = (pos: string): boolean => {
    if (!board[pos]) return false;
    return !board[pos].piece || board[pos].piece.color !== piece.color;
  };

  // Movimentos específicos por tipo de peça
  switch (piece.type) {
    case 'pawn': {
      const direction = piece.color === 'white' ? 1 : -1;
      const startRank = piece.color === 'white' ? 1 : 6;
      
      // Movimento para frente
      if (isValidPosition(fileIndex, rankIndex + direction)) {
        const forwardPos = getPositionFromIndices(fileIndex, rankIndex + direction);
        if (!isOccupied(forwardPos)) {
          validMoves.push(forwardPos);
          
          // Movimento duplo na primeira jogada
          if (rankIndex === startRank && isValidPosition(fileIndex, rankIndex + 2 * direction)) {
            const doubleForwardPos = getPositionFromIndices(fileIndex, rankIndex + 2 * direction);
            if (!isOccupied(doubleForwardPos)) {
              validMoves.push(doubleForwardPos);
            }
          }
        }
      }
      
      // Capturas diagonais
      const diagDirections = [[-1, direction], [1, direction]];
      for (const [df, dr] of diagDirections) {
        if (isValidPosition(fileIndex + df, rankIndex + dr)) {
          const diagPos = getPositionFromIndices(fileIndex + df, rankIndex + dr);
          if (isOccupiedByOpponent(diagPos)) {
            validMoves.push(diagPos);
          }
          
          // En passant
          const lastMove = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : null;
          if (lastMove && lastMove.piece.type === 'pawn') {
            const lastMoveFrom = lastMove.from;
            const lastMoveTo = lastMove.to;
            const lastFromRank = parseInt(lastMoveFrom[1]);
            const lastToRank = parseInt(lastMoveTo[1]);
            const lastFile = lastMoveTo[0];
            
            // Verificar se o último movimento foi um movimento duplo de peão
            if (Math.abs(lastToRank - lastFromRank) === 2 && 
                lastFile === 'abcdefgh'[fileIndex + df] && 
                lastToRank === (piece.color === 'white' ? 4 : 5)) {
              const enPassantPos = getPositionFromIndices(fileIndex + df, rankIndex + dr);
              validMoves.push(enPassantPos);
            }
          }
        }
      }
      break;
    }
    
    case 'rook': {
      // Direções para torre (horizontal e vertical)
      const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
      
      for (const [df, dr] of directions) {
        let f = fileIndex + df;
        let r = rankIndex + dr;
        
        while (isValidPosition(f, r)) {
          const pos = getPositionFromIndices(f, r);
          if (isOccupied(pos)) {
            if (isOccupiedByOpponent(pos)) {
              validMoves.push(pos);
            }
            break;
          }
          
          validMoves.push(pos);
          f += df;
          r += dr;
        }
      }
      break;
    }
    
    case 'knight': {
      // Movimentos do cavalo (em L)
      const knightMoves = [
        [-2, -1], [-2, 1],
        [-1, -2], [-1, 2],
        [1, -2], [1, 2],
        [2, -1], [2, 1]
      ];
      
      for (const [df, dr] of knightMoves) {
        if (isValidPosition(fileIndex + df, rankIndex + dr)) {
          const pos = getPositionFromIndices(fileIndex + df, rankIndex + dr);
          if (canAddMove(pos)) {
            validMoves.push(pos);
          }
        }
      }
      break;
    }
    
    case 'bishop': {
      // Direções para bispo (diagonais)
      const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
      
      for (const [df, dr] of directions) {
        let f = fileIndex + df;
        let r = rankIndex + dr;
        
        while (isValidPosition(f, r)) {
          const pos = getPositionFromIndices(f, r);
          if (isOccupied(pos)) {
            if (isOccupiedByOpponent(pos)) {
              validMoves.push(pos);
            }
            break;
          }
          
          validMoves.push(pos);
          f += df;
          r += dr;
        }
      }
      break;
    }
    
    case 'queen': {
      // Direções para rainha (combinação de torre e bispo)
      const directions = [
        [0, 1], [1, 0], [0, -1], [-1, 0], // Horizontal e vertical
        [1, 1], [1, -1], [-1, 1], [-1, -1] // Diagonais
      ];
      
      for (const [df, dr] of directions) {
        let f = fileIndex + df;
        let r = rankIndex + dr;
        
        while (isValidPosition(f, r)) {
          const pos = getPositionFromIndices(f, r);
          if (isOccupied(pos)) {
            if (isOccupiedByOpponent(pos)) {
              validMoves.push(pos);
            }
            break;
          }
          
          validMoves.push(pos);
          f += df;
          r += dr;
        }
      }
      break;
    }
    
    case 'king': {
      // Movimentos do rei (uma casa em qualquer direção)
      const kingMoves = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
      ];
      
      for (const [df, dr] of kingMoves) {
        if (isValidPosition(fileIndex + df, rankIndex + dr)) {
          const pos = getPositionFromIndices(fileIndex + df, rankIndex + dr);
          if (canAddMove(pos)) {
            validMoves.push(pos);
          }
        }
      }
      
      // Roque (castling)
      if (!piece.hasMoved) {
        // Roque kingside
        const kingsideRookPos = piece.color === 'white' ? 'h1' : 'h8';
        const kingsideRook = board[kingsideRookPos]?.piece;
        
        if (kingsideRook && kingsideRook.type === 'rook' && !kingsideRook.hasMoved) {
          const spaces = piece.color === 'white' ? ['f1', 'g1'] : ['f8', 'g8'];
          if (spaces.every(pos => !isOccupied(pos))) {
            validMoves.push(spaces[1]); // g1 ou g8
          }
        }
        
        // Roque queenside
        const queensideRookPos = piece.color === 'white' ? 'a1' : 'a8';
        const queensideRook = board[queensideRookPos]?.piece;
        
        if (queensideRook && queensideRook.type === 'rook' && !queensideRook.hasMoved) {
          const spaces = piece.color === 'white' ? ['b1', 'c1', 'd1'] : ['b8', 'c8', 'd8'];
          if (spaces.every(pos => !isOccupied(pos))) {
            validMoves.push(spaces[1]); // c1 ou c8
          }
        }
      }
      break;
    }
  }
  
  return validMoves;
};

// Função para verificar se o rei está em xeque
export const isKingInCheck = (board: Record<string, Cell>, color: PieceColor): boolean => {
  // Encontrar a posição do rei
  let kingPosition = '';
  for (const pos in board) {
    const cell = board[pos];
    if (cell.piece && cell.piece.type === 'king' && cell.piece.color === color) {
      kingPosition = pos;
      break;
    }
  }
  
  if (!kingPosition) return false;
  
  // Verificar se alguma peça oponente pode capturar o rei
  for (const pos in board) {
    const cell = board[pos];
    if (cell.piece && cell.piece.color !== color) {
      const moves = getValidMoves(pos, board, []);
      if (moves.includes(kingPosition)) {
        return true;
      }
    }
  }
  
  return false;
};

// Simular um movimento e verificar se o rei ainda está em xeque
export const simulateMove = (
  from: string,
  to: string,
  board: Record<string, Cell>,
  color: PieceColor
): boolean => {
  // Criar uma cópia do tabuleiro
  const boardCopy = JSON.parse(JSON.stringify(board));
  
  // Realizar o movimento
  const piece = boardCopy[from].piece;
  boardCopy[to].piece = piece;
  boardCopy[from].piece = null;
  
  // Verificar se o rei está em xeque após o movimento
  return !isKingInCheck(boardCopy, color);
};

// Função para verificar xeque-mate
export const isCheckmate = (board: Record<string, Cell>, color: PieceColor, moveHistory: ChessMove[]): boolean => {
  if (!isKingInCheck(board, color)) return false;
  
  // Verificar se há algum movimento válido que tire o rei do xeque
  for (const pos in board) {
    const cell = board[pos];
    if (cell.piece && cell.piece.color === color) {
      const validMoves = getValidMoves(pos, board, moveHistory);
      
      for (const move of validMoves) {
        if (simulateMove(pos, move, board, color)) {
          return false; // Existe um movimento válido
        }
      }
    }
  }
  
  return true; // Não há movimentos válidos para sair do xeque
};

// Função para movimentos da IA (algoritmo simples)
export const getComputerMove = (board: Record<string, Cell>, color: PieceColor, moveHistory: ChessMove[]): { from: string; to: string } | null => {
  const possibleMoves: { from: string; to: string; score: number }[] = [];
  
  // Coletar todos os movimentos possíveis
  for (const pos in board) {
    const cell = board[pos];
    if (cell.piece && cell.piece.color === color) {
      const validMoves = getValidMoves(pos, board, moveHistory);
      
      for (const move of validMoves) {
        // Simulamos o movimento para verificar se é válido
        if (simulateMove(pos, move, board, color)) {
          let score = 0;
          
          // Avaliar a pontuação do movimento
          const targetPiece = board[move].piece;
          if (targetPiece) {
            // Pontuação pela captura
            switch (targetPiece.type) {
              case 'pawn': score += 1; break;
              case 'knight': score += 3; break;
              case 'bishop': score += 3; break;
              case 'rook': score += 5; break;
              case 'queen': score += 9; break;
            }
          }
          
          // Adicionar posição central para peões e cavalos
          const [moveFile, moveRank] = move.split('');
          const fileIndex = 'abcdefgh'.indexOf(moveFile);
          const rankIndex = parseInt(moveRank) - 1;
          
          if (cell.piece.type === 'pawn' || cell.piece.type === 'knight') {
            if (fileIndex > 1 && fileIndex < 6 && rankIndex > 1 && rankIndex < 6) {
              score += 0.5;
            }
          }
          
          possibleMoves.push({ from: pos, to: move, score });
        }
      }
    }
  }
  
  if (possibleMoves.length === 0) return null;
  
  // Ordenar movimentos por pontuação
  possibleMoves.sort((a, b) => b.score - a.score);
  
  // Escolher o movimento com maior pontuação ou um aleatório entre os melhores
  const topMoves = possibleMoves.filter(m => m.score >= (possibleMoves[0].score - 0.5));
  const selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];
  
  return selectedMove;
};

export const isStalemate = (board: Record<string, Cell>, color: PieceColor, moveHistory: ChessMove[]): boolean => {
  if (isKingInCheck(board, color)) return false;
  
  // Verificar se há algum movimento válido
  for (const pos in board) {
    const cell = board[pos];
    if (cell.piece && cell.piece.color === color) {
      const validMoves = getValidMoves(pos, board, moveHistory);
      
      for (const move of validMoves) {
        if (simulateMove(pos, move, board, color)) {
          return false; // Existe um movimento válido
        }
      }
    }
  }
  
  return true; // Não há movimentos válidos e o rei não está em xeque
};
