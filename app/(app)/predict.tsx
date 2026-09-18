import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Card';
import { ConfidenceBar } from '@/components/ui/ConfidenceBar';
import { MissingProduct } from '@/components/ui/MissingProduct';
import { Num } from '@/components/ui/Num';
import { QueryState } from '@/components/ui/QueryState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { usePrediction } from '@/hooks/useAi';
import { countLabel } from '@/lib/format';
import { getSelectedProduct } from '@/lib/selectedProduct';
import type { BestTimeToBuy, PredictionFactors, Trend } from '@/types/api';

type IconName = keyof typeof Ionicons.glyphMap;

/** نزول السعر خبر منيح للمشتري، فهو الأخضر — مش الأحمر */
const TREND: Record<Trend, { label: string; icon: IconName; color: string; bg: string }> = {
  falling: { label: 'نازل', icon: 'trending-down', color: '#1BA672', bg: '#E7F7F0' },
  rising: { label: 'طالع', icon: 'trending-up', color: '#F0434A', bg: '#FDECEC' },
  stable: { label: 'ثابت', icon: 'remove-outline', color: '#7C808C', bg: '#F2F2F6' },
};

const BEST_TIME: Record<BestTimeToBuy, string> = {
  now: 'الوقت مناسب للشراء',
  soon: 'الأفضل تنتظر شوي',
  wait: 'الأفضل تستنّى',
};

/** ترتيب العوامل هون هو ترتيب الموجّه بالسيرفر — من الأقوى للأضعف أثرًا */
const FACTORS: { key: keyof PredictionFactors; label: string; icon: IconName }[] = [
  { key: 'priceHistory', label: 'سعره بالسوق', icon: 'stats-chart-outline' },
  { key: 'productLifecycle', label: 'عمر الموديل', icon: 'hourglass-outline' },
  { key: 'currentDiscounts', label: 'الخصومات الحالية', icon: 'pricetag-outline' },
  { key: 'marketBehavior', label: 'سلوك السوق', icon: 'storefront-outline' },
];

export default function PredictScreen() {
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const product = getSelectedProduct(productId ?? null);

  const { data, isPending, error, refetch } = usePrediction(
    product
      ? {
          productId: product.id as string,
          name: product.name,
          price: product.price,
          store: product.store,
          rating: product.rating,
          reviews: product.reviews,
        }
      : null,
    { enabled: true },
  );

  if (!product) return <MissingProduct />;

  const trend = data ? TREND[data.trend] : null;

  // الإشارة هي المعنى: سالب = نزول متوقّع. النص بيعرض القيمة المطلقة مع
  // الفعل المناسب، وإلا بتطلع «ينزل ‎−8%» ونفي مزدوج
  const change = data ? Math.round(data.expectedChangePercent) : 0;
  const weeks = data
    ? countLabel(data.horizonWeeks, 'أسبوع', 'أسبوعين', 'أسابيع', 'أسبوع')
    : '';
  const outlook =
    change === 0
      ? `السعر متوقّع يثبت خلال ${weeks}`
      : `متوقّع ${change < 0 ? 'ينزل' : 'يطلع'} ${Math.abs(change)}% خلال ${weeks}`;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScreenHeader title="توقّع السعر" subtitle={product.name} className="pb-4 pt-1" />

      <ScrollView contentContainerClassName="px-6 pb-10">
        <QueryState
          isLoading={isPending}
          loadingMessage="عم نتوقّع اتجاه السعر…"
          loadingHint="منوزن سعره بالسوق وعمر الموديل والخصومات وموسم العروض."
          error={error}
          onRetry={() => void refetch()}
        />

        {data && trend ? (
          <>
            <Card className="p-5">
              <View className="flex-row items-center gap-3">
                <View
                  style={{ backgroundColor: trend.bg }}
                  className="h-[52px] w-[52px] items-center justify-center rounded-field"
                >
                  <Ionicons name={trend.icon} size={24} color={trend.color} />
                </View>

                <View className="min-w-0 flex-1">
                  <Text
                    style={{ color: trend.color }}
                    className="font-bold text-[17px]"
                  >
                    {`الاتجاه ${trend.label}`}
                  </Text>
                  <Num className="mt-1 font-sans text-[12.5px] text-muted">
                    {outlook}
                  </Num>
                </View>
              </View>

              <View className="mt-4 flex-row items-center gap-2 self-start rounded-pill bg-tint px-3.5 py-2">
                <Ionicons name="time-outline" size={13} color="#F0434A" />
                <Text className="font-semibold text-[11.5px] text-brand">
                  {BEST_TIME[data.bestTimeToBuy]}
                </Text>
              </View>

              <ConfidenceBar value={data.confidence} className="mt-5" />
            </Card>

            <Text className="mb-2.5 mt-6 font-semibold text-[14px] text-tx">التحليل</Text>
            <Card className="px-[18px] py-4">
              <Text className="font-sans text-[13px] leading-[24px] text-tx">
                {data.analysis}
              </Text>
            </Card>

            <Text className="mb-2.5 mt-6 font-semibold text-[14px] text-tx">
              على شو مبني التوقّع
            </Text>
            <View className="gap-2.5">
              {FACTORS.map((factor) => (
                <Card key={factor.key} className="flex-row gap-3 px-4 py-3.5">
                  <View className="h-[30px] w-[30px] items-center justify-center rounded-[10px] bg-chip">
                    <Ionicons name={factor.icon} size={15} color="#7C808C" />
                  </View>

                  <View className="min-w-0 flex-1">
                    <Text className="font-semibold text-[12.5px] text-tx">
                      {factor.label}
                    </Text>
                    <Text className="mt-1 font-sans text-[11.5px] leading-[21px] text-muted">
                      {data.factors[factor.key]}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>

            {/* التنبؤ ما بيلمس سجل الأسعار عنا إطلاقًا — منقولها صريحة عشان
                المستخدم ما يفهم إنه الرقم مبني على مراقباته */}
            <Text className="mt-5 text-center font-sans text-[10.5px] leading-[19px] text-faint">
              توقّع اجتهادي مبني على تحليل السوق، مش على قراءات مسجّلة عنا.
            </Text>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
