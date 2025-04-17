
import { useState, useEffect } from 'react';
import { ChessGameState, ChessMove, GameMode, PieceColor, Player } from '@/types/chess';
import { 
  createInitialBoard, 
  getValidMoves, 
  isKingInCheck, 
  isCheckmate,
  isStalemate,
  simulateMove
} from '@/utils/chessUtils';
import { toast } from "@/components/ui/sonner";
import { createClient } from '@supabase/supabase-js';
import { PlayerCompetition } from '@/types/supabase';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useChessGame = (gameMode: GameMode, players: [Player, Player] | null) => {
  // Game state
  const [gameState, setGameState] = useState<ChessGameState>({
    board: createInitialBoard(),
    currentPlayer: 'white',
    selectedCell: null,
    moveHistory: [],
    validMoves: [],
    check: false,
    checkmate: false,
    stalemate: false,
    isGameOver: false,
    winner: null,
  });
  
  // Move handler
  const handleMove = (from: string, to: string) => {
    // Select piece
    if (from && !to) {
      const validMoves = getValidMoves(from, gameState.board, gameState.moveHistory);
      
      // Filter moves that would leave the king in check
      const legalMoves = validMoves.filter(move => {
        return simulateMove(from, move, gameState.board, gameState.currentPlayer);
      });
      
      setGameState(prev => ({
        ...prev,
        selectedCell: from,
        validMoves: legalMoves
      }));
      return;
    }
    
    // Clear selection
    if (!from && !to) {
      setGameState(prev => ({
        ...prev,
        selectedCell: null,
        validMoves: []
      }));
      return;
    }
    
    // Make move
    if (from && to) {
      const newBoard = { ...gameState.board };
      const fromCell = newBoard[from];
      const toCell = newBoard[to];
      const piece = fromCell.piece!;
      const captured = toCell.piece;
      
      // Record if the piece has moved (important for castling and pawns)
      piece.hasMoved = true;
      
      // Make the move
      toCell.piece = piece;
      fromCell.piece = null;
      
      // Clear last move highlights
      for (const key in newBoard) {
        newBoard[key].lastMove = false;
      }
      
      // Mark last move
      fromCell.lastMove = true;
      toCell.lastMove = true;
      
      // Create move record
      const move: ChessMove = {
        from,
        to,
        piece: { ...piece },
        captured: captured ? { ...captured } : undefined
      };
      
      // Special rules:
      
      // Castling
      if (piece.type === 'king' && Math.abs('abcdefgh'.indexOf(from[0]) - 'abcdefgh'.indexOf(to[0])) > 1) {
        const isKingside = to[0] === 'g';
        const rookFrom = isKingside ? `h${to[1]}` : `a${to[1]}`;
        const rookTo = isKingside ? `f${to[1]}` : `d${to[1]}`;
        
        const rookCell = newBoard[rookFrom];
        const rookDestination = newBoard[rookTo];
        
        rookDestination.piece = rookCell.piece;
        rookCell.piece = null;
        
        move.castling = isKingside ? 'kingside' : 'queenside';
      }
      
      // Pawn promotion
      if (piece.type === 'pawn' && (to[1] === '8' || to[1] === '1')) {
        toCell.piece = { ...toCell.piece!, type: 'queen' };
        move.promotion = 'queen';
        toast.success("Peão promovido a Rainha!");
      }
      
      // Update move history
      const newMoveHistory = [...gameState.moveHistory, move];
      
      // Switch player
      const nextPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
      
      // Check for check
      const isCheck = isKingInCheck(newBoard, nextPlayer);
      
      // Clear previous check markings
      for (const key in newBoard) {
        newBoard[key].check = false;
      }
      
      // Mark king in check
      if (isCheck) {
        for (const pos in newBoard) {
          const cell = newBoard[pos];
          if (cell.piece && cell.piece.type === 'king' && cell.piece.color === nextPlayer) {
            cell.check = true;
            break;
          }
        }
      }
      
      // Check for checkmate or stalemate
      const isCheckmated = isCheck && isCheckmate(newBoard, nextPlayer, newMoveHistory);
      const isStalemated = !isCheck && isStalemate(newBoard, nextPlayer, newMoveHistory);
      
      if (isCheckmated) {
        toast.success(`Xeque-mate! ${gameState.currentPlayer === 'white' ? 'Brancas' : 'Pretas'} vencem!`);
      } else if (isStalemated) {
        toast.info("Empate por afogamento!");
      } else if (isCheck) {
        toast.warning("Xeque!");
      }
      
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        currentPlayer: nextPlayer,
        selectedCell: null,
        validMoves: [],
        moveHistory: newMoveHistory,
        check: isCheck,
        checkmate: isCheckmated,
        stalemate: isStalemated,
        isGameOver: isCheckmated || isStalemated,
        winner: isCheckmated ? gameState.currentPlayer : null
      }));
    }
  };
  
  // Restart game
  const handleRestart = () => {
    setGameState({
      board: createInitialBoard(),
      currentPlayer: 'white',
      selectedCell: null,
      moveHistory: [],
      validMoves: [],
      check: false,
      checkmate: false,
      stalemate: false,
      isGameOver: false,
      winner: null,
    });
  };
  
  // Undo last move
  const handleUndo = () => {
    if (gameState.moveHistory.length === 0) {
      toast.info("Não há movimento para desfazer");
      return;
    }
    
    // For computer games, undo 2 moves
    const movesToUndo = gameMode === 'computer' && gameState.currentPlayer === 'white' ? 2 : 1;
    
    if (gameMode === 'computer' && gameState.moveHistory.length === 1) {
      toast.info("Não há movimento suficiente para desfazer");
      return;
    }
    
    // Copy the initial board
    let newBoard = createInitialBoard();
    const newMoveHistory = gameState.moveHistory.slice(0, -movesToUndo);
    
    // Replay all moves except the last ones
    for (const move of newMoveHistory) {
      const fromCell = newBoard[move.from];
      const toCell = newBoard[move.to];
      
      // Move the piece
      toCell.piece = { ...move.piece, hasMoved: true };
      fromCell.piece = null;
      
      // Handle castling
      if (move.castling) {
        const rank = move.from[1];
        const isKingside = move.castling === 'kingside';
        
        const rookFrom = isKingside ? `h${rank}` : `a${rank}`;
        const rookTo = isKingside ? `f${rank}` : `d${rank}`;
        
        const rookCell = newBoard[rookFrom];
        const rookDestination = newBoard[rookTo];
        
        // Move the rook
        rookDestination.piece = { type: 'rook', color: move.piece.color, hasMoved: true };
        rookCell.piece = null;
      }
      
      // Handle promotion
      if (move.promotion) {
        toCell.piece = { ...toCell.piece!, type: move.promotion };
      }
    }
    
    // Clear last move and check highlights
    for (const key in newBoard) {
      newBoard[key].lastMove = false;
      newBoard[key].check = false;
    }
    
    // Mark last move
    if (newMoveHistory.length > 0) {
      const lastMove = newMoveHistory[newMoveHistory.length - 1];
      newBoard[lastMove.from].lastMove = true;
      newBoard[lastMove.to].lastMove = true;
    }
    
    // Check for check after undoing
    const currentPlayer = movesToUndo === 1 ? 
      (gameState.currentPlayer === 'white' ? 'black' : 'white') : 
      gameState.currentPlayer;
      
    const isCheck = isKingInCheck(newBoard, currentPlayer);
    
    // Mark the king in check
    if (isCheck) {
      for (const pos in newBoard) {
        const cell = newBoard[pos];
        if (cell.piece && cell.piece.type === 'king' && cell.piece.color === currentPlayer) {
          cell.check = true;
          break;
        }
      }
    }
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: currentPlayer,
      selectedCell: null,
      validMoves: [],
      moveHistory: newMoveHistory,
      check: isCheck,
      checkmate: false,
      stalemate: false,
      isGameOver: false,
      winner: null
    }));
    
    toast.info("Movimento desfeito");
  };
  
  // Handle new game after game over
  const handleNewGame = async () => {
    // Update player competition stats
    if (gameState.isGameOver && players) {
      try {
        await Promise.all(
          players.map(async (player) => {
            if (player.isComputer) return;

            // Determine game outcome
            let updateData: Partial<PlayerCompetition> = {
              total_games: 1,
              last_played: new Date()
            };

            if (gameState.stalemate) {
              updateData.draws = 1;
            } else if (gameState.winner === player.color) {
              updateData.wins = 1;
            } else {
              updateData.losses = 1;
            }

            // Update player stats
            const { error } = await supabase
              .from('player_competitions')
              .update(updateData)
              .eq('player_name', player.name);

            if (error) {
              console.error('Failed to update player stats:', error);
            }
          })
        );
      } catch (error) {
        console.error('Error updating competition stats:', error);
      }
    }

    // Reset game
    handleRestart();
  };
  
  return {
    gameState,
    handleMove,
    handleRestart,
    handleUndo,
    handleNewGame
  };
};
