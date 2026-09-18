import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query/keys';
import {
  getMe,
  updateLocation,
  updatePreferences,
  updatePushToken,
} from '@/services/user.service';
import { retryUserFetch, userFetchRetryDelay } from '@/lib/query/client';
import type { ApiError } from '@/lib/api/errors';
import type {
  UpdateLocationInput,
  UpdatePreferencesInput,
  UpdatePushTokenInput,
  User,
  UserLocation,
  UserPreferences,
} from '@/types/api';

/**
 * الـ404 هون عابرة بطبيعتها بعد التسجيل — الـ webhook لسا ما وصل.
 * التفاصيل والسبب بـ `retryUserFetch` داخل lib/query/client.ts
 */
export function useMe() {
  return useQuery<User, ApiError>({
    queryKey: queryKeys.user.me(),
    queryFn: getMe,
    retry: retryUserFetch,
    retryDelay: userFetchRetryDelay,
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation<UserLocation, ApiError, UpdateLocationInput>({
    mutationFn: updateLocation,
    onSuccess: (location) => {
      // الرد هو كائن الموقع الجديد، فمنرقّعه بالمستخدم المخزّن **فورًا** بدل
      // ما ننتظر دورة الشبكة تبع الإبطال. مهم: حارس (app)/_layout بيقرأ
      // `location.city` ليقرر إذا التابات متاحة، وشاشة المدينة بتنتظر هالقلبة
      // لتنتقل — لو انتظرنا الجلب، بيضل المستخدم واقف بالشاشة بلا سبب ظاهر
      queryClient.setQueryData<User>(queryKeys.user.me(), (current) =>
        current ? { ...current, location } : current,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.user.me() });
      // البحث كان محجوب بـ 403 قبل ما ينتحدد الموقع — هلأ صار ممكن،
      // فأي نتيجة بحث فاشلة مخزّنة لازم تنرمى
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
}

export function useUpdatePushToken() {
  const queryClient = useQueryClient();

  return useMutation<User, ApiError, UpdatePushTokenInput>({
    mutationFn: updatePushToken,
    onSuccess: (user) => {
      // الرد هو المستخدم كامل، فمنحطّه بالكاش مباشرة بدل نداء إضافي
      queryClient.setQueryData(queryKeys.user.me(), user);
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation<UserPreferences, ApiError, UpdatePreferencesInput>({
    mutationFn: updatePreferences,
    onSuccess: (preferences) => {
      // الرد هو التفضيلات بس — منرقّعها جوا المستخدم المخزّن بدل نداء جديد
      queryClient.setQueryData<User>(queryKeys.user.me(), (current) =>
        current ? { ...current, preferences } : current,
      );
    },
  });
}
