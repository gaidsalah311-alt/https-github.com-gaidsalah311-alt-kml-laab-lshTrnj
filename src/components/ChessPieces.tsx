import React from 'react';
import { PieceKind, Side } from '../types/chess';

interface PieceProps {
  kind: PieceKind;
  side: Side;
  className?: string;
}

export const ChessPiece: React.FC<PieceProps> = React.memo(({ kind, side, className = 'w-full h-full' }) => {
  const isWhite = side === 'white';
  const fill = isWhite ? '#FFFFFF' : '#1C1917';
  const stroke = isWhite ? '#292524' : '#E7E5E4';
  const highlight = isWhite ? '#F5F5F4' : '#44403C';

  switch (kind) {
    case 'pawn':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {isWhite && (
            <path
              d="M22.5 10.5c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z"
              fill={highlight}
            />
          )}
        </svg>
      );

    case 'knight':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22 10c-3 0-5 2.5-5 5 0 1.5.5 3 1.5 4-2.5 1-6 4-6 9 0 2 .5 4 1.5 5.5-1 1.5-2 3.5-2 6.5h23c0-5-2-9-5-12-1-1-2-2.5-2-4.5 0-2.5 2-4.5 2-6.5 0-4-3-6.5-7-6.5z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M14.5 25c1.5-1 3-1 4.5 0"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="17.5" cy="18.5" r="1.5" fill={stroke} />
          <path
            d="M23 13.5c1.5 1 2.5 3 2.5 5"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'bishop':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
          <path
            d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
          <circle cx="22.5" cy="8.5" r="2.5" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <path d="M20 18h5M22.5 15.5v5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M17.5 26c2.5 2 7.5 2 10 0" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'rook':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 39h27v-3H9v3zm3-3v-4.5h21V36H12zm2.5-4.5l1.5-13.5h13l1.5 13.5h-16zm-2.5-15V9h4v3.5h4.5V9h5v3.5h4.5V9h4v4.5h-22z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M14 16.5h17M13 31.5h19" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );

    case 'queen':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 38h27v-3H9v3zm2.5-4.5l2-16 6 8.5 3-14 3 14 6-8.5 2 16h-22zm-2.5 5.5h27v-1H9v1z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="16" r="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <circle cx="15.5" cy="10" r="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <circle cx="22.5" cy="7.5" r="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <circle cx="29.5" cy="10" r="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <circle cx="36" cy="16" r="2" fill={fill} stroke={stroke} strokeWidth="1.5" />
          <path d="M12 33.5h21" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );

    case 'king':
      return (
        <svg viewBox="0 0 45 45" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22.5 11.63V6M20 8h5"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
          <path
            d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-2s9-4.5 6-10.5c-4-1-6 2.5-6 2.5s-.5-1.5-2-2.5c-3-2-4-1-4-1s-1.5-3-4-3-4 3-4 3-1-1-4 1c-1.5 1-2 2.5-2 2.5s-2-3.5-6-2.5c-3 6 6 10.5 6 10.5v2z"
            fill={fill}
            stroke={stroke}
            strokeWidth="1.5"
          />
          <path d="M11.5 30c5.5-2 16.5-2 22 0M11.5 33.5c5.5-2 16.5-2 22 0" stroke={stroke} strokeWidth="1.2" />
        </svg>
      );
  }
});
