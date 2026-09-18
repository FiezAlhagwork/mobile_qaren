import { useLocalSearchParams } from 'expo-router';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { Num } from '@/components/ui/Num';
import { PriceChart } from '@/components/ui/PriceChart';
import { QueryState } from '@/components/ui/QueryState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useWatchHistory } from '@/hooks/useHistory';
import { useWatches } from '@/hooks/useWatches';
import { countLabel, formatSar, relativeTime } from '@/lib/format';

function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View className="flex-1">
      <Text className="font-sans text-[10.5px] text-faint">{label}</Text>
      <Num
        style={accent ? { color: accent } : undefined}
        className={`mt-0.5 font-bold text-[14px] ${accent ? '' : 'text-tx'}`}
      >
        {value}
      </Num>
    </View>
  );
}

export default function HistoryScreen() {
  // ⚠️ المعرّف هون هو **watchId** مش معرّف منتج — الـ endpoint مربوط بالمراقبة
  const { watchId } = useLocalSearchParams<{ watchId?: string }>();

  // الاسم والهدف موجودين بكاش قائمة المراقبة أصلاً، فما منمرّرهن بالمسار
  const { data: watches } = useWatches();
  const watch = watches?.find((item) => item._id === watchId) ?? null;

  const { data, isPending, isFetching, error, refetch } = useWatchHistory(
    watchId ?? null,
  );

  const points = data?.dataPoints ?? [];
  const stats = data?.stats ?? null;
  const checkedAt = relativeTime(watch?.lastCheckedAt ?? null);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScreenHeader
        title="سجل الأسعار"
        subtitle={watch?.productName ?? 'آخر 30 يوم'}
        className="pb-4 pt-1"
      />

      <ScrollView
        contentContainerClassName="px-6 pb-10"
        // طريقة يدوية تجيب أول قراءة فور ما ينتهي الفحص، بدل انتظار انتهاء
        // صلاحية الكاش
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isPending}
            onRefresh={() => void refetch()}
            tintColor="#F0434A"
            colors={['#F0434A']}
          />
        }
      >
        <QueryState
          isLoading={isPending}
          error={error}
          onRetry={() => void refetch()}
          // مراقبة جديدة بلا قراءات وضع طبيعي تمامًا مش عطل: الكرون بيسجّل
          // قراءة وحدة كل ليلة 12:00، فأول نقطة بتوصل بعد أول فحص
          isEmpty={!isPending && !error && points.length === 0}
          emptyTitle="لسا ما صار فحص"
          emptyBody="منسجّل سعر واحد كل ليلة الساعة 12:00. أول قراءة بتظهر هون بعد فحص الليلة."
          emptyIcon="stats-chart-outline"
        />

        {points.length > 0 ? (
          <>
            <Card className="px-4 pb-4 pt-3">
              <PriceChart points={points} />
            </Card>

            {stats ? (
              <Card className="mt-3 flex-row gap-4 px-[18px] py-4">
                <Stat label="أقل سعر" value={formatSar(stats.min)} accent="#1BA672" />
                <View className="w-px bg-line" />
                <Stat label="أعلى سعر" value={formatSar(stats.max)} />
                <View className="w-px bg-line" />
                <Stat label="المتوسط" value={formatSar(stats.avg)} />
              </Card>
            ) : null}

            {watch ? (
              <Card className="mt-3 flex-row items-center justify-between px-[18px] py-4">
                <Text className="font-sans text-[12.5px] text-muted">سعرك المستهدف</Text>
                <Num className="font-bold text-[14px] text-brand">
                  {formatSar(watch.targetPrice)}
                </Num>
              </Card>
            ) : null}

            <Text className="mt-4 text-center font-sans text-[11px] text-faint">
              {`${countLabel(points.length, 'قراءة وحدة', 'قراءتين', 'قراءات', 'قراءة')}${
                checkedAt ? ` · آخر فحص ${checkedAt}` : ''
              }`}
            </Text>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
