import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ArrowRight,
  RotateCw,
  Volume2,
  VolumeX,
  Lightbulb,
  Undo2,
  Flag,
  Handshake,
  Bot,
  Users,
  X,
} from 'lucide-react';
import {
  Board as BoardType,
  DifficultyId,
  GameMode,
  GameSettings,
  GameStatus,
  Move,
  Piece,
  Position,
  PromotionKind,
  Side,
} from '../types/chess';
import {
  allLegalMoves,
  applyMove,
  copyBoard,
  copyCastlingRights,
  createInitialBoard,
  deriveCastlingRights,
  formatSan,
  INITIAL_CASTLING_RIGHTS,
  isInsufficientMaterial,
  isInCheck,
  legalMoves,
  otherSide,
  PIECE_VALUES,
  positionKey,
  samePosition,
  updateCastlingRights,
} from '../lib/chess/chessRules';
import { findBestAiMove } from '../lib/chess/aiEngine';
import { soundManager } from '../lib/sound';
import { Board } from './Board';
import { ClockCard } from './ClockCard';
import { MoveHistory } from './MoveHistory';
import { PromotionModal } from './PromotionModal';
import { GameOverModal } from './GameOverModal';
import { RewardedAdModal } from './RewardedAdModal';

const MAX_HINTS_PER_GAME = 3;
const MAX_UNDOS_PER_GAME = 3;

function getPieceArabicName(piece: Piece | null): string {
  if (!piece) return 'القطعة';
  switch (piece.kind) {
    case 'pawn':
      return 'البيدق';
    case 'knight':
      return 'الحصان';
    case 'bishop':
      return 'الفيل';
    case 'rook':
      return 'القلعة';
    case 'queen':
      return 'الوزير';
    case 'king':
      return 'الملك';
    default:
      return 'القطعة';
  }
}

function toAlgebraicSquare(pos: Position): string {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  return `${files[pos.col]}${8 - pos.row}`;
}

interface GameScreenProps {
  gameMode: GameMode;
  playerSide: Side;
  settings: GameSettings;
  resume: boolean;
  onBackToHome: () => void;
  onRecordResult: (result: 'win' | 'loss' | 'draw') => void;
  onSaveGameState: (state: unknown) => void;
  savedState: unknown;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  gameMode,
  playerSide,
  settings,
  resume,
  onBackToHome,
  onRecordResult,
  onSaveGameState,
  savedState,
}) => {
  // Extract initial snapshot once upon mount without reacting to prop mutations
  const initialSnapshot = useRef<any>(
    resume && savedState && typeof savedState === 'object' ? savedState : null
  ).current;

  // Clocks initial
  const initialTime = settings.timerMinutes * 60;

  // Game state initialized with snapshot or default
  const [board, setBoard] = useState<BoardType>(() => {
    if (initialSnapshot?.board) return initialSnapshot.board;
    return createInitialBoard();
  });
  const [turn, setTurn] = useState<Side>(() => initialSnapshot?.turn || 'white');
  const [history, setHistory] = useState<Move[]>(() => initialSnapshot?.history || []);
  const [castlingRights, setCastlingRights] = useState(
    () => initialSnapshot?.castlingRights || INITIAL_CASTLING_RIGHTS
  );
  const [enPassantTarget, setEnPassantTarget] = useState<Position | null>(
    () => initialSnapshot?.enPassantTarget || null
  );
  const [halfmoveClock, setHalfmoveClock] = useState<number>(
    () => initialSnapshot?.halfmoveClock || 0
  );
  const [positionKeys, setPositionKeys] = useState<string[]>(
    () =>
      initialSnapshot?.positionKeys || [
        positionKey(createInitialBoard(), 'white', INITIAL_CASTLING_RIGHTS, null),
      ]
  );
  const [status, setStatus] = useState<GameStatus>(
    () => initialSnapshot?.status || 'playing'
  );

  // Interactive selection
  const [selectedSquare, setSelectedSquare] = useState<Position | null>(null);
  const [legalTargetSquares, setLegalTargetSquares] = useState<Position[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Position;
    to: Position;
  } | null>(null);

  // Board flipping & Hints
  const [boardFlipped, setBoardFlipped] = useState(() => playerSide === 'black');
  const [hint, setHint] = useState<{ from: Position; to: Position } | null>(null);
  const [hintsRemaining, setHintsRemaining] = useState<number>(() => {
    if (typeof initialSnapshot?.hintsRemaining === 'number') {
      return Math.max(0, Math.min(MAX_HINTS_PER_GAME, initialSnapshot.hintsRemaining));
    }
    return MAX_HINTS_PER_GAME;
  });
  const [undosRemaining, setUndosRemaining] = useState<number>(() => {
    if (typeof initialSnapshot?.undosRemaining === 'number') {
      return Math.max(0, initialSnapshot.undosRemaining);
    }
    return MAX_UNDOS_PER_GAME;
  });
  const [rewardModalState, setRewardModalState] = useState<'hints' | 'undos' | 'both' | null>(null);
  const [isCalculatingHint, setIsCalculatingHint] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Clocks
  const [whiteClock, setWhiteClock] = useState<number>(
    () => initialSnapshot?.whiteClock ?? initialTime
  );
  const [blackClock, setBlackClock] = useState<number>(
    () => initialSnapshot?.blackClock ?? initialTime
  );

  // AI thinking state
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Refs for current snapshot access without stale closures
  const boardRef = useRef(board);
  boardRef.current = board;
  const turnRef = useRef(turn);
  turnRef.current = turn;
  const statusRef = useRef(status);
  statusRef.current = status;
  const castlingRightsRef = useRef(castlingRights);
  castlingRightsRef.current = castlingRights;
  const enPassantRef = useRef(enPassantTarget);
  enPassantRef.current = enPassantTarget;
  const historyRef = useRef(history);
  historyRef.current = history;
  const clocksRef = useRef({ white: whiteClock, black: blackClock });
  clocksRef.current = { white: whiteClock, black: blackClock };
  const lastTimerTickRef = useRef(Date.now());

  // Sound toggle override for this match
  const [soundOn, setSoundOn] = useState(settings.soundEnabled);

  // Captured pieces
  const capturedPieces = React.useMemo(() => {
    const whitePieces: Piece[] = [];
    const blackPieces: Piece[] = [];
    history.forEach((m) => {
      if (m.captured) {
        if (m.captured.side === 'white') {
          whitePieces.push(m.captured);
        } else {
          blackPieces.push(m.captured);
        }
      }
    });
    return { white: whitePieces, black: blackPieces };
  }, [history]);

  // Material evaluation advantage
  const materialAdvantage = React.useMemo(() => {
    let whiteSum = 0;
    let blackSum = 0;
    board.forEach((row) => {
      row.forEach((p) => {
        if (!p) return;
        if (p.side === 'white') whiteSum += PIECE_VALUES[p.kind];
        else blackSum += PIECE_VALUES[p.kind];
      });
    });
    return {
      white: whiteSum > blackSum ? whiteSum - blackSum : 0,
      black: blackSum > whiteSum ? blackSum - whiteSum : 0,
    };
  }, [board]);

  // Use elapsed wall-clock time so Android backgrounding does not pause the clock.
  useEffect(() => {
    if (!settings.timerEnabled || status !== 'playing') return;
    lastTimerTickRef.current = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - lastTimerTickRef.current) / 1000);
      if (elapsedSeconds < 1) return;
      lastTimerTickRef.current += elapsedSeconds * 1000;
      const activeTurn = turnRef.current;
      if (activeTurn === 'white') {
        setWhiteClock((prev) => {
          if (prev <= elapsedSeconds) {
            clearInterval(interval);
            statusRef.current = 'timeout';
            setStatus('timeout');
            soundManager.play('gameOver', soundOn);
            onRecordResult(gameMode === 'computer' && playerSide === 'white' ? 'loss' : 'win');
            return 0;
          }
          return prev - elapsedSeconds;
        });
      } else {
        setBlackClock((prev) => {
          if (prev <= elapsedSeconds) {
            clearInterval(interval);
            statusRef.current = 'timeout';
            setStatus('timeout');
            soundManager.play('gameOver', soundOn);
            onRecordResult(gameMode === 'computer' && playerSide === 'black' ? 'loss' : 'win');
            return 0;
          }
          return prev - elapsedSeconds;
        });
      }
    }, 250);

    return () => clearInterval(interval);
  }, [settings.timerEnabled, status, gameMode, playerSide, soundOn, onRecordResult]);

  // Save game state ONLY on game changes (not on every clock tick!)
  useEffect(() => {
    if (status !== 'playing') {
      onSaveGameState(null); // Clear saved active game on completion
      return;
    }

    // Only persist if game has active moves or is resumed
    if (history.length === 0 && !initialSnapshot) return;

    onSaveGameState({
      board,
      turn,
      history,
      castlingRights,
      enPassantTarget,
      halfmoveClock,
      positionKeys,
      status,
      whiteClock: clocksRef.current.white,
      blackClock: clocksRef.current.black,
      gameMode,
      playerSide,
      hintsRemaining,
      undosRemaining,
    });
  }, [
    board,
    turn,
    history,
    castlingRights,
    enPassantTarget,
    halfmoveClock,
    positionKeys,
    status,
    gameMode,
    playerSide,
    hintsRemaining,
    undosRemaining,
    initialSnapshot,
    onSaveGameState,
  ]);

  useEffect(() => {
    const persistWhenHidden = () => {
      if (document.visibilityState !== 'hidden' || statusRef.current !== 'playing' || historyRef.current.length === 0) return;
      onSaveGameState({
        board: boardRef.current,
        turn: turnRef.current,
        history: historyRef.current,
        castlingRights: castlingRightsRef.current,
        enPassantTarget: enPassantRef.current,
        halfmoveClock,
        positionKeys,
        status: statusRef.current,
        whiteClock: clocksRef.current.white,
        blackClock: clocksRef.current.black,
        gameMode,
        playerSide,
        hintsRemaining,
        undosRemaining,
      });
    };
    document.addEventListener('visibilitychange', persistWhenHidden);
    return () => document.removeEventListener('visibilitychange', persistWhenHidden);
  }, [gameMode, halfmoveClock, hintsRemaining, onSaveGameState, playerSide, positionKeys, undosRemaining]);

  // Central Move Execution Function
  const executeMove = useCallback(
    (from: Position, to: Position, promotion: PromotionKind = 'queen') => {
      const movingPiece = boardRef.current[from.row][from.col];
      if (!movingPiece) return;

      const targetPiece = boardRef.current[to.row][to.col];
      const isCastle = movingPiece.kind === 'king' && Math.abs(to.col - from.col) === 2;
      const isEnPassant =
        movingPiece.kind === 'pawn' &&
        enPassantRef.current &&
        samePosition(to, enPassantRef.current) &&
        !targetPiece;

      const capturedPiece = isEnPassant
        ? boardRef.current[from.row][to.col]
        : targetPiece;

      const nextBoard = applyMove(
        boardRef.current,
        from,
        to,
        promotion,
        enPassantRef.current,
      );

      const nextSide = otherSide(movingPiece.side);
      const nextRights = updateCastlingRights(
        castlingRightsRef.current,
        movingPiece,
        from,
        to,
        capturedPiece,
      );

      const nextEp: Position | null =
        movingPiece.kind === 'pawn' && Math.abs(to.row - from.row) === 2
          ? { row: (from.row + to.row) / 2, col: from.col }
          : null;

      const nextHalfmove =
        movingPiece.kind === 'pawn' || Boolean(capturedPiece) ? 0 : halfmoveClock + 1;

      const nextMoves = allLegalMoves(nextBoard, nextSide, nextRights, nextEp);
      const moveObj: Move = {
        from,
        to,
        piece: movingPiece,
        captured: capturedPiece,
        special: isCastle ? 'castle' : isEnPassant ? 'enPassant' : 'normal',
        promotion:
          movingPiece.kind === 'pawn' && (to.row === 0 || to.row === 7)
            ? promotion
            : undefined,
      };

      moveObj.san = formatSan(
        moveObj,
        boardRef.current,
        castlingRightsRef.current,
        enPassantRef.current,
        nextBoard,
        nextSide,
        nextMoves,
      );

      const nextKey = positionKey(nextBoard, nextSide, nextRights, nextEp);
      const updatedKeys = [...positionKeys, nextKey];
      const repetitions = updatedKeys.filter((k) => k === nextKey).length;

      // Determine game outcome
      let nextStatus: GameStatus = 'playing';
      if (nextMoves.length === 0) {
        if (isInCheck(nextBoard, nextSide)) {
          nextStatus = 'checkmate';
          soundManager.play('gameOver', soundOn);
          onRecordResult(
            gameMode === 'computer'
              ? movingPiece.side === playerSide
                ? 'win'
                : 'loss'
              : 'win',
          );
        } else {
          nextStatus = 'stalemate';
          soundManager.play('gameOver', soundOn);
          onRecordResult('draw');
        }
      } else if (isInsufficientMaterial(nextBoard)) {
        nextStatus = 'drawInsufficientMaterial';
        soundManager.play('gameOver', soundOn);
        onRecordResult('draw');
      } else if (repetitions >= 3) {
        nextStatus = 'drawThreefold';
        soundManager.play('gameOver', soundOn);
        onRecordResult('draw');
      } else if (nextHalfmove >= 100) {
        nextStatus = 'drawFiftyMove';
        soundManager.play('gameOver', soundOn);
        onRecordResult('draw');
      } else {
        // Sound for normal move
        if (isInCheck(nextBoard, nextSide)) {
          soundManager.play('check', soundOn);
        } else if (capturedPiece) {
          soundManager.play('capture', soundOn);
        } else if (moveObj.promotion) {
          soundManager.play('promote', soundOn);
        } else {
          soundManager.play('move', soundOn);
        }
      }

      setBoard(nextBoard);
      setTurn(nextSide);
      setHistory((prev) => [...prev, moveObj]);
      setCastlingRights(nextRights);
      setEnPassantTarget(nextEp);
      setHalfmoveClock(nextHalfmove);
      setPositionKeys(updatedKeys);
      setStatus(nextStatus);
      setSelectedSquare(null);
      setLegalTargetSquares([]);
      setHint(null);
    },
    [
      halfmoveClock,
      positionKeys,
      soundOn,
      gameMode,
      playerSide,
      onRecordResult,
    ],
  );

  // Trigger AI Move when it's AI turn in computer mode
  useEffect(() => {
    if (gameMode !== 'computer' || status !== 'playing') return;

    const isAiTurn = turn !== playerSide;
    if (!isAiTurn) return;

    let isMounted = true;
    setIsAiThinking(true);

    const timer = setTimeout(async () => {
      try {
        const bestMove = await findBestAiMove(
          boardRef.current,
          turnRef.current,
          settings.aiDifficulty,
          castlingRightsRef.current,
          enPassantRef.current,
          historyRef.current,
        );

        if (!isMounted) return;

        if (bestMove) {
          executeMove(bestMove.from, bestMove.to, bestMove.promotion ?? 'queen');
        }
      } finally {
        if (isMounted) setIsAiThinking(false);
      }
    }, 180); // Crisp, responsive human-like pause (reduced from 450ms)

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [turn, gameMode, playerSide, status, settings.aiDifficulty, executeMove]);

  // Handle Square Click
  const handleSquareClick = useCallback(
    (pos: Position) => {
      if (status !== 'playing' || isAiThinking) return;

      // In computer mode, human can only move their own color
      if (gameMode === 'computer' && turn !== playerSide) return;

      const clickedPiece = board[pos.row][pos.col];

      // If a piece was already selected
      if (selectedSquare) {
        // Did user click on a legal target?
        const isLegal = legalTargetSquares.some((t) => samePosition(t, pos));

        if (isLegal) {
          const selectedPiece = board[selectedSquare.row][selectedSquare.col];

          // Check if it requires pawn promotion modal
          if (
            selectedPiece?.kind === 'pawn' &&
            (pos.row === 0 || pos.row === 7)
          ) {
            setPendingPromotion({ from: selectedSquare, to: pos });
            return;
          }

          executeMove(selectedSquare, pos, 'queen');
          return;
        }

        // Did user click on another of their own pieces?
        if (clickedPiece && clickedPiece.side === turn) {
          setSelectedSquare(pos);
          setLegalTargetSquares(
            legalMoves(board, pos, castlingRights, enPassantTarget),
          );
          soundManager.play('click', soundOn);
          return;
        }

        // Clicked elsewhere: deselect
        setSelectedSquare(null);
        setLegalTargetSquares([]);
        return;
      }

      // No piece currently selected: select clicked piece if it's the current player's
      if (clickedPiece && clickedPiece.side === turn) {
        setSelectedSquare(pos);
        setLegalTargetSquares(
          legalMoves(board, pos, castlingRights, enPassantTarget),
        );
        soundManager.play('click', soundOn);
      }
    },
    [
      status,
      isAiThinking,
      gameMode,
      turn,
      playerSide,
      board,
      selectedSquare,
      legalTargetSquares,
      castlingRights,
      enPassantTarget,
      executeMove,
      soundOn,
    ],
  );

  // Promotion choice
  const handleSelectPromotion = (promotion: PromotionKind) => {
    if (pendingPromotion) {
      executeMove(pendingPromotion.from, pendingPromotion.to, promotion);
      setPendingPromotion(null);
    }
  };

  // Provide lightweight AI hint for current player (limited to 3 uses per game for fair play)
  const handleGetHint = async () => {
    if (
      status !== 'playing' ||
      isAiThinking ||
      isCalculatingHint ||
      !isInteractable ||
      hintsRemaining <= 0
    ) {
      return;
    }

    setIsCalculatingHint(true);
    try {
      // Lightweight engine check: fast (<100ms), tactically solid, no lag
      const bestMove = await findBestAiMove(
        board,
        turn,
        'medium',
        castlingRights,
        enPassantTarget,
        history,
      );
      if (bestMove) {
        setHint({ from: bestMove.from, to: bestMove.to });
        setHintsRemaining((prev) => Math.max(0, prev - 1));
        soundManager.play('click', soundOn);
      }
    } finally {
      setIsCalculatingHint(false);
    }
  };

  // Check if player has moves that can be undone
  const canUndo = useMemo(() => {
    if (status !== 'playing' || isAiThinking || undosRemaining <= 0) return false;
    if (gameMode === 'computer') {
      if (playerSide === 'white') {
        return history.length >= 2;
      } else {
        return history.length >= 3;
      }
    }
    return history.length >= 1;
  }, [status, isAiThinking, undosRemaining, gameMode, playerSide, history.length]);

  // Undo move
  const handleUndo = () => {
    if (!canUndo) return;

    // In computer mode, undo two plies (one computer, one player) to return to human player's turn
    const movesToPop = gameMode === 'computer' ? 2 : 1;

    const remainingHistory = history.slice(0, -movesToPop);

    // Replay board from scratch to guarantee 100% integrity
    let newBoard = createInitialBoard();
    let currentRights = INITIAL_CASTLING_RIGHTS;
    let currentEp: Position | null = null;
    let currentTurn: Side = 'white';
    let currentHalfmove = 0;
    const newKeys: string[] = [
      positionKey(newBoard, 'white', INITIAL_CASTLING_RIGHTS, null),
    ];

    remainingHistory.forEach((m) => {
      const p = newBoard[m.from.row][m.from.col]!;
      const cap = m.special === 'enPassant' ? newBoard[m.from.row][m.to.col] : newBoard[m.to.row][m.to.col];
      newBoard = applyMove(newBoard, m.from, m.to, m.promotion ?? 'queen', currentEp);
      currentRights = updateCastlingRights(currentRights, p, m.from, m.to, cap);
      currentEp =
        p.kind === 'pawn' && Math.abs(m.to.row - m.from.row) === 2
          ? { row: (m.from.row + m.to.row) / 2, col: m.from.col }
          : null;
      currentTurn = otherSide(currentTurn);
      currentHalfmove = p.kind === 'pawn' || cap ? 0 : currentHalfmove + 1;
      newKeys.push(positionKey(newBoard, currentTurn, currentRights, currentEp));
    });

    setBoard(newBoard);
    setTurn(currentTurn);
    setHistory(remainingHistory);
    setCastlingRights(currentRights);
    setEnPassantTarget(currentEp);
    setHalfmoveClock(currentHalfmove);
    setPositionKeys(newKeys);
    setSelectedSquare(null);
    setLegalTargetSquares([]);
    setHint(null);
    setUndosRemaining((prev) => Math.max(0, prev - 1));
    soundManager.play('click', soundOn);
  };

  // Rewarded ad completion handler
  const handleReward = (bonusHints: number, bonusUndos: number) => {
    if (bonusHints > 0) {
      setHintsRemaining((prev) => prev + bonusHints);
    }
    if (bonusUndos > 0) {
      setUndosRemaining((prev) => prev + bonusUndos);
    }
    setRewardModalState(null);
    soundManager.play('promote', soundOn);
  };

  // Resign
  const handleResign = () => {
    if (status !== 'playing') return;
    setStatus('resigned');
    soundManager.play('gameOver', soundOn);
    onRecordResult(
      gameMode === 'computer'
        ? turn === playerSide
          ? 'loss'
          : 'win'
        : 'win',
    );
  };

  // Agree Draw
  const handleAgreeDraw = () => {
    if (status !== 'playing') return;
    setStatus('agreedDraw');
    soundManager.play('gameOver', soundOn);
    onRecordResult('draw');
  };

  // Restart match
  const handleNewGame = () => {
    setBoard(createInitialBoard());
    setTurn('white');
    setHistory([]);
    setCastlingRights(INITIAL_CASTLING_RIGHTS);
    setEnPassantTarget(null);
    setHalfmoveClock(0);
    setPositionKeys([
      positionKey(createInitialBoard(), 'white', INITIAL_CASTLING_RIGHTS, null),
    ]);
    setStatus('playing');
    setWhiteClock(initialTime);
    setBlackClock(initialTime);
    setSelectedSquare(null);
    setLegalTargetSquares([]);
    setHint(null);
    setHintsRemaining(MAX_HINTS_PER_GAME);
    setUndosRemaining(MAX_UNDOS_PER_GAME);
    onSaveGameState(null);
  };

  // Fast, accessible controls that work without any external dependency.
  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedSquare(null);
        setLegalTargetSquares([]);
        setHint(null);
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (canUndo) handleUndo();
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [canUndo, handleUndo]);

  // Top player / Bottom player mapping based on board orientation
  const topSide: Side = boardFlipped ? 'white' : 'black';
  const bottomSide: Side = boardFlipped ? 'black' : 'white';

  const isInteractable =
    status === 'playing' &&
    (gameMode === 'local' || (gameMode === 'computer' && turn === playerSide));

  const lastExecutedMove = history.length > 0 ? history[history.length - 1] : null;

  return (
    <div className="w-full max-w-xl mx-auto space-y-3 px-2 sm:px-4 py-2 sm:py-4 animate-in fade-in duration-300 select-none">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between bg-stone-900/80 backdrop-blur-sm p-2 sm:p-2.5 rounded-2xl border border-stone-800 shadow-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToHome}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
            aria-label="العودة"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-200">
            {gameMode === 'computer' ? (
              <span className="flex items-center gap-1 text-amber-400">
                <Bot className="w-4 h-4" /> ضد الحاسوب ({settings.aiDifficulty})
              </span>
            ) : (
              <span className="flex items-center gap-1 text-stone-300">
                <Users className="w-4 h-4" /> لاعب ضد لاعب
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Flip Board */}
          <button
            type="button"
            onClick={() => setBoardFlipped((prev) => !prev)}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 transition-colors cursor-pointer"
            title="تدوير الرقعة"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundOn((prev) => !prev)}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 transition-colors cursor-pointer"
            title={soundOn ? 'كتم الصوت' : 'تشغيل الصوت'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
          </button>

          {/* Hint Button with 3-use fair play counter or Rewarded Ad unlock */}
          <button
            type="button"
            disabled={!isInteractable || isAiThinking || isCalculatingHint}
            onClick={hintsRemaining > 0 ? handleGetHint : () => setRewardModalState('hints')}
            className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
              hintsRemaining > 0 && isInteractable && !isAiThinking
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/60 hover:border-amber-400 active:scale-95'
                : hintsRemaining <= 0
                ? 'bg-stone-800/80 border-amber-500/40 text-amber-300 hover:bg-stone-700'
                : 'bg-stone-850 border-stone-800 text-stone-500 opacity-50 cursor-not-allowed'
            }`}
            title={
              hintsRemaining > 0
                ? `تلميح: اقتراح أفضل نقلة (متبقي ${hintsRemaining} من ${MAX_HINTS_PER_GAME})`
                : 'نفدت التلميحات - انقر لمشاهدة إعلان وتجديد الرصيد (+2 تلميحات)'
            }
          >
            <Lightbulb
              className={`w-4 h-4 ${
                hintsRemaining > 0
                  ? isCalculatingHint
                    ? 'animate-pulse text-amber-300'
                    : 'text-amber-400'
                  : 'text-stone-400'
              }`}
            />
            <span className="text-xs font-medium hidden xs:inline">تلميح</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                hintsRemaining > 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-amber-950 text-amber-400 border border-amber-500/50'
              }`}
            >
              {hintsRemaining > 0 ? `${hintsRemaining}/${MAX_HINTS_PER_GAME}` : '+إعلان'}
            </span>
          </button>

          {/* Prominent Undo Button with counter & Rewarded Ad link */}
          <button
            type="button"
            disabled={!canUndo && undosRemaining > 0}
            onClick={canUndo ? handleUndo : undosRemaining <= 0 ? () => setRewardModalState('undos') : undefined}
            className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
              canUndo
                ? 'bg-stone-800/90 border-stone-700 text-stone-200 hover:bg-stone-700 hover:border-amber-500/50 hover:text-amber-300 active:scale-95'
                : undosRemaining <= 0
                ? 'bg-stone-800/80 border-amber-500/40 text-amber-300 hover:bg-stone-700'
                : 'bg-stone-900/60 border-stone-800/40 text-stone-600 opacity-40 cursor-not-allowed'
            }`}
            title={
              canUndo
                ? `تراجع عن النقلة الأخيرة (متبقي ${undosRemaining} من ${MAX_UNDOS_PER_GAME})`
                : undosRemaining <= 0
                ? 'نفدت مرات التراجع - انقر لمشاهدة إعلان وتجديد الرصيد (+2 تراجع)'
                : 'لا توجد نقلات للتراجع عنها حالياً'
            }
          >
            <Undo2 className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-medium hidden xs:inline">تراجع</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                undosRemaining > 0
                  ? 'bg-stone-700 text-amber-300 border border-stone-600'
                  : 'bg-amber-950 text-amber-400 border border-amber-500/50'
              }`}
            >
              {undosRemaining > 0 ? `${undosRemaining}/${MAX_UNDOS_PER_GAME}` : '+إعلان'}
            </span>
          </button>
        </div>
      </div>

      {/* Top Player Clock Card */}
      <ClockCard
        side={topSide}
        name={
          gameMode === 'computer'
            ? topSide === playerSide
              ? 'أنت'
              : 'الحاسوب'
            : topSide === 'white'
              ? 'اللاعب الأبيض'
              : 'اللاعب الأسود'
        }
        isAi={gameMode === 'computer' && topSide !== playerSide}
        isActive={turn === topSide && status === 'playing'}
        secondsRemaining={topSide === 'white' ? whiteClock : blackClock}
        timerEnabled={settings.timerEnabled}
        isInCheck={isInCheck(board, topSide)}
        isThinking={isAiThinking && turn === topSide}
        capturedPieces={capturedPieces[topSide === 'white' ? 'black' : 'white']}
        advantageScore={materialAdvantage[topSide]}
      />

      {/* Active Hint Banner */}
      {hint && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs shadow-md animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <span className="font-semibold text-amber-300">أفضل نقلة مقترحة:</span>{' '}
              <span>
                انقل {getPieceArabicName(board[hint.from.row][hint.from.col])} من{' '}
                <strong className="text-white font-mono bg-amber-900/80 px-1 py-0.5 rounded border border-amber-500/30">
                  {toAlgebraicSquare(hint.from)}
                </strong>{' '}
                إلى{' '}
                <strong className="text-emerald-300 font-mono bg-emerald-950/80 px-1 py-0.5 rounded border border-emerald-500/30">
                  {toAlgebraicSquare(hint.to)}
                </strong>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-amber-400/80 font-medium">
              (متبقي {hintsRemaining} من {MAX_HINTS_PER_GAME})
            </span>
            <button
              type="button"
              onClick={() => setHint(null)}
              className="p-1 rounded-lg hover:bg-amber-900/50 text-amber-400/70 hover:text-amber-200 transition-colors cursor-pointer"
              title="إخفاء التلميح"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 8x8 Chessboard */}
      <Board
        board={board}
        turn={turn}
        selected={selectedSquare}
        selectedMoves={legalTargetSquares}
        lastMove={lastExecutedMove}
        hint={hint}
        boardFlipped={boardFlipped}
        showCoordinates={settings.showCoordinates}
        isThinking={isAiThinking}
        isInteractable={isInteractable}
        onSquareClick={handleSquareClick}
      />

      {/* Bottom Player Clock Card */}
      <ClockCard
        side={bottomSide}
        name={
          gameMode === 'computer'
            ? bottomSide === playerSide
              ? 'أنت'
              : 'الحاسوب'
            : bottomSide === 'white'
              ? 'اللاعب الأبيض'
              : 'اللاعب الأسود'
        }
        isAi={gameMode === 'computer' && bottomSide !== playerSide}
        isActive={turn === bottomSide && status === 'playing'}
        secondsRemaining={bottomSide === 'white' ? whiteClock : blackClock}
        timerEnabled={settings.timerEnabled}
        isInCheck={isInCheck(board, bottomSide)}
        isThinking={isAiThinking && turn === bottomSide}
        capturedPieces={capturedPieces[bottomSide === 'white' ? 'black' : 'white']}
        advantageScore={materialAdvantage[bottomSide]}
      />

      {/* Bottom Actions: Quick Undo, Resign, Draw, Move History */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Quick Undo button right under the board */}
          <button
            type="button"
            disabled={!canUndo && undosRemaining > 0}
            onClick={canUndo ? handleUndo : () => setRewardModalState('undos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              canUndo
                ? 'bg-stone-900 border-stone-800 hover:border-amber-500/50 hover:bg-stone-800 text-stone-200 hover:text-amber-300'
                : undosRemaining <= 0
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 hover:bg-amber-900/60'
                : 'bg-stone-950/60 border-stone-900 text-stone-600 opacity-40 cursor-not-allowed'
            }`}
            title={
              canUndo
                ? `تراجع عن النقلة السابقة (متبقي ${undosRemaining})`
                : undosRemaining <= 0
                ? 'مشاهدة إعلان لتجديد التراجع'
                : 'لا يمكن التراجع حالياً'
            }
          >
            <Undo2 className="w-3.5 h-3.5 text-amber-400" />
            <span>تراجع ({undosRemaining > 0 ? undosRemaining : '+إعلان'})</span>
          </button>

          <button
            type="button"
            disabled={status !== 'playing' || isAiThinking}
            onClick={handleResign}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-red-500/50 hover:bg-red-950/30 text-stone-400 hover:text-red-300 text-xs font-semibold transition-all disabled:opacity-30 cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>استسلام</span>
          </button>

          {gameMode === 'local' && (
            <button
              type="button"
              disabled={status !== 'playing'}
              onClick={handleAgreeDraw}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500/50 hover:bg-amber-950/30 text-stone-400 hover:text-amber-300 text-xs font-semibold transition-all disabled:opacity-30 cursor-pointer"
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>طلب تعادل</span>
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Move History */}
      <MoveHistory
        history={history}
        isOpen={isHistoryOpen}
        onToggle={() => setIsHistoryOpen((prev) => !prev)}
      />

      {/* Rewarded Ad Modal */}
      {rewardModalState && (
        <RewardedAdModal
          rewardType={rewardModalState}
          onReward={handleReward}
          onClose={() => setRewardModalState(null)}
        />
      )}

      {/* Promotion Modal */}
      {pendingPromotion && (
        <PromotionModal
          side={turn}
          onSelect={handleSelectPromotion}
        />
      )}

      {/* Game Over Modal */}
      {status !== 'playing' && (
        <GameOverModal
          status={status}
          turn={turn}
          playerSide={playerSide}
          gameMode={gameMode}
          onNewGame={handleNewGame}
          onHome={onBackToHome}
        />
      )}
    </div>
  );
};
