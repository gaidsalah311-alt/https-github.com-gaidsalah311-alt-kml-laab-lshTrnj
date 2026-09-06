import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, RefreshCw, Home, Frown } from 'lucide-react';
import { GameStatus, Side } from '../types/chess';
import { otherSide } from '../lib/chess/chessRules';

interface GameOverModalProps {
  status: GameStatus;
  turn: Side;
  playerSide: Side;
  gameMode: 'local' | 'computer';
  onNewGame: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  status,
  turn,
  playerSide,
  gameMode,
  onNewGame,
  onHome,
}) => {
  const winnerSide = otherSide(turn);
  const isWinnerWhite = winnerSide === 'white';

  let title = 'نهاية المباراة';
  let subtitle = '';
  let isVictory = false;

  if (status === 'checkmate') {
    title = `كش مات! فوز ${isWinnerWhite ? 'الأبيض' : 'الأسود'}`;
    if (gameMode === 'computer') {
      if (winnerSide === playerSide) {
        subtitle = 'مبروك! لقد تفوقت على الحاسوب بنقلات محكمة!';
        isVictory = true;
      } else {
        subtitle = 'فاز الحاسوب هذه المرة، حاول مجدداً لتحقق النصر!';
      }
    } else {
      subtitle = `مباراة رائعة انتهت بانتصار مستحق للّاعب ${isWinnerWhite ? 'الأبيض' : 'الأسود'}.`;
      isVictory = true;
    }
  } else if (status === 'timeout') {
    title = `انتهى الوقت! فوز ${isWinnerWhite ? 'الأبيض' : 'الأسود'}`;
    subtitle = `نفد وقت اللاعب ${turn === 'white' ? 'الأبيض' : 'الأسود'}.`;
  } else if (status === 'resigned') {
    title = `استسلام! فوز ${isWinnerWhite ? 'الأبيض' : 'الأسود'}`;
    subtitle = `أعلن اللاعب ${turn === 'white' ? 'الأبيض' : 'الأسود'} الاستسلام.`;
  } else if (status === 'stalemate') {
    title = 'تعادل بالمأزق (Stalemate)';
    subtitle = 'لا توجد نقلات قانونية للملك وهو ليس تحت الكش.';
  } else if (status === 'drawInsufficientMaterial') {
    title = 'تعادل (قطع غير كافية)';
    subtitle = 'لا تملك أي جهة قطعاً تكفي لفرض الكش مات.';
  } else if (status === 'drawThreefold') {
    title = 'تعادل بتكرار الوضع 3 مرات';
    subtitle = 'تكررت نفس الوضعية لثلاث مرات متتالية.';
  } else if (status === 'drawFiftyMove') {
    title = 'تعادل بقاعدة الـ 50 نقلة';
    subtitle = 'مرت 50 نقلة كاملة دون أخذ أي قطعة أو تحريك أي بيدق.';
  } else if (status === 'agreedDraw') {
    title = 'تعادل بالاتفاق';
    subtitle = 'اتفق الطرفان على إنهاء المباراة بالتعادل.';
  }

  useEffect(() => {
    if (isVictory) {
      void confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isVictory]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-500/40 rounded-3xl p-6 text-center shadow-2xl space-y-5">
        {/* Icon Badge */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-lg">
          {isVictory ? (
            <Trophy className="w-9 h-9 text-amber-400 animate-bounce" />
          ) : status === 'checkmate' ? (
            <Frown className="w-9 h-9 text-stone-400" />
          ) : (
            <Award className="w-9 h-9 text-amber-300" />
          )}
        </div>

        {/* Title & description */}
        <div>
          <h2 className="text-2xl font-bold text-amber-100">{title}</h2>
          <p className="text-sm text-stone-400 mt-2 leading-relaxed">{subtitle}</p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onNewGame}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition-all cursor-pointer transform active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>مباراة جديدة</span>
          </button>

          <button
            type="button"
            onClick={onHome}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-300 font-semibold text-sm flex items-center justify-center gap-2 border border-stone-700 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>العودة للمجلس</span>
          </button>
        </div>
      </div>
    </div>
  );
};
