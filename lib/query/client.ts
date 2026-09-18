import NetInfo from '@react-native-community/netinfo';
import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState, Platform, type AppStateStatus } from 'react-native';

// سياسة الإعادة عايشة بملفها الخاص عشان تنختبر بمعزل — هالملف بيسحب
// react-native وNetInfo، وما بينحمّل برّا التطبيق
import { retry } from './retry';

export { retry, retryUserFetch, userFetchRetryDelay } from './retry';

/** كاش الذكاء الاصطناعي بالسيرفر عمره 24 ساعة — ما في فايدة نسأل قبلها */
export const AI_STALE_TIME = 1000 * 60 * 60 * 24;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry,
      staleTime: 1000 * 60, // دقيقة
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: true, // بيشتغل بس بعد ضبط focusManager تحت
    },
    mutations: {
      retry: false, // الطلبات يلي بتغيّر حالة ما بتنعاد تلقائيًا
    },
  },
});

/**
 * ضبط خاص بـ React Native — TanStack Query ما بيعمله لحاله.
 * بدون هالسطر، الاستعلامات ما بترجع لحالها لما يرجع الاتصال.
 */
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(!!state.isConnected)),
);

/**
 * وبدون هاد، refetchOnWindowFocus ما إلها أي أثر بـ RN — ما في نافذة
 * تاخد focus، فمنستخدم AppState محلها.
 */
export function useAppStateFocus(): void {
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (status: AppStateStatus) => {
        if (Platform.OS !== 'web') {
          focusManager.setFocused(status === 'active');
        }
      },
    );
    return () => subscription.remove();
  }, []);
}
