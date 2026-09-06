import React from 'react';
import { Piece, Position } from '../types/chess';
import { ChessPiece } from './ChessPieces';

interface SquareProps {
  position: Position;
  piece: Piece | null;
  isDark: boolean;
  isSelected: boolean;
  isLegalTarget: boolean;
  isLastMove: boolean;
  isHint?: boolean;
  isHintFrom?: boolean;
  isHintTo?: boolean;
  isInCheckKing: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const Square: React.FC<SquareProps> = React.memo(
  ({
    position,
    piece,
    isDark,
    isSelected,
    isLegalTarget,
    isLastMove,
    isHint,
    isHintFrom,
    isHintTo,
    isInCheckKing,
    onClick,
    disabled,
  }) => {
    // Elegant wooden board palette: warm beige / walnut brown
    let bgColor = isDark ? 'bg-[#B58863]' : 'bg-[#F0D9B5]';

    if (isSelected) {
      bgColor = 'bg-[#BACB44]'; // Lichess-style clear lime highlight
    } else if (isHintFrom) {
      // Origin square of the recommended hint move
      bgColor = isDark ? 'bg-amber-600/70' : 'bg-amber-300/80';
    } else if (isHintTo) {
      // Destination square of the recommended hint move
      bgColor = isDark ? 'bg-emerald-600/70' : 'bg-emerald-300/80';
    } else if (isHint) {
      bgColor = 'bg-[#67B7D1]';
    } else if (isLastMove) {
      bgColor = isDark ? 'bg-[#AAA23A]' : 'bg-[#CDD26A]';
    }

    const hintRingClass = isHintFrom
      ? 'ring-4 ring-inset ring-amber-400 animate-pulse'
      : isHintTo
      ? 'ring-4 ring-inset ring-emerald-400'
      : '';

    return (
      <button
        type="button"
        id={`square-${position.row}-${position.col}`}
        disabled={disabled}
        onClick={onClick}
        aria-label={`${piece ? `${piece.side} ${piece.kind}` : 'مربع فارغ'} في ${position.row},${position.col}`}
        className={`relative aspect-square w-full h-full flex items-center justify-center select-none transition-colors duration-150 focus:outline-none ${bgColor} ${hintRingClass} ${
          isInCheckKing ? 'ring-4 ring-inset ring-red-500 animate-pulse' : ''
        } ${!disabled ? 'cursor-pointer' : 'cursor-default'}`}
      >
        {/* Piece */}
        {piece && (
          <div className="w-[82%] h-[82%] transition-transform duration-100 transform active:scale-95 drop-shadow-md flex items-center justify-center">
            <ChessPiece kind={piece.kind} side={piece.side} />
          </div>
        )}

        {/* Hint Destination Beacon Indicator */}
        {isHintTo && !piece && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-5 h-5 rounded-full border-2 border-emerald-600/70 bg-emerald-400/40 animate-ping opacity-75" />
            <div className="absolute w-3 h-3 rounded-full bg-emerald-600 shadow-md" />
          </div>
        )}

        {/* Legal Move Indicator */}
        {isLegalTarget && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {piece ? (
              // Capture indicator: outer ring
              <div className="w-full h-full border-4 border-black/25 rounded-full scale-[0.88]" />
            ) : (
              // Normal move: centered dot
              <div className="w-3.5 h-3.5 rounded-full bg-black/25 shadow-sm" />
            )}
          </div>
        )}
      </button>
    );
  },
);
