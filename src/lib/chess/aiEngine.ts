import {
  allLegalMoves,
  applyMove,
  isInCheck,
  otherSide,
  PIECE_VALUES,
  samePosition,
  updateCastlingRights,
} from './chessRules';
import {
  Board,
  CastlingRights,
  DifficultyId,
  Move,
  Piece,
  Position,
  PromotionKind,
  Side,
} from '../../types/chess';

// Piece-Square Tables (from White's perspective; inverted for Black)
const PAWN_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_PST = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const BISHOP_PST = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const ROOK_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
];

const QUEEN_PST = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const KING_MIDGAME_PST = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -20, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

function getPstScore(piece: Piece, row: number, col: number): number {
  const r = piece.side === 'white' ? row : 7 - row;
  const c = col;
  switch (piece.kind) {
    case 'pawn':
      return PAWN_PST[r][c];
    case 'knight':
      return KNIGHT_PST[r][c];
    case 'bishop':
      return BISHOP_PST[r][c];
    case 'rook':
      return ROOK_PST[r][c];
    case 'queen':
      return QUEEN_PST[r][c];
    case 'king':
      return KING_MIDGAME_PST[r][c];
    default:
      return 0;
  }
}

export function evaluateBoard(board: Board, aiSide: Side): number {
  let score = 0;
  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      const piece = board[r][c];
      if (!piece) continue;
      const pieceVal = PIECE_VALUES[piece.kind] * 100;
      const positionalVal = getPstScore(piece, r, c);
      const total = pieceVal + positionalVal;
      if (piece.side === aiSide) {
        score += total;
      } else {
        score -= total;
      }
    }
  }
  return score;
}

export type CandidateMove = {
  from: Position;
  to: Position;
  promotion?: PromotionKind;
};

function sameCandidate(a: CandidateMove, b: CandidateMove): boolean {
  return a.from.row === b.from.row && a.from.col === b.from.col &&
         a.to.row === b.to.row && a.to.col === b.to.col &&
         a.promotion === b.promotion;
}

// Notation helper for opening book
function posToSq(pos: Position): string {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  return `${files[pos.col]}${8 - pos.row}`;
}

function sqToPos(sq: string): Position {
  const col = sq.charCodeAt(0) - 97;
  const row = 8 - parseInt(sq[1], 10);
  return { row, col };
}

function moveKey(from: Position, to: Position): string {
  return `${posToSq(from)}${posToSq(to)}`;
}

// Master Opening Book for instantaneous, classical openings
const OPENING_BOOK: Record<string, string[]> = {
  // Move 1 White
  '': ['e2e4', 'd2d4', 'g1f3', 'c2c4'],
  // 1. e4 responses (Black)
  'e2e4': ['e7e5', 'c7c5', 'e7e6', 'c7c6'],
  // 1. d4 responses (Black)
  'd2d4': ['d7d5', 'g8f6', 'e7e6'],
  // 1. c4 responses (Black)
  'c2c4': ['e7e5', 'c7c5', 'g8f6'],
  // 1. Nf3 responses (Black)
  'g1f3': ['d7d5', 'g8f6'],

  // 1. e4 e5 (White move 2)
  'e2e4 e7e5': ['g1f3', 'f1c4', 'b1c3'],
  // 1. e4 e5 2. Nf3 (Black move 2)
  'e2e4 e7e5 g1f3': ['b8c6', 'g8f6'],
  // 1. e4 e5 2. Nf3 Nc6 (White move 3)
  'e2e4 e7e5 g1f3 b8c6': ['f1c4', 'f1b5', 'd2d4'],
  // 1. e4 e5 2. Nf3 Nc6 3. Bc4 (Italian Game: Black move 3)
  'e2e4 e7e5 g1f3 b8c6 f1c4': ['f8c5', 'g8f6'],
  // 1. e4 e5 2. Nf3 Nc6 3. Bb5 (Ruy Lopez: Black move 3)
  'e2e4 e7e5 g1f3 b8c6 f1b5': ['a7a6', 'g8f6'],

  // 1. e4 c5 (Sicilian: White move 2)
  'e2e4 c7c5': ['g1f3', 'b1c3', 'c2c3'],
  // 1. e4 c5 2. Nf3 (Black move 2)
  'e2e4 c7c5 g1f3': ['d7d6', 'b8c6', 'e7e6'],
  // 1. e4 c5 2. Nf3 d6 (White move 3)
  'e2e4 c7c5 g1f3 d7d6': ['d2d4'],

  // 1. d4 d5 (White move 2)
  'd2d4 d7d5': ['c2c4', 'g1f3', 'c1f4'],
  // 1. d4 d5 2. c4 (Queen\'s Gambit: Black move 2)
  'd2d4 d7d5 c2c4': ['e7e6', 'c7c6', 'd5c4'],
  // 1. d4 d5 2. c4 e6 (White move 3)
  'd2d4 d7d5 c2c4 e7e6': ['b1c3', 'g1f3'],

  // 1. d4 Nf6 (White move 2)
  'd2d4 g8f6': ['c2c4', 'g1f3', 'c1f4'],
  // 1. d4 Nf6 2. c4 (Black move 2)
  'd2d4 g8f6 c2c4': ['e7e6', 'g7g6', 'c7c5'],
};

// Fast board hash for transposition cache
function boardFastKey(board: Board, turn: Side, rights: CastlingRights): string {
  let key = turn === 'white' ? 'w' : 'b';
  if (rights.whiteKingSide) key += 'K';
  if (rights.whiteQueenSide) key += 'Q';
  if (rights.blackKingSide) key += 'k';
  if (rights.blackQueenSide) key += 'q';
  key += '|';

  for (let r = 0; r < 8; r += 1) {
    const row = board[r];
    for (let c = 0; c < 8; c += 1) {
      const p = row[c];
      if (p) {
        key += `${p.side[0]}${p.kind[0]}${r}${c}`;
      }
    }
  }
  return key;
}

type TTEntry = {
  depth: number;
  score: number;
  flag: 'exact' | 'lower' | 'upper';
  bestMove?: CandidateMove;
};

function scoreMoveForOrdering(
  board: Board,
  move: CandidateMove,
  enPassantTarget: Position | null,
): number {
  const piece = board[move.from.row][move.from.col];
  if (!piece) return 0;
  const captured = board[move.to.row][move.to.col];
  let score = 0;

  if (captured) {
    // MVV-LVA: Most Valuable Victim - Least Valuable Attacker
    score += PIECE_VALUES[captured.kind] * 10 - PIECE_VALUES[piece.kind] + 1000;
  } else if (
    piece.kind === 'pawn' &&
    enPassantTarget &&
    samePosition(move.to, enPassantTarget)
  ) {
    score += 1000;
  }

  if (move.promotion) {
    score += PIECE_VALUES[move.promotion] * 100;
  }

  // Slight bonus for central control
  const centerDist = Math.abs(3.5 - move.to.row) + Math.abs(3.5 - move.to.col);
  score += (7 - centerDist) * 3;

  return score;
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  turn: Side,
  aiSide: Side,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null,
  tt: Map<string, TTEntry>,
  deadline: number,
): number {
  // Leaf check: evaluate immediately
  if (depth <= 0) {
    return evaluateBoard(board, aiSide);
  }

  // Time guard
  if (performance.now() >= deadline) {
    return evaluateBoard(board, aiSide);
  }

  // Transposition table lookup
  const key = boardFastKey(board, turn, castlingRights);
  const cached = tt.get(key);
  if (cached && cached.depth >= depth) {
    if (cached.flag === 'exact') return cached.score;
    if (cached.flag === 'lower' && cached.score >= beta) return cached.score;
    if (cached.flag === 'upper' && cached.score <= alpha) return cached.score;
  }

  const opponent = otherSide(turn);
  const legalList = allLegalMoves(board, turn, castlingRights, enPassantTarget);

  if (legalList.length === 0) {
    if (isInCheck(board, turn)) {
      return isMaximizing ? -100000 - depth : 100000 + depth;
    }
    return 0; // Stalemate
  }

  // Generate candidate moves
  const candidateMoves: CandidateMove[] = [];
  for (let i = 0; i < legalList.length; i += 1) {
    const m = legalList[i];
    const piece = board[m.from.row][m.from.col];
    if (piece?.kind === 'pawn' && (m.to.row === 0 || m.to.row === 7)) {
      candidateMoves.push({ ...m, promotion: 'queen' });
      candidateMoves.push({ ...m, promotion: 'knight' });
    } else {
      candidateMoves.push(m);
    }
  }

  // Move ordering: TT best move first, then MVV-LVA captures & promotions
  const ttBest = cached?.bestMove;
  candidateMoves.sort((a, b) => {
    if (ttBest) {
      if (sameCandidate(a, ttBest)) return -1;
      if (sameCandidate(b, ttBest)) return 1;
    }
    return (
      scoreMoveForOrdering(board, b, enPassantTarget) -
      scoreMoveForOrdering(board, a, enPassantTarget)
    );
  });

  const originalAlpha = alpha;
  let bestMoveAtNode: CandidateMove | undefined = undefined;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < candidateMoves.length; i += 1) {
      const move = candidateMoves[i];
      const captured = board[move.to.row][move.to.col];
      const movingPiece = board[move.from.row][move.from.col]!;
      const nextBoard = applyMove(board, move.from, move.to, move.promotion ?? 'queen', enPassantTarget);
      const nextRights = updateCastlingRights(castlingRights, movingPiece, move.from, move.to, captured);
      const nextEp =
        movingPiece.kind === 'pawn' && Math.abs(move.to.row - move.from.row) === 2
          ? { row: (move.to.row + move.from.row) / 2, col: move.from.col }
          : null;

      const evalScore = minimax(
        nextBoard,
        depth - 1,
        alpha,
        beta,
        false,
        opponent,
        aiSide,
        nextRights,
        nextEp,
        tt,
        deadline,
      );

      if (evalScore > maxEval) {
        maxEval = evalScore;
        bestMoveAtNode = move;
      }
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
      if (performance.now() >= deadline) break;
    }

    let flag: 'exact' | 'lower' | 'upper' = 'exact';
    if (maxEval <= originalAlpha) flag = 'upper';
    else if (maxEval >= beta) flag = 'lower';
    tt.set(key, { depth, score: maxEval, flag, bestMove: bestMoveAtNode });

    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < candidateMoves.length; i += 1) {
      const move = candidateMoves[i];
      const captured = board[move.to.row][move.to.col];
      const movingPiece = board[move.from.row][move.from.col]!;
      const nextBoard = applyMove(board, move.from, move.to, move.promotion ?? 'queen', enPassantTarget);
      const nextRights = updateCastlingRights(castlingRights, movingPiece, move.from, move.to, captured);
      const nextEp =
        movingPiece.kind === 'pawn' && Math.abs(move.to.row - move.from.row) === 2
          ? { row: (move.to.row + move.from.row) / 2, col: move.from.col }
          : null;

      const evalScore = minimax(
        nextBoard,
        depth - 1,
        alpha,
        beta,
        true,
        opponent,
        aiSide,
        nextRights,
        nextEp,
        tt,
        deadline,
      );

      if (evalScore < minEval) {
        minEval = evalScore;
        bestMoveAtNode = move;
      }
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
      if (performance.now() >= deadline) break;
    }

    let flag: 'exact' | 'lower' | 'upper' = 'exact';
    if (minEval >= beta) flag = 'lower';
    else if (minEval <= originalAlpha) flag = 'upper';
    tt.set(key, { depth, score: minEval, flag, bestMove: bestMoveAtNode });

    return minEval;
  }
}

export async function findBestAiMove(
  board: Board,
  aiSide: Side,
  difficulty: DifficultyId,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null,
  history: Move[] = [],
): Promise<CandidateMove | null> {
  const legalList = allLegalMoves(board, aiSide, castlingRights, enPassantTarget);
  if (legalList.length === 0) return null;

  const candidateMoves: CandidateMove[] = [];
  legalList.forEach((m) => {
    const piece = board[m.from.row][m.from.col];
    if (piece?.kind === 'pawn' && (m.to.row === 0 || m.to.row === 7)) {
      candidateMoves.push({ ...m, promotion: 'queen' });
      candidateMoves.push({ ...m, promotion: 'knight' });
    } else {
      candidateMoves.push(m);
    }
  });

  if (candidateMoves.length === 1) {
    return candidateMoves[0];
  }

  // 1. Instant Opening Book check (0ms delay)
  if (history && history.length <= 6) {
    const historyKey = history.map((h) => moveKey(h.from, h.to)).join(' ');
    const bookReplies = OPENING_BOOK[historyKey];
    if (bookReplies && bookReplies.length > 0) {
      // Pick randomly among standard theoretical moves
      const chosenStr = bookReplies[Math.floor(Math.random() * bookReplies.length)];
      const fromPos = sqToPos(chosenStr.slice(0, 2));
      const toPos = sqToPos(chosenStr.slice(2, 4));
      // Ensure move is legal
      const match = candidateMoves.find(
        (c) =>
          c.from.row === fromPos.row &&
          c.from.col === fromPos.col &&
          c.to.row === toPos.row &&
          c.to.col === toPos.col,
      );
      if (match) {
        return match;
      }
    }
  }

  // 2. Beginner: Fast human-like play
  if (difficulty === 'beginner') {
    // 35% chance to pick a random legal move
    if (Math.random() < 0.35) {
      return candidateMoves[Math.floor(Math.random() * candidateMoves.length)];
    }
  }

  // Target search depth and hard time budgets (in milliseconds)
  const depthConfig: Record<DifficultyId, { targetDepth: number; timeBudgetMs: number }> = {
    beginner: { targetDepth: 1, timeBudgetMs: 40 },
    easy: { targetDepth: 2, timeBudgetMs: 80 },
    medium: { targetDepth: 3, timeBudgetMs: 180 },
    hard: { targetDepth: 3, timeBudgetMs: 350 },
    expert: { targetDepth: 4, timeBudgetMs: 650 },
  };

  const { targetDepth, timeBudgetMs } = depthConfig[difficulty] ?? depthConfig.medium;
  const startTime = performance.now();
  const deadline = startTime + timeBudgetMs;
  const tt = new Map<string, TTEntry>();
  const opponent = otherSide(aiSide);

  // Initial sort of candidate moves
  candidateMoves.sort(
    (a, b) =>
      scoreMoveForOrdering(board, b, enPassantTarget) -
      scoreMoveForOrdering(board, a, enPassantTarget),
  );

  let overallBestMove: CandidateMove = candidateMoves[0];

  // Iterative Deepening from depth 1 to targetDepth
  for (let currentDepth = 1; currentDepth <= targetDepth; currentDepth += 1) {
    if (performance.now() >= deadline) break;

    let bestScoreAtDepth = -Infinity;
    let bestMoveAtDepth = overallBestMove;

    for (let i = 0; i < candidateMoves.length; i += 1) {
      const move = candidateMoves[i];
      const captured = board[move.to.row][move.to.col];
      const movingPiece = board[move.from.row][move.from.col]!;
      const nextBoard = applyMove(board, move.from, move.to, move.promotion ?? 'queen', enPassantTarget);
      const nextRights = updateCastlingRights(castlingRights, movingPiece, move.from, move.to, captured);
      const nextEp =
        movingPiece.kind === 'pawn' && Math.abs(move.to.row - move.from.row) === 2
          ? { row: (move.to.row + move.from.row) / 2, col: move.from.col }
          : null;

      let score = minimax(
        nextBoard,
        currentDepth - 1,
        -Infinity,
        Infinity,
        false,
        opponent,
        aiSide,
        nextRights,
        nextEp,
        tt,
        deadline,
      );

      // Add gentle randomness for beginner/easy to keep game varied
      if (difficulty === 'beginner') {
        score += (Math.random() - 0.5) * 50;
      } else if (difficulty === 'easy') {
        score += (Math.random() - 0.5) * 20;
      }

      if (score > bestScoreAtDepth) {
        bestScoreAtDepth = score;
        bestMoveAtDepth = move;
      }

      // Check deadline during iteration
      if (performance.now() >= deadline) break;
    }

    if (bestMoveAtDepth) {
      overallBestMove = bestMoveAtDepth;
    }

    // Sort candidate moves so that best move is evaluated first in the next depth
    candidateMoves.sort((a, b) => {
      if (sameCandidate(a, overallBestMove)) return -1;
      if (sameCandidate(b, overallBestMove)) return 1;
      return 0;
    });
  }

  return overallBestMove;
}
