// مسار نسبي بامتداد صريح مش `@/` عن قصد: هالملف وErrors الاتنين خاليين من
// أي تبعية لـ react-native، فبهالشكل بينحمّلوا بـ node لحالهم وبتنختبر
// سياسة الإعادة بمعزل — بدون محوّل الأسماء تبع Metro
import { ApiError } from '../api/errors.ts';

/**
 * 🔴 ولا إعادة محاولة على أي رد فعلي من السيرفر.
 *
 * حدود الـ rate limit ضيقة (5/دقيقة للذكاء الاصطناعي، 10/دقيقة للبحث)،
 * وإعادة المحاولة على 429 بتعمّق الحظر بدل ما تحلّه. وباقي الـ 4xx إعادتها
 * بلا معنى — نفس الطلب الغلط بيعطي نفس النتيجة. حتى 502 ما منعيدها لأنها
 * بتعني إنه SerpAPI أو Gemini نفسها فشلت، والإعادة الفورية بتستهلك الحصة.
 *
 * منعيد بس لما ما نكون وصلنا للسيرفر إطلاقًا (شبكة أو مهلة).
 */
export function retry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && !error.isNetwork) return false;
  return failureCount < 2;
}

/**
 * استثناء مقصود من السياسة فوق، لـ `GET /api/user/me` بس.
 *
 * بعد التسجيل، المستخدم بينعمل عند Clerk أولًا، وبعدها بيوصل لقاعدة بياناتنا
 * عبر webhook — خطوة **غير متزامنة** بتاخد ثواني. بينما التطبيق بينده `/me`
 * فورًا بعد تفعيل الجلسة. فأول رد بيكون 404 حقيقية بتزول لحالها.
 *
 * بدون هالاستثناء، كل مستخدم جديد بيعلق على شاشة «ما لقينا حسابك على الخادم»
 * لحد ما يضغط إعادة يدويًا — وهي رسالة بتوجّهه لمشكلة webhook مش موجودة.
 *
 * بعد استنفاد المحاولات (~18 ثانية) الـ404 بتصير خبر حقيقي وبتنعرض.
 */
/**
 * 1.5 + 3 + 6 + (8 × 6) = **58.5 ثانية**.
 *
 * التأخير المرصود فعليًا بتسليم webhook ناجح كان 2.3 ثانية، فالنافذة سخية
 * عن قصد: Svix بيعيد التسليم لو السيرفر كان مطفي لحظة (بيصير مع إعادة تشغيل
 * nodemon)، وإعادة التسليم بتاخد أطول بكتير من التسليم الأول.
 */
const MAX_NOT_FOUND_RETRIES = 9;

export function retryUserFetch(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.isNotFound) {
    return failureCount < MAX_NOT_FOUND_RETRIES;
  }
  return retry(failureCount, error);
}

/** تراجع متصاعد مسقوف عند 8 ثواني */
const RETRY_DELAYS_MS = [1500, 3000, 6000, 8000];

export const userFetchRetryDelay = (attempt: number): number =>
  RETRY_DELAYS_MS[attempt] ?? RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1];
