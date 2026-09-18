import { Stack } from 'expo-router';

/**
 * ⚠️ الشاشات معلَنة صراحةً عن قصد — ترتيبها هون هو يلي بيحدد المسار الابتدائي.
 *
 * بدون إعلان، expo-router بيرتّب الإخوة بـ `sortRoutes`، وآخر سطر فيها حرفيًا
 * `a.route.length - b.route.length` — ترتيب **بطول الاسم**. يعني `verify` (6
 * حروف) كانت تسبق `sign-in` و`sign-up` (7)، وشاشة كود التحقق كانت تفتح كأول
 * شاشة بالتطبيق. حرف واحد.
 *
 * و`unstable_settings` ما بتنفع بديل: أول ما تنعلن الشاشات، `getSortedChildren`
 * بتستخدم ترتيب الإعلان حرفيًا وبتتجاهلها.
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="verify" />
    </Stack>
  );
}
