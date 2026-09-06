import React, { useRef, useEffect, useState } from 'react';
import { Move } from '../types/chess';
import { ScrollText, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface MoveHistoryProps {
  history: Move[];
  isOpen: boolean;
  onToggle: () => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ history, isOpen, onToggle }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history.length]);

  const copyPgn = async () => {
    if (history.length === 0 || !navigator.clipboard) return;
    const moves = history
      .map((move, index) =>
        index % 2 === 0
          ? `${Math.floor(index / 2) + 1}. ${move.san || '...'}`
          : move.san || '...',
      )
      .join(' ');
    try {
      await navigator.clipboard.writeText(`[Event "مجلس الشطرنج"]\n\n${moves}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const movePairs: { white: Move; black?: Move; moveNumber: number }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({ moveNumber: Math.floor(i / 2) + 1, white: history[i], black: history[i + 1] });
  }

  return (
    <div className="w-full bg-stone-900/80 rounded-xl border border-stone-800 overflow-hidden shadow-lg">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-2.5 flex items-center justify-between text-stone-200 hover:bg-stone-800/60 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <ScrollText className="w-4 h-4 text-amber-400" />
          <span>سجل النقلات</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-amber-300 font-mono">{history.length}</span>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => { event.stopPropagation(); void copyPgn(); }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  event.stopPropagation();
                  void copyPgn();
                }
              }}
              className="p-1 rounded-md text-stone-400 hover:text-amber-300 hover:bg-stone-800 cursor-pointer"
              title="نسخ المباراة بصيغة PGN"
              aria-label="نسخ المباراة بصيغة PGN"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </span>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </div>
      </button>

      {isOpen && (
        <div ref={scrollRef} className="max-h-40 overflow-y-auto p-3 text-xs divide-y divide-stone-800/60 bg-stone-950/40 font-mono">
          {movePairs.length === 0 ? (
            <div className="text-center py-4 text-stone-500 font-sans">لم تبدأ أي نقلة بعد</div>
          ) : (
            movePairs.map((pair) => (
              <div key={pair.moveNumber} className="grid grid-cols-12 py-1 items-center hover:bg-stone-800/30 px-1 rounded">
                <span className="col-span-2 text-stone-500 font-bold">{pair.moveNumber}.</span>
                <span className="col-span-5 text-stone-200 font-semibold truncate">{pair.white.san || '...'}</span>
                <span className="col-span-5 text-stone-400 truncate">{pair.black ? pair.black.san : ''}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
