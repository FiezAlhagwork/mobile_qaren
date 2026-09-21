import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Num } from '@/components/ui/Num';
import { ProductThumb } from '@/components/ui/ProductThumb';
import { QueryState } from '@/components/ui/QueryState';
import { useTabBarInset } from '@/components/ui/TabBar';
import { useMarkNotificationsRead, useNotifications } from '@/hooks/useNotifications';
import { countLabel, formatSar, relativeTime } from '@/lib/format';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();

  const { data, isPending, error, refetch } = useNotifications();
  const markRead = useMarkNotificationsRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  // التعليم بينصاب مرة وحدة لكل تحميل للشاشة. بدون الحارس، تحديث الكاش تبع
  // الطفرة بيعيد التصيير فبينطلق النداء من جديد بحلقة
  const marked = useRef(false);

  useEffect(() => {
    if (unreadCount > 0 && !marked.current && !markRead.isPending) {
      marked.current = true;
      markRead.mutate();
    }
  }, [unreadCount, markRead]);

  return (
    <ScrollView
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingBottom: tabBarInset }}
    >
      <View className="px-6 pb-4 pt-2">
        <Text className="font-bold text-[21px] text-tx">الإشعارات</Text>
        <Text className="mt-1 font-sans text-[12px] text-muted">
          {notifications.length > 0
            ? `${countLabel(notifications.length, 'تنبيه واحد', 'تنبيهين', 'تنبيهات', 'تنبيه')} · تنبيهات نزول السعر`
            : 'تنبيهات نزول السعر'}
        </Text>
      </View>

      <View className="px-6">
        <QueryState
          isLoading={isPending}
          error={error}
          isEmpty={!isPending && !error && notifications.length === 0}
          emptyTitle="ما في تنبيهات لحد الآن"
          emptyBody="أول ما ينزل سعر منتج بتراقبه لهدفك، بيوصلك تنبيه وبينحفظ هون."
          emptyIcon="notifications-outline"
          emptyAction={{
            label: 'شوف قائمة المراقبة',
            onPress: () => router.push('/watchlist'),
          }}
          onRetry={() => void refetch()}
        />
      </View>

      <View className="gap-3 px-6">
        {notifications.map((item) => {
          const isUnread = item.readAt === null;
          // المراقبة ممكن تكون انحذفت — الصف بيضل بالسجل بس بلا وجهة
          const openable = !!item.watchId;
          const when = relativeTime(item.createdAt);

          return (
            <Pressable
              key={item._id}
              onPress={() =>
                router.push({
                  pathname: '/history',
                  params: { watchId: item.watchId as string },
                })
              }
              disabled={!openable}
              accessibilityRole={openable ? 'button' : undefined}
              accessibilityLabel={`تنبيه نزول سعر ${item.productName}`}
              style={({ pressed }) => (pressed ? { opacity: 0.75 } : null)}
              className={`rounded-panel border bg-card p-3.5 ${
                isUnread ? 'border-ok' : 'border-line'
              }`}
            >
              <View className="flex-row gap-3">
                <ProductThumb uri={item.productImage} size={60} />

                <View className="min-w-0 flex-1">
                  <View className="mb-1 flex-row items-center gap-2">
                    <Text className="overflow-hidden rounded-pill bg-ok-bg px-2 py-0.5 font-semibold text-[9.5px] text-ok">
                      {isUnread ? 'جديد' : 'تحقق الهدف'}
                    </Text>
                    {when ? (
                      <Text className="font-sans text-[10.5px] text-faint">{when}</Text>
                    ) : null}
                  </View>

                  <Num
                    numberOfLines={2}
                    className="font-semibold text-[13px] leading-[19px] text-tx"
                  >
                    {item.productName}
                  </Num>

                  <Text className="mt-1 font-sans text-[11px] text-muted">
                    نزل عند {item.store}
                  </Text>
                </View>

                {openable ? (
                  <View className="h-7 w-7 items-center justify-center self-center">
                    {/* RTL: التقدّم للأمام يعني لليسار */}
                    <Ionicons name="chevron-back" size={16} color="#9A9DA8" />
                  </View>
                ) : null}
              </View>

              <View className="mt-3.5 flex-row gap-4 border-t border-line pt-3.5">
                <View className="flex-1">
                  <Text className="font-sans text-[10.5px] text-faint">نزل لـ</Text>
                  <Num className="mt-0.5 font-bold text-[14px] text-ok">
                    {formatSar(item.price)}
                  </Num>
                </View>

                <View className="flex-1">
                  <Text className="font-sans text-[10.5px] text-faint">هدفك كان</Text>
                  <Num className="mt-0.5 font-bold text-[14px] text-tx">
                    {formatSar(item.targetPrice)}
                  </Num>
                </View>
              </View>

              {!openable ? (
                <Text className="mt-2.5 font-sans text-[10.5px] text-faint">
                  انحذفت المراقبة — السجل بس
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
