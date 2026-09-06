import React from 'react';
import { Bot, User, Clock, AlertTriangle } from 'lucide-react';
import { Piece, Side } from '../types/chess';
import { ChessPiece } from './ChessPieces';

interface ClockCardProps {
  side: Side;
  name: string;
  isAi: boolean;
  isActive: boolean;
  secondsRemaining: number;
  timerEnabled: boolean;
  isInCheck: boolean;
  isThinking: boolean;
  capturedPieces: Piece[];
  advantageScore?: number;
}

export const ClockCard: React.FC<ClockCardProps> = React.memo(
  ({
    side,
    name,
    isAi,
    isActive,
    secondsRemaining,
    timerEnabled,
    isInCheck,
    isThinking,
    capturedPieces,
    advantageScore,
  }) => {
    const isWhite = side === 'white';

    const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const isLowTime = timerEnabled && secondsRemaining <= 30 && secondsRemaining > 0;

    return (
      <div
        className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl transition-all duration-200 border ${
          isActive
            ? 'bg-amber-950/30 border-amber-500/50 shadow-md shadow-amber-900/20'
            : 'bg-stone-900/60 border-stone-800 text-stone-300'
        }`}
      >
        {/* Player avatar & name */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-inner ${
              isWhite ? 'bg-amber-100 text-stone-900' : 'bg-stone-800 text-amber-100 border border-stone-700'
            }`}
          >
            {isAi ? <Bot className="w-5 h-5 text-amber-500" /> : <User className="w-5 h-5 text-stone-400" />}
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm sm:text-base text-stone-100 truncate">
                {name}
              </span>
              {isActive && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
              {isInCheck && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-bold animate-pulse flex items-center gap-0.5">
                  <AlertTriangle className="w-2.5 h-2.5" /> كش
                </span>
              )}
              {isThinking && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">
                  يفكر...
                </span>
              )}
            </div>

            {/* Captured Pieces list */}
            <div className="flex items-center gap-0.5 h-4 mt-0.5 overflow-x-auto no-scrollbar">
              {capturedPieces.map((p, idx) => (
                <div key={idx} className="w-3.5 h-3.5 inline-block opacity-80">
                  <ChessPiece kind={p.kind} side={p.side} />
                </div>
              ))}
              {advantageScore && advantageScore > 0 && (
                <span className="text-[10px] font-bold text-amber-400 mr-1">
                  +{advantageScore}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Timer Box */}
        {timerEnabled ? (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-base sm:text-lg border transition-colors ${
              isLowTime
                ? 'bg-red-950/60 border-red-500/60 text-red-300 animate-pulse'
                : isActive
                  ? 'bg-amber-900/40 border-amber-600/50 text-amber-200'
                  : 'bg-stone-950/60 border-stone-800 text-stone-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5 opacity-60" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>
        ) : (
          <div className="text-xs px-2.5 py-1 rounded bg-stone-800/60 text-stone-400">
            بلا وقت
          </div>
        )}
      </div>
    );
  },
);
