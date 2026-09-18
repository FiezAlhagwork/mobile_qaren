import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfidenceBar } from '@/components/ui/ConfidenceBar';
import { MissingProduct } from '@/components/ui/MissingProduct';
import { Num } from '@/components/ui/Num';
import { QueryState } from '@/components/ui/QueryState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useRecommendation } from '@/hooks/useAi';
import { formatSar } from '@/lib/format';
import { getSelectedProduct } from '@/lib/selectedProduct';

const OK = '#1BA672';
const WARN = '#F5A623';

export default function RecommendScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const product = getSelectedProduct(productId ?? null);

  const {
    data,
    isPending,
    error,
    refetch,
  } = useRecommendation(
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
    // الوصول لهالشاشة **هو** طلب التحليل — ما في داعي لزر «حلّل» زيادة.
    // الـ hook معطّل افتراضيًا لأن النداء بيكلّف طلب Gemini
    { enabled: true },
  );

  if (!product) return <MissingProduct />;

  const buyNow = data?.decision === 'buy_now';

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScreenHeader
        title="اشتري أو استنّى؟"
        subtitle={product.name}
        className="pb-4 pt-1"
      />

      <ScrollView contentContainerClassName="px-6 pb-10">
        <QueryState
          isLoading={isPending}
          loadingMessage="عم نحلّل السعر…"
          loadingHint="منقارن سعر اليوم بدورة خصومات هالفئة وعمر الموديل."
          error={error}
          onRetry={() => void refetch()}
        />

        {data ? (
          <>
            <Card className="items-center p-5">
              <View
                style={{ backgroundColor: buyNow ? '#E7F7F0' : '#FDF3E3' }}
                className="h-[64px] w-[64px] items-center justify-center rounded-panel"
              >
                <Ionicons
                  name={buyNow ? 'cart' : 'hourglass-outline'}
                  size={26}
                  color={buyNow ? OK : WARN}
                />
              </View>

              <Text
                style={{ color: buyNow ? OK : WARN }}
                className="mt-3 font-bold text-[21px]"
              >
                {buyNow ? 'اشترِ الآن' : 'استنّى'}
              </Text>

              <Num className="mt-1 font-sans text-[12px] text-muted">
                {`السعر الحالي ${formatSar(product.price)}`}
              </Num>

              <Text className="mt-3.5 text-center font-sans text-[13px] leading-[24px] text-tx">
                {data.reason}
              </Text>

              <ConfidenceBar value={data.confidence} className="mt-5 self-stretch" />
            </Card>

            {/* مصدر التحليل بيفرق بمصداقية التوصية: الموجّه بالسيرفر بيطلب من
                النموذج ينزّل ثقته لما ما يكون في سجل، فلازم المستخدم يعرف */}
            <View className="mt-3 flex-row items-start gap-2.5 rounded-btn border border-line bg-card px-4 py-3.5">
              <Ionicons
                name={data.basedOnHistory ? 'analytics-outline' : 'globe-outline'}
                size={15}
                color="#7C808C"
              />
              <Text className="flex-1 font-sans text-[11.5px] leading-[21px] text-muted">
                {data.basedOnHistory
                  ? 'التوصية مبنية على سجل الأسعار المسجّل عنا لهالمنتج.'
                  : 'ما في سجل أسعار محفوظ لهالمنتج، فالتحليل مبني على دورة حياة الموديل وخصومات فئته.'}
              </Text>
            </View>

            {!buyNow ? (
              <Button
                label="راقب السعر وخلّينا نخبرك"
                onPress={() =>
                  router.push({
                    pathname: '/watch-add',
                    params: { productId: product.id as string },
                  })
                }
                className="mt-5"
              />
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
