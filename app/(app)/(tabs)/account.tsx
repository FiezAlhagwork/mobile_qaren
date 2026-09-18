import { useAuth } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Num } from '@/components/ui/Num';
import { useTabBarInset } from '@/components/ui/TabBar';
import { displayCityName } from '@/constants/saudiCities';
import { useMe, useUpdatePreferences } from '@/hooks/useUser';
import { clearSelectedProducts } from '@/lib/selectedProduct';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between border-b border-line px-4 py-3.5">
      <Text className="font-sans text-[12.5px] text-muted">{label}</Text>
      <Num className="font-medium text-[12.5px] text-tx">{value}</Num>
    </View>
  );
}

/**
 * نسخة مصغّرة من شاشة الحساب: بيانات الحساب، مفتاح الإشعارات، وتسجيل الخروج.
 * الوضع الغامق واختيار العملة والروابط بتنضاف بالدفعة التانية.
 */
export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const router = useRouter();
  const { signOut } = useAuth();
  const { data: user } = useMe();
  const updatePreferences = useUpdatePreferences();

  // المخزّن إنجليزي (لأن السيرفر بيترجمه لموقع SerpAPI)، والمعروض عربي
  const city = displayCityName(user?.location.city ?? null) ?? '—';

  const onSignOut = async () => {
    // الـ Map تبع المنتجات المختارة ما بتنمسح مع كاش الاستعلامات، فمنفضّيها
    // هون — وإلا بتضل منتجات المستخدم السابق بالذاكرة
    clearSelectedProducts();
    await signOut();
  };

  return (
    <ScrollView
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-bg"
      // كلها بـ style وحدة: `contentContainerClassName` بينحوّل لنفس الخاصية
      // بـ NativeWind، فخلطهم بيخلي وحدة تدعس التانية
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: tabBarInset }}
    >
      <Text className="mb-5 font-bold text-[21px] text-tx">حسابي</Text>

      <Card className="mb-4 overflow-hidden">
        <Row label="البريد الإلكتروني" value={user?.email ?? '—'} />

        <Pressable
          // `mode=change` بتخلي شاشة المدينة تعرض زر رجوع وترجع لهون بعد الحفظ،
          // بدل ما تتصرف كأنها أول مرة وتروح للرئيسية
          onPress={() =>
            router.push({ pathname: '/location', params: { mode: 'change' } })
          }
          accessibilityRole="button"
          style={({ pressed }) => (pressed ? { opacity: 0.6 } : null)}
          className="flex-row items-center justify-between border-b border-line px-4 py-3.5"
        >
          <Text className="font-sans text-[12.5px] text-muted">المدينة</Text>
          <View className="flex-row items-center gap-2">
            <Text className="font-medium text-[12.5px] text-tx">{city}</Text>
            <Ionicons name="chevron-back" size={14} color="#9A9DA8" />
          </View>
        </Pressable>
        <View className="flex-row items-center justify-between px-4 py-3.5">
          <View className="flex-1 pl-3">
            <Text className="font-sans text-[12.5px] text-tx">إشعارات نزول السعر</Text>
            <Text className="mt-0.5 font-sans text-[10.5px] text-muted">
              بتنطبق على كل المراقبات
            </Text>
          </View>
          <Switch
            value={user?.preferences.pushNotificationsEnabled ?? true}
            onValueChange={(next) =>
              updatePreferences.mutate({ pushNotificationsEnabled: next })
            }
            trackColor={{ false: '#DEDEE4', true: '#F0434A' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </Card>

      <Button label="تسجيل الخروج" onPress={() => void onSignOut()} variant="secondary" />
    </ScrollView>
  );
}
