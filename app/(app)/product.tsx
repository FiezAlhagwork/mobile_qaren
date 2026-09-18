import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { MissingProduct } from '@/components/ui/MissingProduct';
import { Num } from '@/components/ui/Num';
import { QueryState } from '@/components/ui/QueryState';
import { BackButton } from '@/components/ui/ScreenHeader';
import { useProductDetails } from '@/hooks/useProductDetails';
import { formatNumber, formatRating, formatSar } from '@/lib/format';
import { getSelectedProduct } from '@/lib/selectedProduct';

/** مدخل لشاشة تحليل — كل ضغطة عليه بتكلّف نداء Gemini، فالنص بيقول شو رح يصير */
function AiEntry({
  title,
  hint,
  icon,
  onPress,
}: {
  title: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
      className="flex-1 gap-1.5 rounded-btn border border-line bg-card px-3.5 py-3.5"
    >
      <View className="h-[26px] w-[26px] items-center justify-center rounded-[9px] bg-tint">
        <Ionicons name={icon} size={14} color="#F0434A" />
      </View>
      <Text className="font-semibold text-[12.5px] text-tx">{title}</Text>
      <Text className="font-sans text-[10.5px] leading-[17px] text-muted">{hint}</Text>
    </Pressable>
  );
}

export default function ProductScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { productId } = useLocalSearchParams<{ productId?: string }>();

  const product = getSelectedProduct(productId ?? null);
  const { data, isPending, error, refetch } = useProductDetails(
    productId ?? null,
    product?.productToken ?? null,
  );

  // ممكن يوصل هون بلا منتج محفوظ لو انتعاد تحميل الحزمة وهو بالشاشة
  if (!product) return <MissingProduct />;

  const heroUri = data?.images?.[0] ?? product.image;
  const price = data?.cheapest?.price ?? product.price;
  const cheapestStore = data?.cheapest?.name ?? product.store;
  const rating = data?.rating ?? product.rating;
  const reviews = data?.reviews ?? product.reviews;
  const storeLink = data?.cheapest?.link ?? product.link;

  return (
    <View className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="pb-6">
        <View className="h-[290px] items-center justify-center overflow-hidden rounded-b-[28px] bg-ph">
          {heroUri ? (
            <Image
              source={{ uri: heroUri }}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
              transition={180}
            />
          ) : (
            <Ionicons name="image-outline" size={48} color="#9A9DA8" />
          )}

          <View
            style={{ top: insets.top + 8 }}
            className="absolute left-5 right-5 flex-row justify-between"
          >
            <BackButton onPress={() => router.back()} />
          </View>
        </View>

        <View className="px-6 pt-5">
          <Text className="font-medium text-[11.5px] text-muted">
            {data?.brand ?? product.store}
          </Text>
          <Num className="my-1.5 font-bold text-[20px] leading-[30px] text-tx">
            {data?.title ?? product.name}
          </Num>

          {/* السعر المشطوب وشارة الخصم يلي بالتصميم منشولين: محرّك
              google_immersive_product ما بيرجّع «السعر قبل الخصم» إطلاقًا */}
          <Num className="font-bold text-[26px] text-brand">{formatSar(price)}</Num>

          <View className="mt-3 flex-row items-center gap-3.5">
            {rating !== null ? (
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="star" size={11} color="#F5A623" />
                <Num className="font-sans text-[12px] text-muted">
                  {reviews !== null
                    ? `${formatRating(rating)} (${formatNumber(reviews)})`
                    : formatRating(rating)}
                </Num>
              </View>
            ) : null}
            <View className="h-3 w-px bg-line" />
            <Text className="font-sans text-[12px] text-muted">
              أرخص عند {cheapestStore}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2.5 px-6 pt-5">
          <AiEntry
            title="اشتري أو استنّى؟"
            hint="حكم سريع على سعر اليوم"
            icon="bulb-outline"
            onPress={() =>
              router.push({
                pathname: '/recommend',
                params: { productId: product.id as string },
              })
            }
          />
          <AiEntry
            title="توقّع السعر"
            hint="لوين رايح خلال الأسابيع الجاية"
            icon="trending-down-outline"
            onPress={() =>
              router.push({
                pathname: '/predict',
                params: { productId: product.id as string },
              })
            }
          />
        </View>

        <View className="px-6 pt-6">
          <QueryState
            isLoading={isPending}
            error={error}
            onRetry={() => void refetch()}
          />
        </View>

        {data ? (
          <>
            {data.stores.length > 0 ? (
              <View className="px-6 pt-6">
                <Text className="mb-3 font-semibold text-[14px] text-tx">
                  العروض من المتاجر
                </Text>
                <View className="gap-2.5">
                  {data.stores.map((store, index) => (
                    <Pressable
                      key={`${store.name}-${index}`}
                      onPress={() =>
                        store.link ? void WebBrowser.openBrowserAsync(store.link) : undefined
                      }
                      disabled={!store.link}
                      style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
                      className={`flex-row items-center gap-3 rounded-input border bg-card px-4 py-3.5 ${
                        index === 0 ? 'border-ok' : 'border-line'
                      }`}
                    >
                      {store.logo ? (
                        <Image
                          source={{ uri: store.logo }}
                          style={{ width: 32, height: 32, borderRadius: 10 }}
                          contentFit="contain"
                        />
                      ) : (
                        <View className="h-8 w-8 rounded-[10px] bg-chip" />
                      )}

                      <View className="min-w-0 flex-1">
                        <Num className="font-semibold text-[12.5px] text-tx">
                          {store.name}
                        </Num>
                        {store.note ? (
                          <Text
                            numberOfLines={1}
                            className="mt-0.5 font-sans text-[10.5px] text-muted"
                          >
                            {store.note}
                          </Text>
                        ) : null}
                      </View>

                      <Num
                        className={`font-bold text-[14px] ${
                          index === 0 ? 'text-ok' : 'text-tx'
                        }`}
                      >
                        {formatSar(store.price)}
                      </Num>
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : null}

            {data.specs.length > 0 ? (
              <View className="px-6 pt-6">
                <Text className="mb-3 font-semibold text-[14px] text-tx">المواصفات</Text>
                <Card className="overflow-hidden">
                  {data.specs.map((spec, index) => (
                    <View
                      key={`${spec.k}-${index}`}
                      className={`flex-row justify-between gap-3.5 px-4 py-3.5 ${
                        index === data.specs.length - 1 ? '' : 'border-b border-line'
                      }`}
                    >
                      <Text className="font-sans text-[12.5px] text-muted">{spec.k}</Text>
                      <Num className="flex-1 text-right font-medium text-[12.5px] text-tx">
                        {spec.v}
                      </Num>
                    </View>
                  ))}
                </Card>
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>

      <View
        style={{ paddingBottom: insets.bottom + 12 }}
        className="flex-row gap-3 border-t border-line bg-card px-6 pt-3"
      >
        <Button
          label="أضف للمراقبة"
          onPress={() =>
            router.push({ pathname: '/watch-add', params: { productId: product.id! } })
          }
          className="flex-1"
        />
        <Button
          label="زيارة المتجر"
          onPress={() => storeLink && void WebBrowser.openBrowserAsync(storeLink)}
          variant="secondary"
          disabled={!storeLink}
          className="w-[104px]"
        />
      </View>
    </View>
  );
}
