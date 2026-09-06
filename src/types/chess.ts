export type Side = 'white' | 'black';

export type PieceKind = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

export type Piece = {
  side: Side;
  kind: PieceKind;
};

export type Square = Piece | null;

export type Board = Square[][];

export type Position = {
  row: number;
  col: number;
};

export type GameMode = 'local' | 'computer';

export type DifficultyId = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

export type PromotionKind = 'queen' | 'rook' | 'bishop' | 'knight';

export type MoveSpecial = 'normal' | 'castle' | 'enPassant';

export type CastlingRights = {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
};

export type Move = {
  from: Position;
  to: Position;
  piece: Piece;
  captured: Piece | null;
  special: MoveSpecial;
  promotion?: PromotionKind;
  san?: string;
};

export type GameSettings = {
  timerEnabled: boolean;
  timerMinutes: number;
  showCoordinates: boolean;
  aiDifficulty: DifficultyId;
  soundEnabled: boolean;
  playerSide: 'white' | 'black' | 'random';
};

export type GameStats = {
  games: number;
  wins: number;
  losses: number;
  draws: number;
};

export type GameStatus =
  | 'playing'
  | 'checkmate'
  | 'stalemate'
  | 'timeout'
  | 'drawInsufficientMaterial'
  | 'drawThreefold'
  | 'drawFiftyMove'
  | 'resigned'
  | 'agreedDraw';

export type DifficultyConfig = {
  id: DifficultyId;
  label: string;
  description: string;
  depth: number;
  skill: number;
};
