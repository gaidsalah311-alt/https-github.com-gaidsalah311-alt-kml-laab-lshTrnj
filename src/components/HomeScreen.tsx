import React from 'react';
import { Users, Bot, Sliders, Play, RotateCcw, Trophy, Shield, Zap, Sparkles } from 'lucide-react';
import { DifficultyId, GameMode, GameSettings, GameStats, Side } from '../types/chess';

interface HomeScreenProps {
  hasSavedGame: boolean;
  savedMode: GameMode;
  settings: GameSettings;
  stats: GameStats;
  onStart: (mode: GameMode, resume?: boolean, playerSide?: Side) => void;
  onOpenSettings: () => void;
  onSelectDifficulty: (id: DifficultyId) => void;
  onSelectPlayerSide: (side: 'white' | 'black' | 'random') => void;
}

const DIFFICULTIES: { id: DifficultyId; label: string }[] = [
  { id: 'beginner', label: 'مبتدئ' },
  { id: 'easy', label: 'سهل' },
  { id: 'medium', label: 'متوسط' },
  { id: 'hard', label: 'صعب' },
  { id: 'expert', label: 'خبير' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  hasSavedGame,
  savedMode,
  settings,
  stats,
  onStart,
  onOpenSettings,
  onSelectDifficulty,
  onSelectPlayerSide,
}) => {
  const winRate =
    stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;

  return (
    <div className="w-full max-w-xl mx-auto space-y-5 px-3 sm:px-4 py-4 sm:py-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold tracking-wider text-amber-500 uppercase flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            مَجْلِس الشطرنج
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-100 tracking-tight mt-1 font-['Cinzel',serif]">
            إلعب معي شطرنج
          </h1>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-3 rounded-2xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-400 hover:border-amber-600/40 transition-all shadow-md cursor-pointer"
          aria-label="الإعدادات"
        >
          <Sliders className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/70 via-stone-900 to-stone-950 border border-amber-500/30 p-6 shadow-xl">
        <div className="relative z-10 max-w-[80%] space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            جاهز للعب والتحدي
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-100 leading-tight">
            كل نقلة تصنع الحكاية
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
            مباراة هادئة، تركيز كامل، متعة تتجدد وذكاء اصطناعي فائق السرعة.
          </p>
        </div>

        {/* Decorative chess piece art in background */}
        <div className="absolute left-[-20px] bottom-[-25px] opacity-15 select-none pointer-events-none text-9xl text-amber-500">
          ♞
        </div>
      </div>

      {/* Resume Game Banner if exists */}
      {hasSavedGame && (
        <button
          type="button"
          onClick={() => onStart(savedMode, true)}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 to-stone-900 border border-amber-500/40 hover:border-amber-400 transition-all shadow-md group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="font-bold text-stone-100 text-sm">لديك مباراة محفوظة</div>
              <div className="text-xs text-stone-400">انقر هنا لاستئناف اللقاء من حيث توقفت</div>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-600 text-stone-950 group-hover:bg-amber-500 transition-colors">
            متابعة
          </span>
        </button>
      )}

      {/* Mode Selection Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mr-1">
          اختر طريقتك في اللعب
        </h3>

        {/* 1. Play vs Computer Card */}
        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3 shadow-md hover:border-amber-600/50 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-stone-100 text-base">لاعب ضد الحاسوب</h4>
                <p className="text-xs text-stone-400">محرك ذكاء اصطناعي بمستويات متعددة</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const side =
                  settings.playerSide === 'random'
                    ? Math.random() < 0.5 ? 'white' : 'black'
                    : settings.playerSide;
                onStart('computer', false, side);
              }}
              className="py-2 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer transform active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>ابدأ</span>
            </button>
          </div>

          {/* Difficulty Selection */}
          <div className="pt-2 border-t border-stone-800/80">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
              <span>مستوى التحدي:</span>
              <span className="font-bold text-amber-400">
                {DIFFICULTIES.find((d) => d.id === settings.aiDifficulty)?.label}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => onSelectDifficulty(diff.id)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    settings.aiDifficulty === diff.id
                      ? 'bg-amber-600 text-stone-950 border-amber-400 shadow-sm'
                      : 'bg-stone-800/60 text-stone-400 border-stone-700 hover:bg-stone-800'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection (White / Black / Random) */}
          <div className="pt-2 border-t border-stone-800/80">
            <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
              <span>لون قطعك:</span>
              <span className="font-bold text-stone-200">
                {settings.playerSide === 'white'
                  ? 'الأبيض (تبدأ أولاً)'
                  : settings.playerSide === 'black'
                    ? 'الأسود (الحاسوب يبدأ)'
                    : 'عشوائي'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'white', label: '♔ الأبيض' },
                  { id: 'black', label: '♚ الأسود' },
                  { id: 'random', label: '🎲 عشوائي' },
                ] as const
              ).map((sideOpt) => (
                <button
                  key={sideOpt.id}
                  type="button"
                  onClick={() => onSelectPlayerSide(sideOpt.id)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    settings.playerSide === sideOpt.id
                      ? 'bg-stone-100 text-stone-900 border-amber-500 shadow-sm'
                      : 'bg-stone-800/50 text-stone-400 border-stone-700 hover:bg-stone-800'
                  }`}
                >
                  {sideOpt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Play Local 2-Players */}
        <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-between shadow-md hover:border-amber-600/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-stone-100 text-base">لاعبان على نفس الجهاز</h4>
              <p className="text-xs text-stone-400">تناوبا على الدور وشاركا متعة التحدي</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onStart('local', false)}
            className="py-2 px-4 rounded-xl bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-200 border border-stone-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>العب</span>
          </button>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800 text-center space-y-1">
          <Shield className="w-5 h-5 mx-auto text-amber-400" />
          <div className="text-xs font-bold text-stone-200">قواعد كاملة</div>
          <div className="text-[10px] text-stone-400">ترقية، تبييت، كش مات</div>
        </div>
        <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800 text-center space-y-1">
          <Zap className="w-5 h-5 mx-auto text-amber-400" />
          <div className="text-xs font-bold text-stone-200">أداء فائق</div>
          <div className="text-[10px] text-stone-400">سريع وبدون تقطيع</div>
        </div>
        <div className="p-3 rounded-2xl bg-stone-900/60 border border-stone-800 text-center space-y-1">
          <Trophy className="w-5 h-5 mx-auto text-amber-400" />
          <div className="text-xs font-bold text-stone-200">إحصائيات دقيقة</div>
          <div className="text-[10px] text-stone-400">حفظ تلقائي للتقدم</div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-stone-200 text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            سجل إحصائياتك
          </h4>
          <span className="text-xs text-amber-400 font-bold">
            نسبة الفوز: {winRate}%
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          <div className="p-2 rounded-xl bg-stone-950/60 border border-stone-800/80">
            <div className="text-lg font-bold text-stone-100">{stats.games}</div>
            <div className="text-[10px] text-stone-400 font-semibold">مباريات</div>
          </div>
          <div className="p-2 rounded-xl bg-stone-950/60 border border-stone-800/80">
            <div className="text-lg font-bold text-emerald-400">{stats.wins}</div>
            <div className="text-[10px] text-stone-400 font-semibold">انتصارات</div>
          </div>
          <div className="p-2 rounded-xl bg-stone-950/60 border border-stone-800/80">
            <div className="text-lg font-bold text-red-400">{stats.losses}</div>
            <div className="text-[10px] text-stone-400 font-semibold">هزائم</div>
          </div>
          <div className="p-2 rounded-xl bg-stone-950/60 border border-stone-800/80">
            <div className="text-lg font-bold text-amber-400">{stats.draws}</div>
            <div className="text-[10px] text-stone-400 font-semibold">تعادلات</div>
          </div>
        </div>
      </div>
    </div>
  );
};
