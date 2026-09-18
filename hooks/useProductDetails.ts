import { useQuery } from '@tanstack/react-query';

import type { ApiError } from '@/lib/api/errors';
import { queryKeys } from '@/lib/query/keys';
import { getProductDetails } from '@/services/productDetails.service';
import type { ProductDetails } from '@/types/api';

/**
 * تفاصيل المنتج — نداء SerpAPI مدفوع ومحدود بـ 10 طلبات/دقيقة، فالكاش
 * طويل عن قصد: نفس المنتج ما بيعيد النداء خلال الجلسة.
 *
 * لو رجع `ApiError` بـ `status === 410` معناها الـ productToken منتهي
 * والمستخدم لازم يعيد البحث.
 */
export function useProductDetails(
  productId: string | null,
  productToken: string | null,
) {
  return useQuery<ProductDetails, ApiError>({
    queryKey: queryKeys.products.details(productId ?? ''),
    queryFn: () => getProductDetails(productId as string, productToken as string),
    enabled: !!productId && !!productToken,
    staleTime: 1000 * 60 * 15,
  });
}
