import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { Num } from '@/components/ui/Num';
import { useTabBarInset } from '@/components/ui/TabBar';
import { CATEGORIES } from '@/constants/catalog';
import { displayCityName } from '@/constants/saudiCities';
import { useMe } from '@/hooks/useUser';
import { useWatches } from '@/hooks/useWatches';
import { formatNumber } from '@/lib/format';
import { summarizeWatches } from '@/lib/watchDerive';

/** الرئيسية بتعرض أربع فئات متل التصميم — الخامسة بتظهر بشاشة الفلاتر */
const HOME_CATEGORIES = CATEGORIES.slice(0, 4);

const CATEGORY_ICONS = {
  phones: 'phone-portrait-outline',
  laptops: 'laptop-outline',
  headphones: 'headset-outline',
  watches: 'watch-outline',
  tablets: 'tablet-landscape-outline',
} as const satisfies Record<string, keyof typeof Ionicons.glyphMap>;

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <View className="flex-1">
      <Num className={`font-bold text-[22px] ${accent ? 'text-ok' : 'text-tx'}`}>
        {value}
      </Num>
      <Text className="mt-0.5 font-sans text-[11.5px] text-muted">{label}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const { data: user } = useMe();
  const { data: watches } = useWatches();

  const stats = summarizeWatches(watches);
  // المخزّن إنجليزي عشان SerpAPI، والمعروض عربي متل باقي الواجهة
  const city = displayCityName(user?.location.city ?? null) ?? '—';

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingBottom: tabBarInset }}
    >
      <View
        style={{ paddingTop: insets.top + 8 }}
        className="rounded-b-[30px] bg-brand px-6 pb-[62px]"
      >
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="font-sans text-[11.5px] text-white/75">موقعك الحالي</Text>
            <View className="mt-1 flex-row items-center gap-1.5">
              <View className="h-[7px] w-[7px] rounded-full bg-white" />
              <Text className="font-semibold text-[15px] text-white">
                {city}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/notifications')}
            accessibilityRole="button"
            accessibilityLabel="الإشعارات"
            className="h-[38px] w-[38px] items-center justify-center rounded-field bg-white/20"
          >
            <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push('/search')}
          accessibilityRole="search"
          className="mt-5 flex-row items-center gap-3 rounded-card bg-card px-4 py-[15px]"
        >
          <Ionicons name="search" size={17} color="#F0434A" />
          <Text className="flex-1 font-sans text-[13.5px] text-faint">
            دوّر على جهاز… iPhone، لابتوب، سماعات
          </Text>
        </Pressable>
      </View>

      <View className="-mt-10 px-6">
        <Card className="px-[18px] py-[17px]">
          <View className="mb-3.5 flex-row items-center justify-between">
            <Text className="font-semibold text-[14px] text-tx">مراقباتك النشطة</Text>
            <Pressable onPress={() => router.push('/watchlist')} hitSlop={8}>
              <Text className="font-semibold text-[12px] text-brand">الكل</Text>
            </Pressable>
          </View>

          <View className="flex-row gap-5">
            <Stat value={formatNumber(stats.active)} label="جهاز مراقَب" />
            <View className="w-px bg-line" />
            <Stat value={formatNumber(stats.saved)} label="ر.س نزلت" accent />
            <View className="w-px bg-line" />
            <Stat value={formatNumber(stats.alertsThisMonth)} label="تنبيه هذا الشهر" />
          </View>
        </Card>
      </View>

      <View className="px-6 pt-6">
        <Text className="mb-3 font-semibold text-[14px] text-tx">الفئات</Text>
        <View className="flex-row gap-2.5">
          {HOME_CATEGORIES.map((category) => (
            <Pressable
              key={category.id}
              onPress={() =>
                router.push({
                  pathname: '/results',
                  params: { name: category.term },
                })
              }
              style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
              className="flex-1 items-center gap-2 rounded-card border border-line bg-card px-1 pb-2.5 pt-3"
            >
              <View className="h-[26px] w-[26px] items-center justify-center rounded-[9px] bg-tint">
                <Ionicons
                  name={CATEGORY_ICONS[category.id as keyof typeof CATEGORY_ICONS]}
                  size={15}
                  color="#F0434A"
                />
              </View>
              <Text className="font-medium text-[11px] text-tx">{category.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
