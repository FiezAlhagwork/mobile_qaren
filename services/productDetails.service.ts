import { request } from '@/lib/api/client';
import type { ProductDetails } from '@/types/api';

/**
 * GET /api/products/:id/details
 *
 * عروض المتاجر والمواصفات والصور لمنتج واحد.
 * الـ productToken بيجي من نتيجة البحث (`immersive_product_page_token`) —
 * ما في طريقة تانية تجيبه.
 *
 * بيرمي **410** لو الـ token منتهي (ApiError.status === 410)، و429 بعد
 * 10 طلبات بالدقيقة.
 */
export function getProductDetails(
  productId: string,
  productToken: string,
): Promise<ProductDetails> {
  return request<ProductDetails>({
    method: 'GET',
    url: `/api/products/${encodeURIComponent(productId)}/details`,
    params: { productToken },
  });
}
