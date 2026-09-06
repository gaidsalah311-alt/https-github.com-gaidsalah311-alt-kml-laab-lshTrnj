import React, { useState, useEffect } from 'react';
import { X, Play, Award, CheckCircle2, Sparkles, Tv, ShieldCheck } from 'lucide-react';

interface RewardedAdModalProps {
  rewardType: 'hints' | 'undos' | 'both';
  onReward: (bonusHints: number, bonusUndos: number) => void;
  onClose: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  rewardType,
  onReward,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isPlaying && countdown === 0) {
      setIsCompleted(true);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, countdown]);

  const handleClaimReward = () => {
    const bonusHints = rewardType === 'undos' ? 0 : 2;
    const bonusUndos = rewardType === 'hints' ? 0 : 2;
    onReward(bonusHints, bonusUndos);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-stone-900 border border-amber-600/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 relative">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-amber-100">
            إعلان بمكافأة (Rewarded Ad)
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto">
            {rewardType === 'hints'
              ? 'شاهد إعلاناً قصيراً لتجديد رصيد التلميحات (+2 تلميحات)'
              : rewardType === 'undos'
              ? 'شاهد إعلاناً قصيراً لتجديد رصيد التراجع (+2 تراجع)'
              : 'شاهد إعلاناً قصيراً لكسب (+2 تلميحات و +2 تراجع إضافي)'}
          </p>
        </div>

        {/* Ad Player / Simulation Card */}
        <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-3">
          {!isPlaying && !isCompleted ? (
            <div className="text-center py-4 space-y-3">
              <div className="flex items-center justify-center gap-2 text-stone-300 text-xs">
                <Tv className="w-4 h-4 text-amber-400" />
                <span>إعلان فيديو قصير (5 ثوانٍ فقط)</span>
              </div>
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>بدء مشاهدة الإعلان للحصول على المكافأة</span>
              </button>
            </div>
          ) : isPlaying && !isCompleted ? (
            <div className="text-center py-5 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>جاري عرض الإعلان... متبقي {countdown} ثانية</span>
              </div>
              <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-stone-400">
                برعاية: مجتمع محترفي الشطرنج العربي - منصة التدريب التكتيكي
              </p>
            </div>
          ) : (
            <div className="text-center py-3 space-y-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-bold">
                <CheckCircle2 className="w-5 h-5" />
                <span>اكتملت المشاهدة بنجاح! المكافأة جاهزة</span>
              </div>
              <button
                type="button"
                onClick={handleClaimReward}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>استلام المكافأة الآن وتطبيقها</span>
              </button>
            </div>
          )}
        </div>

        {/* Fair Play & Monetization Architecture Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-stone-300 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>معايير اللعب النظيف:</strong> الإعلانات بمكافأة طوعية تماماً ولا تقاطع سير المباراة أو الوقت أبداً.
          </span>
        </div>
      </div>
    </div>
  );
};
