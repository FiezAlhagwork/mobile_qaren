import { useQuery } from '@tanstack/react-query';

import type { ApiError } from '@/lib/api/errors';
import { queryKeys } from '@/lib/query/keys';
import { getWatchHistory } from '@/services/history.service';
import type { HistoryResponse } from '@/types/api';

/**
 * الكرون بيسجّل قراءة وحدة باليوم الساعة 00:00، فـ `staleTime` بيمنع نداءات
 * مكررة بلا فايدة وقت التنقّل جيئة وذهابًا.
 *
 * 🔴 بس `refetchOnMount: 'always'` **ضروري** معه: `refetchOnMount` الافتراضية
 * بتعيد الجلب بس لما تكون البيانات قديمة (stale). فبدونها، لو المستخدم فتح
 * سجل مراقبة جديدة قبل أول فحص، الرد الفاضي بيتخزّن ويضل معروض طول مدة
 * `staleTime` — حتى لو الكرون سجّل قراءة بالأثناء. وهاد بالضبط شو بيصير وقت
 * تشغيل `test-cron.js` يدويًا، وكمان لأي مستخدم بيراقب منتج قبل منتصف الليل.
 *
 * النداء رخيص (استعلام مونغو بس، بلا SerpAPI ولا Gemini) فإعادة الجلب عند كل
 * فتح ما إلها كلفة تُذكر.
 */
export function useWatchHistory(watchId: string | null) {
  return useQuery<HistoryResponse, ApiError>({
    queryKey: queryKeys.history.byWatch(watchId ?? ''),
    queryFn: () => getWatchHistory(watchId as string),
    enabled: !!watchId,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: 'always',
  });
}
