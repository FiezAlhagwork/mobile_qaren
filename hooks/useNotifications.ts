import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ApiError } from '@/lib/api/errors';
import { queryKeys } from '@/lib/query/keys';
import {
  getNotifications,
  markNotificationsRead,
} from '@/services/notification.service';
import type { NotificationsResponse } from '@/types/api';

/**
 * بينستعمل بمكانين: شاشة الإشعارات، و`(tabs)/_layout.tsx` للنقطة على التاب.
 * نفس مفتاح الاستعلام، فالتنين بيتشاركوا نفس النداء بلا تكرار.
 *
 * `refetchOnMount: 'always'` لنفس سبب `useHistory`: الكرون بيكتب ليلًا،
 * فبدونها ممكن المستخدم يفتح الشاشة ويشوف رد فاضي مخزّن من قبل التنبيه.
 * النداء رخيص — استعلام مونغو بس، بلا SerpAPI ولا Gemini.
 */
export function useNotifications() {
  return useQuery<NotificationsResponse, ApiError>({
    queryKey: queryKeys.notifications.list(),
    queryFn: getNotifications,
    refetchOnMount: 'always',
  });
}

/**
 * ⚠️ ما بتبطّل الاستعلام عن قصد.
 *
 * التبطيل بيعيد الجلب فورًا فبتختفي شارات «جديد» من تحت إيد المستخدم وهو
 * عم يقرأ. بدل هيك منحدّث الكاش موضعيًا: `unreadCount` بيصير صفر (فالنقطة
 * بتختفي من التاب فورًا) بينما `readAt` تبع الصفوف بيضل متل ما هو، فالشارات
 * بتضل ظاهرة لهالجلسة. أول `refetchOnMount` جاي بيجيب الحقيقة من السيرفر.
 */
export function useMarkNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation<{ updated: number }, ApiError, void>({
    mutationFn: markNotificationsRead,
    onSuccess: () => {
      queryClient.setQueryData<NotificationsResponse>(
        queryKeys.notifications.list(),
        (current) => (current ? { ...current, unreadCount: 0 } : current),
      );
    },
  });
}
