import React, { useState } from 'react';
import { X, Play, Award, Tv, ShieldCheck, AlertCircle } from 'lucide-react';
import { isRewardedAdsAvailable, showRewardedAd } from '../lib/rewardedAds';

interface RewardedAdModalProps {
  rewardType: 'hints' | 'undos' | 'both';
  onReward: (bonusHints: number, bonusUndos: number) => void;
  onClose: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({ rewardType, onReward, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWatch = async () => {
    setError('');
    if (!isRewardedAdsAvailable()) {
      setError('الإعلانات متاحة داخل تطبيق Android فقط. لا يمكن منح المكافأة في نسخة المتصفح.');
      return;
    }
    setIsLoading(true);
    const earned = await showRewardedAd();
    setIsLoading(false);
    if (!earned) {
      setError('تعذر تحميل الإعلان الآن. حاول مرة أخرى لاحقًا.');
      return;
    }
    onReward(rewardType === 'undos' ? 0 : 2, rewardType === 'hints' ? 0 : 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-stone-900 border border-amber-600/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 relative">
        <button type="button" onClick={onClose} disabled={isLoading} className="absolute top-4 left-4 p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer disabled:opacity-40" title="إغلاق" aria-label="إغلاق">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center space-y-1 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto shadow-inner"><Award className="w-6 h-6" /></div>
          <h3 className="text-lg font-bold text-amber-100">إعلان بمكافأة</h3>
          <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto">
            {rewardType === 'hints' ? 'شاهد إعلان Google قصيرًا لتجديد +2 تلميحات' : rewardType === 'undos' ? 'شاهد إعلان Google قصيرًا لتجديد +2 تراجع' : 'شاهد إعلان Google قصيرًا لكسب +2 تلميحات و+2 تراجع'}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-stone-950/80 border border-stone-800/80 space-y-3">
          <div className="text-center py-4 space-y-3">
            <div className="flex items-center justify-center gap-2 text-stone-300 text-xs"><Tv className="w-4 h-4 text-amber-400" /><span>Rewarded Ad من Google</span></div>
            <button type="button" onClick={() => void handleWatch()} disabled={isLoading} className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-wait">
              {isLoading ? <span className="animate-pulse">جاري تحميل الإعلان...</span> : <><Play className="w-4 h-4 fill-current" /><span>مشاهدة الإعلان للحصول على المكافأة</span></>}
            </button>
            {error && <div className="flex items-start gap-2 text-right text-[11px] text-red-300 bg-red-950/30 border border-red-500/30 rounded-lg p-2"><AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span></div>}
          </div>
        </div>
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[11px] text-stone-300 leading-relaxed"><ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /><span><strong>اللعب النظيف:</strong> لا تُمنح المكافأة إلا بعد إتمام مشاهدة الإعلان فعليًا عبر Google AdMob.</span></div>
      </div>
    </div>
  );
};
