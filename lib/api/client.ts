import { getClerkInstance } from '@clerk/expo';
import axios, { type AxiosRequestConfig } from 'axios';

import { env } from '@/lib/env';
import type { ApiEnvelope } from '@/types/api';
import { toApiError } from './errors';

/**
 * مهلة 30 ثانية مش الافتراضية: gemini.service.js بالسيرفر عندو مهلة داخلية
 * 20 ثانية، وبحث SerpAPI بياخد ثانية أو أكتر. مهلة أقصر بتقطع نداءات سليمة.
 */
const TIMEOUT_MS = 30_000;

// eslint-disable-next-line import/no-named-as-default-member
export const apiClient = axios.create({
  baseURL: env.API_URL,
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * التوكن بينجلب بكل طلب — توكنات جلسة Clerk قصيرة العمر، فتخزينها بمتغير
 * بيعني 401 بعد دقيقة. وبنستخدم getClerkInstance() مش useAuth() لأن هاد
 * interceptor مش React component.
 */
apiClient.interceptors.request.use(async (config) => {
  const token = await getClerkInstance().session?.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// كل خطأ بيطلع من الطبقة كـ ApiError، ولا مرة كخطأ axios خام
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(toApiError(error)),
);

/**
 * بيفك غلاف { success, message, data } فالـ services بترجّع بيانات نضيفة.
 *
 * ⚠️ /health ما بيمر من هون — بيرجّع { status: "ok" } مش الغلاف الموحّد.
 */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<ApiEnvelope<T>>(config);
  return response.data.data as T;
}

/** للـ endpoints يلي ما بترجّع data (متل حذف المراقبة) */
export async function requestVoid(config: AxiosRequestConfig): Promise<void> {
  await apiClient.request<ApiEnvelope<never>>(config);
}
