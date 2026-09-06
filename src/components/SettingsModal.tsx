import React from 'react';
import { X, Clock, Volume2, Grid, Brain, Check } from 'lucide-react';
import { DifficultyId, GameSettings } from '../types/chess';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdate: (patch: Partial<GameSettings>) => void;
  onClose: () => void;
}

const DIFFICULTIES: { id: DifficultyId; label: string; desc: string }[] = [
  { id: 'beginner', label: 'مبتدئ', desc: 'لعب بسيط وخفيف' },
  { id: 'easy', label: 'سهل', desc: 'بداية هادئة واستكشافية' },
  { id: 'medium', label: 'متوسط', desc: 'تحدٍ متوازن ومنطقي' },
  { id: 'hard', label: 'صعب', desc: 'قرارات دقيقة وهجوم مركز' },
  { id: 'expert', label: 'خبير', desc: 'حسابات استراتيجية عميقة' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onUpdate, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2">
            إعدادات اللعبة
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-950/60 border border-stone-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-950/40 text-amber-400 border border-amber-800/40">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-stone-200 text-sm">المؤثرات الصوتية</div>
                <div className="text-xs text-stone-400">صوت خشبي للنقلات وأصوات الكش والأكل</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdate({ soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                settings.soundEnabled ? 'bg-amber-600' : 'bg-stone-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.soundEnabled ? 'left-1' : 'left-6'
                }`}
              />
            </button>
          </div>

          {/* Coordinates Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-950/60 border border-stone-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-950/40 text-amber-400 border border-amber-800/40">
                <Grid className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-stone-200 text-sm">إحداثيات الرقعة</div>
                <div className="text-xs text-stone-400">إظهار أسماء المربعات والأعمدة (a-h, 1-8)</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdate({ showCoordinates: !settings.showCoordinates })}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                settings.showCoordinates ? 'bg-amber-600' : 'bg-stone-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                  settings.showCoordinates ? 'left-1' : 'left-6'
                }`}
              />
            </button>
          </div>

          {/* Timer Toggle */}
          <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-950/40 text-amber-400 border border-amber-800/40">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-stone-200 text-sm">مؤقت المباراة</div>
                  <div className="text-xs text-stone-400">تحديد وقت زمني لكل لاعب</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onUpdate({ timerEnabled: !settings.timerEnabled })}
                className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                  settings.timerEnabled ? 'bg-amber-600' : 'bg-stone-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.timerEnabled ? 'left-1' : 'left-6'
                  }`}
                />
              </button>
            </div>

            {settings.timerEnabled && (
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-stone-800/60">
                {[3, 5, 10, 15].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => onUpdate({ timerMinutes: mins })}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      settings.timerMinutes === mins
                        ? 'bg-amber-600 text-stone-950 border-amber-400'
                        : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'
                    }`}
                  >
                    {mins} دقائق
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* AI Difficulty Selector */}
          <div className="p-3 rounded-2xl bg-stone-950/60 border border-stone-800/80 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-950/40 text-amber-400 border border-amber-800/40">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-stone-200 text-sm">مستوى الذكاء الاصطناعي</div>
                <div className="text-xs text-stone-400">اختر قوة تفكير الحاسوب</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {DIFFICULTIES.map((diff) => {
                const isSelected = settings.aiDifficulty === diff.id;
                return (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => onUpdate({ aiDifficulty: diff.id })}
                    className={`p-2.5 rounded-xl text-right transition-all border flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-950/60 border-amber-500/80 text-amber-100 shadow-sm'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:bg-stone-800/60'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-stone-200">{diff.label}</div>
                      <div className="text-[10px] text-stone-400">{diff.desc}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-sm shadow-md transition-all cursor-pointer"
        >
          حفظ وإغلاق
        </button>
      </div>
    </div>
  );
};
