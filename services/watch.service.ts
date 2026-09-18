import { request, requestVoid } from '@/lib/api/client';
import type { CreateWatchInput, Watch } from '@/types/api';

/** GET /api/watches — من الأحدث للأقدم. بترجّع [] مش 404 لما ما يكون في شي */
export function getWatches(): Promise<Watch[]> {
  return request<Watch[]>({ method: 'GET', url: '/api/watches' });
}

/**
 * POST /api/watches
 * صلاحية المراقبة 30 يوم بينحسبوا بالسيرفر.
 * بيرمي 409 لو نفس المنتج مراقَب أصلاً (unique index على userId+productId).
 */
export function createWatch(input: CreateWatchInput): Promise<Watch> {
  return request<Watch>({ method: 'POST', url: '/api/watches', data: input });
}

/**
 * DELETE /api/watches/:id
 * ما بيرجّع data. مقيّد بالمالك — 404 لو مش موجودة أو مش ملك المستخدم
 * (نفس الرسالة للحالتين عن قصد، منعًا لتسريب المعلومات).
 */
export function deleteWatch(watchId: string): Promise<void> {
  return requestVoid({ method: 'DELETE', url: `/api/watches/${watchId}` });
}
