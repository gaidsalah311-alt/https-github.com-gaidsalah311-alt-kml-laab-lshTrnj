import {
  Board,
  CastlingRights,
  GameStatus,
  Move,
  Piece,
  PieceKind,
  Position,
  PromotionKind,
  Side,
  Square,
} from '../../types/chess';

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export const INITIAL_CASTLING_RIGHTS: CastlingRights = {
  whiteKingSide: true,
  whiteQueenSide: true,
  blackKingSide: true,
  blackQueenSide: true,
};

export const PIECE_VALUES: Record<PieceKind, number> = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 1000,
};

export function createInitialBoard(): Board {
  const backRank: PieceKind[] = [
    'rook',
    'knight',
    'bishop',
    'queen',
    'king',
    'bishop',
    'knight',
    'rook',
  ];
  const board: Board = Array.from({ length: 8 }, () => Array<Square>(8).fill(null));

  for (let col = 0; col < 8; col += 1) {
    board[0][col] = { side: 'black', kind: backRank[col] };
    board[1][col] = { side: 'black', kind: 'pawn' };
    board[6][col] = { side: 'white', kind: 'pawn' };
    board[7][col] = { side: 'white', kind: backRank[col] };
  }

  return board;
}

export function copyBoard(board: Board): Board {
  return [
    board[0].slice(),
    board[1].slice(),
    board[2].slice(),
    board[3].slice(),
    board[4].slice(),
    board[5].slice(),
    board[6].slice(),
    board[7].slice(),
  ];
}

export function isInside(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

export function samePosition(a: Position | null, b: Position | null): boolean {
  if (!a || !b) return false;
  return a.row === b.row && a.col === b.col;
}

export function otherSide(side: Side): Side {
  return side === 'white' ? 'black' : 'white';
}

export function copyCastlingRights(rights: CastlingRights): CastlingRights {
  return { ...rights };
}

export function updateCastlingRights(
  rights: CastlingRights,
  piece: Piece,
  from: Position,
  to: Position,
  captured: Piece | null,
): CastlingRights {
  const next = copyCastlingRights(rights);
  if (piece.kind === 'king') {
    if (piece.side === 'white') {
      next.whiteKingSide = false;
      next.whiteQueenSide = false;
    } else {
      next.blackKingSide = false;
      next.blackQueenSide = false;
    }
  }
  if (piece.kind === 'rook') {
    if (piece.side === 'white' && from.row === 7 && from.col === 0) next.whiteQueenSide = false;
    if (piece.side === 'white' && from.row === 7 && from.col === 7) next.whiteKingSide = false;
    if (piece.side === 'black' && from.row === 0 && from.col === 0) next.blackQueenSide = false;
    if (piece.side === 'black' && from.row === 0 && from.col === 7) next.blackKingSide = false;
  }
  if (captured?.kind === 'rook') {
    if (captured.side === 'white' && to.row === 7 && to.col === 0) next.whiteQueenSide = false;
    if (captured.side === 'white' && to.row === 7 && to.col === 7) next.whiteKingSide = false;
    if (captured.side === 'black' && to.row === 0 && to.col === 0) next.blackQueenSide = false;
    if (captured.side === 'black' && to.row === 0 && to.col === 7) next.blackKingSide = false;
  }
  return next;
}

export function deriveCastlingRights(history: Move[]): CastlingRights {
  return history.reduce(
    (rights, move) => updateCastlingRights(rights, move.piece, move.from, move.to, move.captured),
    copyCastlingRights(INITIAL_CASTLING_RIGHTS),
  );
}

export function findKing(board: Board, side: Side): Position | null {
  const startRow = side === 'white' ? 7 : 0;
  const endRow = side === 'white' ? -1 : 8;
  const step = side === 'white' ? -1 : 1;

  for (let row = startRow; row !== endRow; row += step) {
    const r = board[row];
    for (let col = 0; col < 8; col += 1) {
      const piece = r[col];
      if (piece && piece.kind === 'king' && piece.side === side) {
        return { row, col };
      }
    }
  }
  return null;
}

function slideMoves(
  board: Board,
  from: Position,
  directions: Position[],
  attackOnly = false,
): Position[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];
  const moves: Position[] = [];

  for (const direction of directions) {
    let row = from.row + direction.row;
    let col = from.col + direction.col;
    while (isInside(row, col)) {
      const target = board[row][col];
      if (!target) {
        if (!attackOnly) moves.push({ row, col });
      } else {
        if (target.side !== piece.side || attackOnly) {
          moves.push({ row, col });
        }
        break;
      }
      row += direction.row;
      col += direction.col;
    }
  }

  return moves;
}

export function pseudoMoves(
  board: Board,
  from: Position,
  attackOnly = false,
  castlingRights: CastlingRights = INITIAL_CASTLING_RIGHTS,
  enPassantTarget: Position | null = null,
): Position[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];
  const moves: Position[] = [];

  if (piece.kind === 'pawn') {
    const direction = piece.side === 'white' ? -1 : 1;
    const startRow = piece.side === 'white' ? 6 : 1;

    if (!attackOnly) {
      const oneStepRow = from.row + direction;
      if (isInside(oneStepRow, from.col) && !board[oneStepRow][from.col]) {
        moves.push({ row: oneStepRow, col: from.col });
        const twoStepsRow = from.row + direction * 2;
        if (from.row === startRow && !board[twoStepsRow][from.col]) {
          moves.push({ row: twoStepsRow, col: from.col });
        }
      }
    }

    [-1, 1].forEach((dc) => {
      const targetCol = from.col + dc;
      const targetRow = from.row + direction;
      if (isInside(targetRow, targetCol)) {
        const target = board[targetRow][targetCol];
        if (target && (target.side !== piece.side || attackOnly)) {
          moves.push({ row: targetRow, col: targetCol });
        } else if (
          !attackOnly &&
          enPassantTarget &&
          samePosition({ row: targetRow, col: targetCol }, enPassantTarget)
        ) {
          moves.push({ row: targetRow, col: targetCol });
        }
      }
    });
  }

  if (piece.kind === 'knight') {
    const jumps: Position[] = [
      { row: -2, col: -1 },
      { row: -2, col: 1 },
      { row: -1, col: -2 },
      { row: -1, col: 2 },
      { row: 1, col: -2 },
      { row: 1, col: 2 },
      { row: 2, col: -1 },
      { row: 2, col: 1 },
    ];
    jumps.forEach((j) => {
      const row = from.row + j.row;
      const col = from.col + j.col;
      if (isInside(row, col)) {
        const target = board[row][col];
        if (!target || target.side !== piece.side || attackOnly) {
          moves.push({ row, col });
        }
      }
    });
  }

  if (piece.kind === 'bishop' || piece.kind === 'queen') {
    const diagonals: Position[] = [
      { row: -1, col: -1 },
      { row: -1, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 1 },
    ];
    moves.push(...slideMoves(board, from, diagonals, attackOnly));
  }

  if (piece.kind === 'rook' || piece.kind === 'queen') {
    const straights: Position[] = [
      { row: -1, col: 0 },
      { row: 1, col: 0 },
      { row: 0, col: -1 },
      { row: 0, col: 1 },
    ];
    moves.push(...slideMoves(board, from, straights, attackOnly));
  }

  if (piece.kind === 'king') {
    for (let dr = -1; dr <= 1; dr += 1) {
      for (let dc = -1; dc <= 1; dc += 1) {
        if (dr === 0 && dc === 0) continue;
        const row = from.row + dr;
        const col = from.col + dc;
        if (isInside(row, col)) {
          const target = board[row][col];
          if (!target || target.side !== piece.side || attackOnly) {
            moves.push({ row, col });
          }
        }
      }
    }

    if (!attackOnly) {
      const homeRow = piece.side === 'white' ? 7 : 0;
      const kingSideAllowed =
        piece.side === 'white' ? castlingRights.whiteKingSide : castlingRights.blackKingSide;
      const queenSideAllowed =
        piece.side === 'white' ? castlingRights.whiteQueenSide : castlingRights.blackQueenSide;
      const opponent = otherSide(piece.side);

      if (from.row === homeRow && from.col === 4 && !isSquareAttacked(board, from, opponent)) {
        const kingSideRook = board[homeRow][7];
        if (
          kingSideAllowed &&
          kingSideRook?.side === piece.side &&
          kingSideRook.kind === 'rook' &&
          !board[homeRow][5] &&
          !board[homeRow][6] &&
          !isSquareAttacked(board, { row: homeRow, col: 5 }, opponent) &&
          !isSquareAttacked(board, { row: homeRow, col: 6 }, opponent)
        ) {
          moves.push({ row: homeRow, col: 6 });
        }

        const queenSideRook = board[homeRow][0];
        if (
          queenSideAllowed &&
          queenSideRook?.side === piece.side &&
          queenSideRook.kind === 'rook' &&
          !board[homeRow][1] &&
          !board[homeRow][2] &&
          !board[homeRow][3] &&
          !isSquareAttacked(board, { row: homeRow, col: 3 }, opponent) &&
          !isSquareAttacked(board, { row: homeRow, col: 2 }, opponent)
        ) {
          moves.push({ row: homeRow, col: 2 });
        }
      }
    }
  }

  return moves;
}

export function isSquareAttacked(board: Board, square: Position, bySide: Side): boolean {
  const r = square.row;
  const c = square.col;

  // 1. Pawns: check the two squares where an opponent pawn could attack (r, c)
  const pawnRow = bySide === 'white' ? r + 1 : r - 1;
  if (pawnRow >= 0 && pawnRow < 8) {
    if (c > 0) {
      const p = board[pawnRow][c - 1];
      if (p && p.side === bySide && p.kind === 'pawn') return true;
    }
    if (c < 7) {
      const p = board[pawnRow][c + 1];
      if (p && p.side === bySide && p.kind === 'pawn') return true;
    }
  }

  // 2. Knights (8 jumps)
  const knightDeltas = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];
  for (let i = 0; i < 8; i += 1) {
    const nr = r + knightDeltas[i][0];
    const nc = c + knightDeltas[i][1];
    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[nr][nc];
      if (p && p.side === bySide && p.kind === 'knight') return true;
    }
  }

  // 3. Kings (8 adjacent squares)
  for (let dr = -1; dr <= 1; dr += 1) {
    for (let dc = -1; dc <= 1; dc += 1) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        const p = board[nr][nc];
        if (p && p.side === bySide && p.kind === 'king') return true;
      }
    }
  }

  // 4. Diagonals (Bishop & Queen)
  const diagDeltas = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  for (let i = 0; i < 4; i += 1) {
    let nr = r + diagDeltas[i][0];
    let nc = c + diagDeltas[i][1];
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[nr][nc];
      if (p) {
        if (p.side === bySide && (p.kind === 'bishop' || p.kind === 'queen')) return true;
        break;
      }
      nr += diagDeltas[i][0];
      nc += diagDeltas[i][1];
    }
  }

  // 5. Orthogonals (Rook & Queen)
  const orthoDeltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (let i = 0; i < 4; i += 1) {
    let nr = r + orthoDeltas[i][0];
    let nc = c + orthoDeltas[i][1];
    while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
      const p = board[nr][nc];
      if (p) {
        if (p.side === bySide && (p.kind === 'rook' || p.kind === 'queen')) return true;
        break;
      }
      nr += orthoDeltas[i][0];
      nc += orthoDeltas[i][1];
    }
  }

  return false;
}

export function isInCheck(board: Board, side: Side): boolean {
  const king = findKing(board, side);
  return king ? isSquareAttacked(board, king, otherSide(side)) : true;
}

export function applyMove(
  board: Board,
  from: Position,
  to: Position,
  promotion: PromotionKind = 'queen',
  enPassantTarget: Position | null = null,
): Board {
  const next = copyBoard(board);
  const piece = next[from.row][from.col];
  if (!piece) return next;

  const direction = piece.side === 'white' ? -1 : 1;
  if (
    piece.kind === 'pawn' &&
    enPassantTarget &&
    samePosition(to, enPassantTarget) &&
    !board[to.row][to.col]
  ) {
    next[to.row - direction][to.col] = null;
  }

  next[to.row][to.col] = piece;
  next[from.row][from.col] = null;

  if (piece.kind === 'king' && Math.abs(to.col - from.col) === 2) {
    const rookFromCol = to.col > from.col ? 7 : 0;
    const rookToCol = to.col > from.col ? 5 : 3;
    next[to.row][rookToCol] = next[to.row][rookFromCol];
    next[to.row][rookFromCol] = null;
  }

  if (piece.kind === 'pawn' && (to.row === 0 || to.row === 7)) {
    next[to.row][to.col] = { side: piece.side, kind: promotion };
  }

  return next;
}

export function legalMoves(
  board: Board,
  from: Position,
  castlingRights: CastlingRights = INITIAL_CASTLING_RIGHTS,
  enPassantTarget: Position | null = null,
): Position[] {
  const piece = board[from.row][from.col];
  if (!piece) return [];
  return pseudoMoves(board, from, false, castlingRights, enPassantTarget).filter((to) => {
    const target = board[to.row][to.col];
    if (target?.kind === 'king') return false;
    return !isInCheck(applyMove(board, from, to, 'queen', enPassantTarget), piece.side);
  });
}

export function allLegalMoves(
  board: Board,
  side: Side,
  castlingRights: CastlingRights = INITIAL_CASTLING_RIGHTS,
  enPassantTarget: Position | null = null,
): { from: Position; to: Position }[] {
  const moves: { from: Position; to: Position }[] = [];
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      if (board[row][col]?.side === side) {
        legalMoves(board, { row, col }, castlingRights, enPassantTarget).forEach((to) =>
          moves.push({ from: { row, col }, to }),
        );
      }
    }
  }
  return moves;
}

export function squareToUci(position: Position): string {
  return `${FILES[position.col]}${8 - position.row}`;
}

export function moveToUci(move: Move): string {
  const promotion = move.promotion
    ? move.promotion === 'knight'
      ? 'n'
      : move.promotion[0]
    : move.piece.kind === 'pawn' && (move.to.row === 0 || move.to.row === 7)
      ? 'q'
      : '';
  return `${squareToUci(move.from)}${squareToUci(move.to)}${promotion}`;
}

export function parseUciMove(
  uci: string,
): { from: Position; to: Position; promotion?: PromotionKind } | null {
  const match = uci.trim().match(/^([a-h])([1-8])([a-h])([1-8])(?:[qrbn])?$/);
  if (!match) return null;
  const from = { row: 8 - Number(match[2]), col: FILES.indexOf(match[1]) };
  const to = { row: 8 - Number(match[4]), col: FILES.indexOf(match[3]) };
  const promotionLetter = uci.trim().slice(4).toLowerCase();
  const promotion = promotionLetter
    ? ({ q: 'queen', r: 'rook', b: 'bishop', n: 'knight' } as const)[promotionLetter]
    : undefined;
  return from.col >= 0 && to.col >= 0 ? { from, to, promotion } : null;
}

export function isInsufficientMaterial(board: Board): boolean {
  const pieces = board
    .flat()
    .filter((piece): piece is Piece => piece !== null && piece.kind !== 'king');

  // Bare kings
  if (pieces.length === 0) return true;

  // Major pieces or pawns present can force mate
  if (pieces.some((p) => p.kind === 'pawn' || p.kind === 'rook' || p.kind === 'queen')) {
    return false;
  }

  // King + minor vs bare King
  if (pieces.length === 1) {
    return pieces[0].kind === 'bishop' || pieces[0].kind === 'knight';
  }

  // Two bishops on same color
  if (pieces.length === 2 && pieces.every((p) => p.kind === 'bishop')) {
    const bishopColors: number[] = [];
    board.forEach((row, r) => {
      row.forEach((p, c) => {
        if (p?.kind === 'bishop') bishopColors.push((r + c) % 2);
      });
    });
    return bishopColors.length === 2 && bishopColors[0] === bishopColors[1];
  }

  // King + 2 Knights vs bare King cannot force mate
  if (
    pieces.length === 2 &&
    pieces.every((p) => p.kind === 'knight') &&
    pieces[0].side === pieces[1].side
  ) {
    return true;
  }

  return false;
}

export function positionKey(
  board: Board,
  turn: Side,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null,
): string {
  const boardKey = board
    .map((row) => row.map((p) => (p ? `${p.side[0]}${p.kind[0]}` : '--')).join(''))
    .join('/');
  const rightsKey =
    [
      castlingRights.whiteKingSide ? 'K' : '',
      castlingRights.whiteQueenSide ? 'Q' : '',
      castlingRights.blackKingSide ? 'k' : '',
      castlingRights.blackQueenSide ? 'q' : '',
    ].join('') || '-';
  // FEN/repetition rules include the en-passant square only when a capture
  // is actually available to the side to move.
  let repetitionEnPassant: Position | null = null;
  if (enPassantTarget) {
    const direction = turn === 'white' ? -1 : 1;
    const pawnRow = enPassantTarget.row - direction;
    if (isInside(pawnRow, enPassantTarget.col)) {
      for (const pawnCol of [enPassantTarget.col - 1, enPassantTarget.col + 1]) {
        if (
          isInside(pawnRow, pawnCol) &&
          board[pawnRow][pawnCol]?.side === turn &&
          board[pawnRow][pawnCol]?.kind === 'pawn'
        ) {
          repetitionEnPassant = enPassantTarget;
          break;
        }
      }
    }
  }
  return `${boardKey} ${turn[0]} ${rightsKey} ${repetitionEnPassant ? squareToUci(repetitionEnPassant) : '-'}`;
}

export function pieceSanLetter(kind: PieceKind): string {
  return kind === 'knight'
    ? 'N'
    : kind === 'bishop'
      ? 'B'
      : kind === 'rook'
        ? 'R'
        : kind === 'queen'
          ? 'Q'
          : kind === 'king'
            ? 'K'
            : '';
}

export function formatSan(
  move: Move,
  board: Board,
  castlingRights: CastlingRights,
  enPassantTarget: Position | null,
  nextBoard: Board,
  nextTurn: Side,
  nextMoves: { from: Position; to: Position }[],
): string {
  if (move.special === 'castle') {
    const notation = move.to.col > move.from.col ? 'O-O' : 'O-O-O';
    if (nextMoves.length === 0 && isInCheck(nextBoard, nextTurn)) return `${notation}#`;
    if (isInCheck(nextBoard, nextTurn)) return `${notation}+`;
    return notation;
  }
  const capture = Boolean(move.captured) || move.special === 'enPassant';
  let notation = pieceSanLetter(move.piece.kind);

  if (move.piece.kind === 'pawn' && capture) {
    notation += FILES[move.from.col];
  }

  if (move.piece.kind !== 'pawn') {
    const alternatives = allLegalMoves(board, move.piece.side, castlingRights, enPassantTarget)
      .filter((candidate) => samePosition(candidate.to, move.to) && !samePosition(candidate.from, move.from))
      .filter((candidate) => board[candidate.from.row][candidate.from.col]?.kind === move.piece.kind);

    if (alternatives.length > 0) {
      const sameFile = alternatives.some((c) => c.from.col === move.from.col);
      const sameRank = alternatives.some((c) => c.from.row === move.from.row);
      notation +=
        sameFile && sameRank
          ? `${FILES[move.from.col]}${8 - move.from.row}`
          : sameFile
            ? `${8 - move.from.row}`
            : FILES[move.from.col];
    }
  }

  if (capture) notation += 'x';
  notation += squareToUci(move.to);
  if (move.promotion) notation += `=${pieceSanLetter(move.promotion)}`;
  if (nextMoves.length === 0 && isInCheck(nextBoard, nextTurn)) notation += '#';
  else if (isInCheck(nextBoard, nextTurn)) notation += '+';
  return notation;
}
