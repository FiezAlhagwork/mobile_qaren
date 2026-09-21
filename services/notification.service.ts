import { request } from '@/lib/api/client';
import type { NotificationsResponse } from '@/types/api';

/**
 * GET /api/notifications
 *
 * آخر 50 تنبيه مرتّبة بالأحدث، مع `unreadCount` محسوب على الكل مش على
 * المرجَّع بس. بترجّع `{ notifications: [], unreadCount: 0 }` لمستخدم جديد —
 * وضع طبيعي مش خطأ.
 */
export function getNotifications(): Promise<NotificationsResponse> {
  return request<NotificationsResponse>({
    method: 'GET',
    url: '/api/notifications',
  });
}

/**
 * PATCH /api/notifications/read — بيعلّم كل غير المقروء كمقروء.
 * بيرجّع `{ updated }` = عدد الصفوف يلي تغيّرت فعليًا.
 */
export function markNotificationsRead(): Promise<{ updated: number }> {
  return request<{ updated: number }>({
    method: 'PATCH',
    url: '/api/notifications/read',
  });
}
