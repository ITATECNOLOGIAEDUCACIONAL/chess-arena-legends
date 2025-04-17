import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ChessBoard from '@/components/ChessBoard';
import GameControls from '@/components/GameControls';
import MoveHistory from '@/components/MoveHistory';
import PlayerRegistration from '@/components/PlayerRegistration';
import GameResult from '@/components/GameResult';
import ChessRules from '@/components/ChessRules';
import Authentication from '@/components/Authentication';
import { Button } from '@/components/ui/button';
import { Trophy, LogOut } from 'lucide-react';

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

import { createClient } from '@supabase/supabase-js';
import { PlayerCompetition } from '@/types/supabase';
import { useAuth } from '@/contexts/AuthContext';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL, 
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const Index = () => {
  // Auth state
  const { user, signOut } = useAuth();
  
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
    if (gameMode === 'players') {
      setGameStarted(false);
      setPlayers(null);
    }
  };

  // Handle authentication change
  const handleAuthChange = (authUser: any) => {
    if (authUser) {
      toast.success(`Bem-vindo, ${authUser.email?.split('@')[0]}!`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 py-8 px-4">
      <div className="container max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            XadrezArena
          </h1>
          <div className="flex items-center gap-3">
            {user && (
              <div className="text-sm mr-4">
                Olá, <span className="font-semibold">{user.email?.split('@')[0]}</span>
              </div>
            )}
            
            {user ? (
              <Button variant="outline" size="sm" onClick={signOut} className="mr-3">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            ) : null}
            
            <Link to="/leaderboard">
              <Button variant="outline" className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Ver Classificação
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid gap-8 md:grid-cols-[1fr_300px]">
          <div className="space-y-8">
            {!user ? (
              <Authentication onAuthChange={handleAuthChange} />
            ) : !gameStarted ? (
              <PlayerRegistration 
                onPlayersSubmit={handlePlayersSubmit} 
                gameMode={gameMode} 
              />
            ) : (
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
            {user && (
              <GameControls 
                currentPlayer={gameState.currentPlayer}
                onRestart={handleRestart}
                onUndo={handleUndo}
                gameMode={gameMode}
                setGameMode={handleChangeGameMode}
                onShowRules={() => setShowRules(true)}
              />
            )}
            
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
