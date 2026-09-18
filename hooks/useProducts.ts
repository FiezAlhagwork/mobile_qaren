import { useQuery } from '@tanstack/react-query';

import type { ApiError } from '@/lib/api/errors';
import { queryKeys } from '@/lib/query/keys';
import { searchProducts } from '@/services/product.service';
import type { SearchFilters, SearchResponse } from '@/types/api';

/**
 * البحث محدود بـ 10 طلبات/دقيقة عند السيرفر، فما بينشغّل تلقائيًا:
 * `enabled` بتضل false لحد ما يكون في `name` فعلي (وهو إجباري بالسيرفر).
 *
 * لو رجع الخطأ بـ `isLocationRequired` (403)، يعني المستخدم لازم يحدد موقعه
 * قبل ما يقدر يبحث.
 */
export function useProductSearch(
  filters: SearchFilters | null,
  options?: { enabled?: boolean },
) {
  const hasQuery = !!filters?.name?.trim();

  return useQuery<SearchResponse, ApiError>({
    queryKey: queryKeys.products.search(filters ?? { name: '' }),
    queryFn: () => searchProducts(filters as SearchFilters),
    enabled: hasQuery && options?.enabled !== false,
  });
}
