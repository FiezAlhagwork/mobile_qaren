import type { Watch } from '@/types/api';

export interface DerivedWatch {
  /** آخر سعر مرصود، أو سعر الإضافة لما لسا ما صار فحص */
  currentPrice: number;
  /** الكرون بيسجّل قراءة وحدة بالليل — قبلها ما في ولا قراءة */
  hasReading: boolean;
  hitTarget: boolean;
  /** 0 لـ 1 — قدّيش قطع من طريقو من سعر الإضافة لهدفه */
  progress: number;
  /** كم باقي بالريال لحد الهدف (0 لما يتحقق) */
  remaining: number;
}

/**
 * ⚠️ انحراف مقصود عن التصميم.
 *
 * النموذج التفاعلي بيحسب شريط التقدّم `target ÷ price`. يعني هدف 3,100 على
 * سعر 3,149 بيعطي **98%** — الشريط بيبان شبه ممتلئ رغم إنه ما صار ولا نزول.
 * هاد بيضلّل المستخدم بأهم رقم بالشاشة.
 *
 * منحسبه كتقدّم فعلي: من وين بلّش (`priceAtAdd`) لوين واصل (`lastCheckedPrice`)
 * نسبةً للمسافة الكاملة لحد الهدف.
 */
export function deriveWatch(watch: Watch): DerivedWatch {
  const hasReading = watch.lastCheckedPrice !== null;
  const currentPrice = watch.lastCheckedPrice ?? watch.priceAtAdd;
  const hitTarget = currentPrice <= watch.targetPrice;

  const distance = watch.priceAtAdd - watch.targetPrice;
  const travelled = watch.priceAtAdd - currentPrice;

  // لما الهدف أعلى من سعر الإضافة، المسافة صفر أو سالبة — الهدف متحقق أصلاً
  const progress =
    distance <= 0 ? 1 : Math.max(0, Math.min(1, travelled / distance));

  return {
    currentPrice,
    hasReading,
    hitTarget,
    progress,
    remaining: Math.max(0, currentPrice - watch.targetPrice),
  };
}

export interface WatchSummary {
  active: number;
  /** مجموع النزول المرصود عبر كل المراقبات — مش «مصاري وفّرها» فعليًا */
  saved: number;
  alertsThisMonth: number;
}

export function summarizeWatches(watches: Watch[] | undefined): WatchSummary {
  if (!watches?.length) return { active: 0, saved: 0, alertsThisMonth: 0 };

  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  let saved = 0;
  let alertsThisMonth = 0;
  let active = 0;

  for (const watch of watches) {
    if (watch.isActive) active += 1;

    // بس النزول بيتحسب — ارتفاع السعر مش «خسارة» بمعنى مفيد للمستخدم
    if (watch.lastCheckedPrice !== null) {
      const drop = watch.priceAtAdd - watch.lastCheckedPrice;
      if (drop > 0) saved += drop;
    }

    if (watch.notifiedAt) {
      const at = new Date(watch.notifiedAt);
      if (at.getMonth() === month && at.getFullYear() === year) {
        alertsThisMonth += 1;
      }
    }
  }

  return { active, saved, alertsThisMonth };
}
