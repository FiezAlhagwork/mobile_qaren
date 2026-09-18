import { request } from '@/lib/api/client';
import type { Prediction, ProductInput, Recommendation } from '@/types/api';

/**
 * الاتنين POST بس فعليًا **قراءات**: بدون آثار جانبية، والسيرفر بيكاش النتيجة
 * 24 ساعة. عشان هيك بينمذجوا كـ useQuery مش mutations.
 *
 * الاتنين محدودين بـ 5 طلبات/دقيقة.
 */

/**
 * POST /api/recommendations — توصية Buy Now / Wait.
 * **بيستخدم** التاريخ: لو المستخدم مراقب هالمنتج، السيرفر بيرفق إحصائيات
 * PriceHistory تلقائيًا وبيرجّع basedOnHistory: true.
 */
export function getRecommendation(product: ProductInput): Promise<Recommendation> {
  return request<Recommendation>({
    method: 'POST',
    url: '/api/recommendations',
    data: product,
  });
}

/**
 * POST /api/predictions — تنبؤ باتجاه السعر.
 * **ما بيلمس** التاريخ إطلاقًا — Gemini بيحلّل السوق من معرفتو هو، فبيشتغل
 * على أي منتج سواء كان مراقَب أو لأ.
 */
export function getPrediction(product: ProductInput): Promise<Prediction> {
  return request<Prediction>({
    method: 'POST',
    url: '/api/predictions',
    data: product,
  });
}
