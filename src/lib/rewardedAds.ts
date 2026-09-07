import { Capacitor } from '@capacitor/core';
import { AdMob } from '@capacitor-community/admob';

// Google's official test IDs are used until production AdMob IDs are supplied.
// They display real rewarded test ads and must never be clicked during testing.
export const REWARDED_TEST_AD_UNIT_ID = 'ca-app-pub-3940256099942544/5224354917';

let initialized = false;
let preparing: Promise<void> | null = null;

export function isRewardedAdsAvailable(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

async function ensureInitialized(): Promise<void> {
  if (!isRewardedAdsAvailable() || initialized) return;
  if (!preparing) {
    preparing = AdMob.initialize({ initializeForTesting: true })
      .then(() => {
        initialized = true;
      })
      .finally(() => {
        preparing = null;
      });
  }
  await preparing;
}

export async function showRewardedAd(): Promise<boolean> {
  if (!isRewardedAdsAvailable()) return false;
  try {
    await ensureInitialized();
    await AdMob.prepareRewardVideoAd({ adId: REWARDED_TEST_AD_UNIT_ID });
    await AdMob.showRewardVideoAd({ adId: REWARDED_TEST_AD_UNIT_ID });
    return true;
  } catch {
    return false;
  }
}
