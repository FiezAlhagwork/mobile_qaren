import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QueryState } from './QueryState';

/**
 * المنتج المختار محفوظ بـ Map بالذاكرة مش بمعاملات المسار (السبب مشروح
 * بـ `lib/selectedProduct.ts`). يعني لو انتعاد تحميل الحزمة والمستخدم بشاشة
 * منتج — أو فتح رابط عميق — بيوصل لهون بلا منتج.
 *
 * بتستعملها الشاشات التلاتة يلي بتقرا من نفس الـ Map: المنتج، التوصية،
 * والتوقّع.
 */
export function MissingProduct() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 justify-center bg-bg px-6">
      <QueryState
        isEmpty
        emptyTitle="ما لقينا المنتج"
        emptyBody="ارجع للبحث وافتح المنتج من جديد."
        emptyIcon="cube-outline"
        emptyAction={{ label: 'ارجع للبحث', onPress: () => router.replace('/search') }}
      />
    </SafeAreaView>
  );
}
