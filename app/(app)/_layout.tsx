import { useAuth } from '@clerk/expo';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { QueryState } from '@/components/ui/QueryState';
import { ToastProvider } from '@/components/ui/Toast';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useMe } from '@/hooks/useUser';

function AppNavigator() {
  const { data: user, isPending, error, refetch, failureCount, failureReason } =
    useMe();
  const { handleApiError } = useAuthGuard();
  const { signOut } = useAuth();

  // جلسة Clerk ممكن تكون انسحبت وهي مخزّنة محليًا — أول 401 بيصير خروج فعلي
  useEffect(() => {
    if (error) void handleApiError(error);
  }, [error, handleApiError]);

  if (isPending) {
    /**
     * 404 مع محاولات فاشلة = المستخدم انعمل عند Clerk وبعدو بالطريق لقاعدة
     * بياناتنا عبر الـ webhook. الانتظار ممكن يوصل لدقيقة، ودوّارة صامتة
     * هالمدة بتخلي المستخدم يحسب إنه التطبيق علق.
     *
     * الشرط `failureCount > 0` مقصود: بالتحميل العادي السريع ما بتومض أي
     * رسالة، بتظهر بس لما يصير في انتظار فعلي وسببه معروف.
     */
    const settingUpAccount = failureCount > 0 && failureReason?.isNotFound === true;

    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <QueryState
          isLoading
          loadingMessage={settingUpAccount ? 'عم نجهّز حسابك…' : undefined}
          loadingHint={
            settingUpAccount
              ? 'حسابك انعمل، وعم ننتظر يوصل للخادم. ثواني وبنخلص.'
              : undefined
          }
        />
      </View>
    );
  }

  // أهم حالة هون هي 404: المستخدم انعمل عند Clerk بس الـ webhook ما وصل
  // للخادم. بدون رسالة صريحة، التطبيق بيضل يدوّر بلا سبب واضح
  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-bg px-6">
        <QueryState error={error} onRetry={() => void refetch()} />
        <Button
          label="تسجيل الخروج"
          onPress={() => void signOut()}
          variant="ghost"
          className="mt-6 self-center"
        />
      </SafeAreaView>
    );
  }

  // الموقع إجباري قبل أي بحث — الباك إند بيرجّع 403 بدونه. منمنع الوصول
  // للتابات أصلاً بدل ما نترك المستخدم يوصل لشاشة بحث ميتة
  const hasLocation = !!user?.location?.city;

  /**
   * ⚠️ ترتيب الشاشات تحت **مش تجميلي** — أول شاشة متاحة هي المسار الابتدائي
   * للمجموعة. لما تكون الشاشات معلنة صراحةً، `getSortedChildren` بتستخدم
   * ترتيب الإعلان حرفيًا و`unstable_settings` بتنتجاهل بصمت.
   *
   * فالكتلة المحمية لازم تجي **قبل** `location`:
   *   • في موقع    → `(tabs)` أول شاشة متاحة ← المدخل الصحيح
   *   • ما في موقع → المحميات بتنفلتر، وما بيبقى غير `location`
   *
   * و`location` برّا الحارس عن قصد عشان تضل مفتوحة لتغيير المدينة من «حسابي»
   * بعد ما ينتحدد الموقع — بس لهيك ما عاد في شي بيطلّع الملاح منها لحاله،
   * فالتنقّل بعد الحفظ صار صريح جوا الشاشة نفسها.
   */
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={hasLocation}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="search" />
        <Stack.Screen name="filters" />
        <Stack.Screen name="results" />
        <Stack.Screen name="product" />
        <Stack.Screen name="watch-add" />
        <Stack.Screen name="recommend" />
        <Stack.Screen name="predict" />
        <Stack.Screen name="history" />
      </Stack.Protected>

      <Stack.Screen name="location" />
    </Stack>
  );
}

export default function AppLayout() {
  return (
    <ToastProvider>
      <AppNavigator />
    </ToastProvider>
  );
}
