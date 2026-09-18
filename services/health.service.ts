import { apiClient } from '@/lib/api/client';
import type { HealthResponse } from '@/types/api';

/**
 * GET /health — بدون مصادقة.
 *
 * ⚠️ بيستخدم apiClient مباشرة مش request<T>، لأن ردّه { status: "ok" } وما
 * بيمر عبر successResponse — يعني ما إلو غلاف { success, message, data }.
 *
 * هاد الـ endpoint الوحيد يلي بيشتغل بدون توكن، فهو الطريقة الوحيدة للتأكد
 * إنه الـ base URL وaxios موصولين صح قبل ما تنبني شاشات الدخول.
 */
export async function checkHealth(): Promise<HealthResponse> {
  const response = await apiClient.get<HealthResponse>('/health');
  return response.data;
}
