import { request } from '@/lib/api/client';
import type {
  UpdateLocationInput,
  UpdatePreferencesInput,
  UpdatePushTokenInput,
  User,
  UserLocation,
  UserPreferences,
} from '@/types/api';

/** GET /api/user/me — المستخدم المحلي من MongoDB، مش من Clerk */
export function getMe(): Promise<User> {
  return request<User>({ method: 'GET', url: '/api/user/me' });
}

/**
 * PATCH /api/user/location
 * بيرجّع كائن الموقع بس، مش المستخدم كامل.
 * لازم ينتنادى قبل أي بحث — بدونه السيرفر بيرفض بـ 403.
 */
export function updateLocation(input: UpdateLocationInput): Promise<UserLocation> {
  return request<UserLocation>({
    method: 'PATCH',
    url: '/api/user/location',
    data: input,
  });
}

/** PATCH /api/user/push-token — بيرجّع المستخدم كامل بعد التحديث */
export function updatePushToken(input: UpdatePushTokenInput): Promise<User> {
  return request<User>({
    method: 'PATCH',
    url: '/api/user/push-token',
    data: input,
  });
}

/**
 * PATCH /api/user/preferences — بيرجّع كائن التفضيلات بس.
 * الكرون بيقرأ pushNotificationsEnabled قبل ما يبعت أي إشعار.
 */
export function updatePreferences(
  input: UpdatePreferencesInput,
): Promise<UserPreferences> {
  return request<UserPreferences>({
    method: 'PATCH',
    url: '/api/user/preferences',
    data: input,
  });
}
