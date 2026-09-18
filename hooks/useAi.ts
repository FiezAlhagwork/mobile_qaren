import { useQuery } from '@tanstack/react-query';

import type { ApiError } from '@/lib/api/errors';
import { AI_STALE_TIME } from '@/lib/query/client';
import { queryKeys } from '@/lib/query/keys';
import { getPrediction, getRecommendation } from '@/services/ai.service';
import type { Prediction, ProductInput, Recommendation } from '@/types/api';

/**
 * الاتنين POST بس فعليًا قراءات، فبينمذجوا كـ queries.
 *
 * `enabled: false` افتراضيًا: الاتنين "on-demand" حسب المواصفات وبيكلّفوا
 * نداء Gemini، والحد 5 طلبات/دقيقة. الشاشة بتشغّلهن بـ `refetch()` عند
 * ضغطة زر.
 *
 * staleTime = 24 ساعة، مطابق لكاش السيرفر — قبلها الرد رح يكون نفسه حرفيًا.
 */

export function useRecommendation(
  product: ProductInput | null,
  options?: { enabled?: boolean },
) {
  return useQuery<Recommendation, ApiError>({
    queryKey: queryKeys.ai.recommendation(product?.productId ?? ''),
    queryFn: () => getRecommendation(product as ProductInput),
    enabled: !!product && options?.enabled === true,
    staleTime: AI_STALE_TIME,
  });
}

export function usePrediction(
  product: ProductInput | null,
  options?: { enabled?: boolean },
) {
  return useQuery<Prediction, ApiError>({
    queryKey: queryKeys.ai.prediction(product?.productId ?? ''),
    queryFn: () => getPrediction(product as ProductInput),
    enabled: !!product && options?.enabled === true,
    staleTime: AI_STALE_TIME,
  });
}
