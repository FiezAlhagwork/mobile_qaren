import { useQuery } from '@tanstack/react-query';

import type { ApiError } from '@/lib/api/errors';
import { queryKeys } from '@/lib/query/keys';
import { checkHealth } from '@/services/health.service';
import type { HealthResponse } from '@/types/api';

/**
 * الـ endpoint الوحيد يلي بيشتغل بدون توكن.
 *
 * قبل ما تنبني شاشات الدخول، هاد هو الفحص الوحيد يلي بيثبت إنه الطبقة كاملة
 * موصولة: الـ base URL صحيح، axios شغّال، وTanStack Query مركّب.
 * فشله شبه أكيد يعني إنه EXPO_PUBLIC_API_URL فيه localhost بدل IP الشبكة.
 */
export function useHealth(options?: { enabled?: boolean }) {
  return useQuery<HealthResponse, ApiError>({
    queryKey: queryKeys.health,
    queryFn: checkHealth,
    enabled: options?.enabled !== false,
  });
}
