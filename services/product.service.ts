import { request } from '@/lib/api/client';
import type { SearchFilters, SearchResponse } from '@/types/api';

/**
 * GET /api/products/search
 *
 * الفلاتر بتنبعت كـ query params — السيرفر بيدمج name+brand+category بجملة
 * بحث وحدة قبل ما يبعتها لـ SerpAPI.
 *
 * بيرمي 403 لو موقع المستخدم مش محدد، و429 بعد 10 طلبات بالدقيقة.
 */
export function searchProducts(filters: SearchFilters): Promise<SearchResponse> {
  return request<SearchResponse>({
    method: 'GET',
    url: '/api/products/search',
    // axios بيحذف الـ params يلي قيمتها undefined لحاله
    params: {
      name: filters.name,
      brand: filters.brand,
      category: filters.category,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
    },
  });
}
