import React, { useRef, useEffect } from 'react';
import { Move } from '../types/chess';
import { ScrollText, ChevronDown, ChevronUp } from 'lucide-react';

interface MoveHistoryProps {
  history: Move[];
  isOpen: boolean;
  onToggle: () => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ history, isOpen, onToggle }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length]);

  // Group moves into pairs (White & Black)
  const movePairs: { white: Move; black?: Move; moveNumber: number }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      moveNumber: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1],
    });
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
          <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-amber-300 font-mono">
            {history.length}
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
      </button>

      {isOpen && (
        <div
          ref={scrollRef}
          className="max-h-40 overflow-y-auto p-3 text-xs divide-y divide-stone-800/60 bg-stone-950/40 font-mono"
        >
          {movePairs.length === 0 ? (
            <div className="text-center py-4 text-stone-500 font-sans">
              لم تبدأ أي نقلة بعد
            </div>
          ) : (
            movePairs.map((pair) => (
              <div key={pair.moveNumber} className="grid grid-cols-12 py-1 items-center hover:bg-stone-800/30 px-1 rounded">
                <span className="col-span-2 text-stone-500 font-bold">
                  {pair.moveNumber}.
                </span>
                <span className="col-span-5 text-stone-200 font-semibold truncate">
                  {pair.white.san || '...'}
                </span>
                <span className="col-span-5 text-stone-400 truncate">
                  {pair.black ? pair.black.san : ''}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
