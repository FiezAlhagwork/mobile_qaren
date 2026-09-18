import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/ui/Chip';
import { Num } from '@/components/ui/Num';
import { ProductThumb } from '@/components/ui/ProductThumb';
import { QueryState } from '@/components/ui/QueryState';
import { useTabBarInset } from '@/components/ui/TabBar';
import { useToast } from '@/components/ui/Toast';
import { useDeleteWatch, useWatches } from '@/hooks/useWatches';
import { countLabel, formatNumber, formatSar, relativeTime } from '@/lib/format';
import { deriveWatch } from '@/lib/watchDerive';

type Filter = 'all' | 'active' | 'hit';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'active', label: 'نشطة' },
  { key: 'hit', label: 'تحقق الهدف' },
];

export default function WatchlistScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tabBarInset = useTabBarInset();
  const toast = useToast();

  const [filter, setFilter] = useState<Filter>('all');
  const { data: watches, isPending, error, refetch } = useWatches();
  const deleteWatch = useDeleteWatch();

  const rows = useMemo(() => {
    const list = watches ?? [];
    return list
      .map((watch) => ({ watch, derived: deriveWatch(watch) }))
      .filter(({ watch, derived }) => {
        if (filter === 'active') return watch.isActive && !derived.hitTarget;
        if (filter === 'hit') return derived.hitTarget;
        return true;
      });
  }, [watches, filter]);

  const activeCount = watches?.filter((watch) => watch.isActive).length ?? 0;

  const onDelete = (watchId: string) => {
    deleteWatch.mutate(watchId, {
      onSuccess: () => toast.show('تم حذف المراقبة'),
    });
  };

  return (
    <ScrollView
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingBottom: tabBarInset }}
    >
      <View className="flex-row items-end justify-between px-6 pb-4 pt-2">
        <View>
          <Text className="font-bold text-[21px] text-tx">قائمة المراقبة</Text>
          <Text className="mt-1 font-sans text-[12px] text-muted">
            {activeCount > 0
              ? `${countLabel(activeCount, 'مراقبة وحدة', 'مراقبتين', 'مراقبات', 'مراقبة')} نشطة · الفحص كل ليلة 12:00`
              : 'ما في مراقبات'}
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/search')}
          accessibilityRole="button"
          accessibilityLabel="أضف مراقبة"
          className="h-9 w-9 items-center justify-center rounded-field bg-brand"
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </Pressable>
      </View>

      {watches && watches.length > 0 ? (
        <View className="flex-row gap-2 px-6 pb-4">
          {FILTERS.map((item) => (
            <Chip
              key={item.key}
              label={item.label}
              selected={filter === item.key}
              onPress={() => setFilter(item.key)}
            />
          ))}
        </View>
      ) : null}

      <View className="px-6">
        <QueryState
          isLoading={isPending}
          error={error}
          isEmpty={!isPending && !error && rows.length === 0}
          emptyTitle={
            watches?.length ? 'ما في مراقبات بهالتصنيف' : 'ما في مراقبات لحد الآن'
          }
          emptyBody={
            watches?.length
              ? 'جرّب تصنيف تاني.'
              : 'دوّر على جهاز، افتح تفاصيله، وحدّد السعر اللي بدك نراقبه لك.'
          }
          emptyIcon="eye-outline"
          emptyAction={
            watches?.length
              ? undefined
              : { label: 'ابدأ البحث', onPress: () => router.push('/search') }
          }
          onRetry={() => void refetch()}
        />
      </View>

      <View className="gap-3 px-6">
        {rows.map(({ watch, derived }) => {
          const checkedAt = relativeTime(watch.lastCheckedAt);

          return (
            <Pressable
              key={watch._id}
              onPress={() =>
                router.push({ pathname: '/history', params: { watchId: watch._id } })
              }
              accessibilityRole="button"
              accessibilityLabel={`سجل أسعار ${watch.productName}`}
              style={({ pressed }) => (pressed ? { opacity: 0.75 } : null)}
              className="rounded-panel border border-line bg-card p-3.5"
            >
              <View className="flex-row gap-3">
                <ProductThumb uri={watch.productImage} size={60} />

                <View className="min-w-0 flex-1">
                  <View className="mb-1 flex-row items-center gap-2">
                    <Text
                      className={`overflow-hidden rounded-pill px-2 py-0.5 font-semibold text-[9.5px] ${
                        derived.hitTarget ? 'bg-ok-bg text-ok' : 'bg-tint text-brand'
                      }`}
                    >
                      {derived.hitTarget ? 'تحقق الهدف' : 'نشطة'}
                    </Text>
                    <Text className="font-sans text-[10.5px] text-faint">
                      {checkedAt ? `آخر فحص ${checkedAt}` : 'لسا ما صار فحص'}
                    </Text>
                  </View>

                  <Num numberOfLines={2} className="font-semibold text-[13px] leading-[19px] text-tx">
                    {watch.productName}
                  </Num>
                  <Text className="mt-1 font-sans text-[11px] text-muted">
                    أرخص عند {watch.store}
                  </Text>
                </View>

                <Pressable
                  onPress={() => onDelete(watch._id)}
                  disabled={deleteWatch.isPending}
                  accessibilityRole="button"
                  accessibilityLabel="احذف المراقبة"
                  hitSlop={6}
                  className="h-7 w-7 items-center justify-center rounded-[9px] bg-chip"
                >
                  <Ionicons name="close" size={15} color="#7C808C" />
                </Pressable>
              </View>

              <View className="mt-3.5 flex-row gap-4 border-t border-line pt-3.5">
                <View className="flex-1">
                  <Text className="font-sans text-[10.5px] text-faint">السعر الآن</Text>
                  <Num className="mt-0.5 font-bold text-[14px] text-tx">
                    {formatSar(derived.currentPrice)}
                  </Num>
                  {!derived.hasReading ? (
                    <Text className="mt-0.5 font-sans text-[10px] text-faint">
                      سعر الإضافة — لسا ما صار فحص
                    </Text>
                  ) : null}
                </View>

                <View className="flex-1">
                  <Text className="font-sans text-[10.5px] text-faint">هدفك</Text>
                  <Num className="mt-0.5 font-bold text-[14px] text-brand">
                    {formatSar(watch.targetPrice)}
                  </Num>
                </View>
              </View>

              <View className="mt-3 h-[5px] overflow-hidden rounded-[3px] bg-chip">
                <View
                  style={{ width: `${Math.round(derived.progress * 100)}%` }}
                  className={`h-full rounded-[3px] ${
                    derived.hitTarget ? 'bg-ok' : 'bg-brand'
                  }`}
                />
              </View>

              <Text className="mt-1.5 font-sans text-[10.5px] text-faint">
                {derived.hitTarget
                  ? 'وصل لهدفك — تم إرسال الإشعار'
                  : `باقي ${formatNumber(derived.remaining)} ر.س لحد هدفك`}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
