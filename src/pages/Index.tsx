
import React, { useState, useEffect } from 'react';
import ChessBoard from '@/components/ChessBoard';
import GameControls from '@/components/GameControls';
import MoveHistory from '@/components/MoveHistory';
import PlayerRegistration from '@/components/PlayerRegistration';
import GameResult from '@/components/GameResult';
import ChessRules from '@/components/ChessRules';

import { toast } from "@/components/ui/sonner";
import { ChessGameState, ChessMove, GameMode, PieceColor, Player } from '@/types/chess';
import { 
  createInitialBoard, 
  getValidMoves, 
  isKingInCheck, 
  isCheckmate,
  isStalemate,
  simulateMove
} from '@/utils/chessUtils';

const Index = () => {
  // Estado do jogo
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
  
  // Estado do aplicativo
  const [gameStarted, setGameStarted] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode>('players');
  const [showRules, setShowRules] = useState(false);
  const [players, setPlayers] = useState<[Player, Player] | null>(null);
  
  // Manipulador de movimento
  const handleMove = (from: string, to: string) => {
    // Selecionar peça
    if (from && !to) {
      const validMoves = getValidMoves(from, gameState.board, gameState.moveHistory);
      
      // Filtrar movimentos que deixariam o rei em xeque
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
    
    // Limpar seleção
    if (!from && !to) {
      setGameState(prev => ({
        ...prev,
        selectedCell: null,
        validMoves: []
      }));
      return;
    }
    
    // Realizar movimento
    if (from && to) {
      const newBoard = { ...gameState.board };
      const fromCell = newBoard[from];
      const toCell = newBoard[to];
      const piece = fromCell.piece!;
      const captured = toCell.piece;
      
      // Registrar se a peça já se moveu (importante para roque e peões)
      piece.hasMoved = true;
      
      // Realizar o movimento
      toCell.piece = piece;
      fromCell.piece = null;
      
      // Limpar sinalizações de último movimento
      for (const key in newBoard) {
        newBoard[key].lastMove = false;
      }
      
      // Marcar o último movimento
      fromCell.lastMove = true;
      toCell.lastMove = true;
      
      // Criar registro do movimento
      const move: ChessMove = {
        from,
        to,
        piece: { ...piece },
        captured: captured ? { ...captured } : undefined
      };
      
      // Regras especiais:
      
      // Roque (castling)
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
      
      // Promoção de peão
      if (piece.type === 'pawn' && (to[1] === '8' || to[1] === '1')) {
        toCell.piece = { ...toCell.piece!, type: 'queen' };
        move.promotion = 'queen';
        toast.success("Peão promovido a Rainha!");
      }
      
      // Atualizar o histórico de movimentos
      const newMoveHistory = [...gameState.moveHistory, move];
      
      // Alternar jogador
      const nextPlayer = gameState.currentPlayer === 'white' ? 'black' : 'white';
      
      // Verificar xeque
      const isCheck = isKingInCheck(newBoard, nextPlayer);
      
      // Limpar marcações de xeque anteriores
      for (const key in newBoard) {
        newBoard[key].check = false;
      }
      
      // Marcar o rei em xeque
      if (isCheck) {
        for (const pos in newBoard) {
          const cell = newBoard[pos];
          if (cell.piece && cell.piece.type === 'king' && cell.piece.color === nextPlayer) {
            cell.check = true;
            break;
          }
        }
      }
      
      // Verificar xeque-mate ou empate
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
  
  // Reiniciar o jogo
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
  
  // Desfazer o último movimento
  const handleUndo = () => {
    if (gameState.moveHistory.length === 0) {
      toast.info("Não há movimento para desfazer");
      return;
    }
    
    // Se for contra o computador, precisa desfazer 2 movimentos
    const movesToUndo = gameMode === 'computer' && gameState.currentPlayer === 'white' ? 2 : 1;
    
    if (gameMode === 'computer' && gameState.moveHistory.length === 1) {
      toast.info("Não há movimento suficiente para desfazer");
      return;
    }
    
    // Copiar o tabuleiro inicial
    let newBoard = createInitialBoard();
    const newMoveHistory = gameState.moveHistory.slice(0, -movesToUndo);
    
    // Refazer todos os movimentos exceto os últimos
    for (const move of newMoveHistory) {
      const fromCell = newBoard[move.from];
      const toCell = newBoard[move.to];
      
      // Mover a peça
      toCell.piece = { ...move.piece, hasMoved: true };
      fromCell.piece = null;
      
      // Tratar casos especiais de roque
      if (move.castling) {
        const rank = move.from[1];
        const isKingside = move.castling === 'kingside';
        
        const rookFrom = isKingside ? `h${rank}` : `a${rank}`;
        const rookTo = isKingside ? `f${rank}` : `d${rank}`;
        
        const rookCell = newBoard[rookFrom];
        const rookDestination = newBoard[rookTo];
        
        // Mover a torre
        rookDestination.piece = { type: 'rook', color: move.piece.color, hasMoved: true };
        rookCell.piece = null;
      }
      
      // Tratar promoção
      if (move.promotion) {
        toCell.piece = { ...toCell.piece!, type: move.promotion };
      }
    }
    
    // Limpar marcações de último movimento e xeque
    for (const key in newBoard) {
      newBoard[key].lastMove = false;
      newBoard[key].check = false;
    }
    
    // Marcar o último movimento
    if (newMoveHistory.length > 0) {
      const lastMove = newMoveHistory[newMoveHistory.length - 1];
      newBoard[lastMove.from].lastMove = true;
      newBoard[lastMove.to].lastMove = true;
    }
    
    // Verificar xeque após desfazer
    const currentPlayer = movesToUndo === 1 ? 
      (gameState.currentPlayer === 'white' ? 'black' : 'white') : 
      gameState.currentPlayer;
      
    const isCheck = isKingInCheck(newBoard, currentPlayer);
    
    // Marcar o rei em xeque
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
  
  // Alterar modo de jogo
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
  
  // Registrar jogadores
  const handlePlayersSubmit = (newPlayers: [Player, Player]) => {
    setPlayers(newPlayers);
    setGameStarted(true);
  };
  
  // Novo jogo após fim do jogo
  const handleNewGame = () => {
    handleRestart();
    if (gameMode === 'players') {
      setGameStarted(false);
      setPlayers(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 py-8 px-4">
      <div className="container max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 text-gray-800">
          XadrezArena
        </h1>
        
        <div className="grid gap-8 md:grid-cols-[1fr_300px]">
          <div className="space-y-8">
            {!gameStarted && (
              <PlayerRegistration 
                onPlayersSubmit={handlePlayersSubmit} 
                gameMode={gameMode} 
              />
            )}
            
            {gameStarted && (
              <>
                {gameState.isGameOver ? (
                  <GameResult 
                    winner={gameState.winner} 
                    isDraw={gameState.stalemate} 
                    players={players!}
                    onNewGame={handleNewGame}
                  />
                ) : (
                  <ChessBoard 
                    gameState={gameState} 
                    onMove={handleMove}
                    isComputerTurn={gameMode === 'computer'}
                    computerColor="black"
                  />
                )}
              </>
            )}
            
            {gameStarted && !gameState.isGameOver && (
              <div className="text-center font-semibold">
                {players && (
                  <p className="mb-2">
                    {gameState.currentPlayer === 'white' ? (
                      <>Vez de <span className="text-blue-600">{players[0].name}</span> (brancas)</>
                    ) : (
                      <>Vez de <span className="text-blue-600">{players[1].name}</span> (pretas)</>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <GameControls 
              currentPlayer={gameState.currentPlayer}
              onRestart={handleRestart}
              onUndo={handleUndo}
              gameMode={gameMode}
              setGameMode={handleChangeGameMode}
              onShowRules={() => setShowRules(true)}
            />
            
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
