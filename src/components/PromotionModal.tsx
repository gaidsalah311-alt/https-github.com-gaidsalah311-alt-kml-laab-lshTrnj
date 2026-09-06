import React from 'react';
import { PromotionKind, Side } from '../types/chess';
import { ChessPiece } from './ChessPieces';

interface PromotionModalProps {
  side: Side;
  onSelect: (kind: PromotionKind) => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({ side, onSelect }) => {
  const options: { kind: PromotionKind; label: string }[] = [
    { kind: 'queen', label: 'وزير' },
    { kind: 'rook', label: 'قلعة' },
    { kind: 'bishop', label: 'فيل' },
    { kind: 'knight', label: 'حصان' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-xs bg-stone-900 border border-amber-600/40 rounded-2xl p-5 shadow-2xl text-center animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-bold text-amber-100 mb-1">
          ترقية البيدق
        </h3>
        <p className="text-xs text-stone-400 mb-4">
          اختر القطعة التي تريد ترقية البيدق إليها
        </p>

        <div className="grid grid-cols-4 gap-2">
          {options.map(({ kind, label }) => (
            <button
              key={kind}
              type="button"
              onClick={() => onSelect(kind)}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-800 hover:bg-amber-900/40 border border-stone-700 hover:border-amber-500/60 transition-all transform hover:-translate-y-0.5 active:scale-95 group cursor-pointer"
            >
              <div className="w-10 h-10 mb-1 group-hover:scale-110 transition-transform">
                <ChessPiece kind={kind} side={side} />
              </div>
              <span className="text-xs font-semibold text-stone-200 group-hover:text-amber-300">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
