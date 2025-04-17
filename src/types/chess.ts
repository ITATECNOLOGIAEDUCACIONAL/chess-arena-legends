export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export interface Cell {
  position: string;
  piece: ChessPiece | null;
  highlighted: boolean;
  lastMove: boolean;
  check: boolean;
}

export interface ChessMove {
  from: string;
  to: string;
  piece: ChessPiece;
  captured?: ChessPiece;
  promotion?: PieceType;
  enPassant?: boolean;
  castling?: 'kingside' | 'queenside';
}

export interface ChessGameState {
  board: Record<string, Cell>;
  currentPlayer: PieceColor;
  selectedCell: string | null;
  moveHistory: ChessMove[];
  validMoves: string[];
  check: boolean;
  checkmate: boolean;
  stalemate: boolean;
  isGameOver: boolean;
  winner: PieceColor | null;
}

export interface Player {
  name: string;
  color: PieceColor;
  isComputer: boolean;
  userId?: string | null;
}

export type GameMode = 'players' | 'computer';
