import { request } from '@/lib/api/client';
import type { HistoryResponse } from '@/types/api';

/**
 * GET /api/history/:id
 *
 * ⚠️ الـ id هو **watchId** مش معرّف سجل تاريخ.
 * بترجّع آخر 30 يوم مع إحصائيات، أو { dataPoints: [], stats: null } لما ما
 * يكون الكرون سجّل ولا قراءة بعد — وهاد وضع طبيعي لمراقبة جديدة.
 */
export function getWatchHistory(watchId: string): Promise<HistoryResponse> {
  return request<HistoryResponse>({
    method: 'GET',
    url: `/api/history/${watchId}`,
  });
}
