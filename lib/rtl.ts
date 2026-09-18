import { I18nManager } from 'react-native';

/**
 * التطبيق كلّو RTL. بـ React Native هاد **مش خاصية CSS** — لازم
 * `I18nManager.forceRTL(true)`، وهو بيقلب كل `flexDirection` والهوامش
 * عالميًا.
 *
 * 🔴 **بدو إعادة تشغيل كاملة للتطبيق حتى ينفعل** — إعادة التحميل السريع
 * ما بتكفي. أول مرة يشتغل التطبيق بعد هالتغيير، التخطيط بيضل LTR لحد ما
 * تسكّره وتفتحه من جديد.
 *
 * منناديها على مستوى الوحدة (مش جوا component) عشان تشتغل مرة وحدة قبل
 * أول render.
 */
export function enforceRtl(): void {
  I18nManager.allowRTL(true);

  if (!I18nManager.isRTL) {
    I18nManager.forceRTL(true);
  }
}

/** للتشخيص — بتخبّر إذا الـ RTL فعليًا مفعّل بهالتشغيلة */
export const isRtlActive = (): boolean => I18nManager.isRTL;
