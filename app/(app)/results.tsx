import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/ui/Chip';
import { Num } from '@/components/ui/Num';
import { ProductThumb } from '@/components/ui/ProductThumb';
import { QueryState } from '@/components/ui/QueryState';
import { BackButton } from '@/components/ui/ScreenHeader';
import { SORT_OPTIONS, type SortKey } from '@/constants/catalog';
import { useProductSearch } from '@/hooks/useProducts';
import { formatNumber, formatRating, formatSar } from '@/lib/format';
import { setSelectedProduct } from '@/lib/selectedProduct';
import type { Product, SearchFilters } from '@/types/api';

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string;
    brand?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  }>();

  const [sort, setSort] = useState<SortKey>('cheapest');

  const filters = useMemo<SearchFilters | null>(() => {
    const name = params.name?.trim();
    if (!name) return null;

    const min = Number(params.minPrice);
    const max = Number(params.maxPrice);

    return {
      name,
      ...(params.brand ? { brand: params.brand } : {}),
      ...(params.category ? { category: params.category } : {}),
      ...(Number.isFinite(min) && params.minPrice ? { minPrice: min } : {}),
      ...(Number.isFinite(max) && params.maxPrice ? { maxPrice: max } : {}),
    };
  }, [params.name, params.brand, params.category, params.minPrice, params.maxPrice]);

  const { data, isPending, error, refetch, isFetching } = useProductSearch(filters);

  const results = data?.results ?? [];

  // السيرفر بيرجّعهن مرتّبين تصاعديًا بالسعر أصلاً، فالترتيب بالسعر ما بدو شغل
  const sorted = useMemo(() => {
    if (sort === 'cheapest') return results;
    return [...results].sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
  }, [results, sort]);

  const storeCount = useMemo(
    () => new Set(results.map((item) => item.store)).size,
    [results],
  );

  const comparison = data?.priceComparison;
  const cheapestPrice = comparison?.cheapest?.price ?? 0;

  const open = (product: Product) => {
    if (!product.id) return;
    setSelectedProduct(product);
    router.push({ pathname: '/product', params: { productId: product.id } });
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-row items-center gap-2.5 px-5 pb-3.5">
        <BackButton onPress={() => router.back()} />

        <View className="min-w-0 flex-1">
          <Text numberOfLines={1} className="font-semibold text-[15px] text-tx">
            {params.name}
          </Text>
          <Text className="mt-px font-sans text-[11.5px] text-muted">
            {results.length > 0
              ? `${formatNumber(results.length)} عرض من ${formatNumber(storeCount)} متاجر`
              : 'مقارنة الأسعار'}
          </Text>
        </View>

        <Pressable
          onPress={() => router.push({ pathname: '/filters', params })}
          accessibilityRole="button"
          accessibilityLabel="الفلاتر"
          className="h-9 w-9 items-center justify-center rounded-field bg-brand"
        >
          <Ionicons name="options-outline" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="pb-8">
        <View className="px-5">
          <QueryState
            isLoading={isPending && isFetching}
            error={error}
            isEmpty={!isPending && !error && results.length === 0}
            emptyBody="جرّب اسم أقصر أو شيل بعض الفلاتر."
            emptyAction={{
              label: 'عدّل الفلاتر',
              onPress: () => router.push({ pathname: '/filters', params }),
            }}
            onRetry={() => void refetch()}
          />
        </View>

        {results.length > 0 && comparison ? (
          <>
            <View className="px-5 pb-4">
              <View className="rounded-panel bg-brand px-[18px] py-[17px]">
                <Text className="font-medium text-[11.5px] text-white/85">
                  فرق السعر بين الأرخص والأغلى
                </Text>
                <Num className="my-1 font-bold text-[30px] text-white">
                  {formatSar(comparison.priceDifference)}
                </Num>
                <Text className="font-sans text-[12px] text-white/90">
                  أرخص عرض عند {comparison.cheapest?.store ?? '—'} · أغلى عند{' '}
                  {comparison.mostExpensive?.store ?? '—'}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-2 px-5 pb-3.5">
              {SORT_OPTIONS.map((option) => (
                <Chip
                  key={option.key}
                  label={option.label}
                  selected={sort === option.key}
                  onPress={() => setSort(option.key)}
                />
              ))}
            </View>

            <View className="gap-3 px-5">
              {sorted.map((product, index) => {
                const isCheapest = product.price === cheapestPrice;
                // منتج بلا معرّف ما بينفتح: تفاصيله وإنشاء المراقبة الاتنين
                // بيطلبوا productId من الباك إند
                const openable = !!product.id;

                return (
                  <Pressable
                    // SerpAPI بيقدر يرجّع نفس product_id لأكتر من عرض (نفس
                    // المنتج معروض عند متاجر مختلفة)، فالمعرّف لحالو مش فريد
                    // بهالقائمة. الفهرس بيضمن التفرّد — بدونه React بيسقط صف
                    // أو بيكرّره بصمت، مش بس بيطلع تحذير
                    key={`${product.id ?? product.store}-${index}`}
                    onPress={() => open(product)}
                    disabled={!openable}
                    style={({ pressed }) => [
                      pressed ? { opacity: 0.75 } : null,
                      openable ? null : { opacity: 0.55 },
                    ]}
                    className={`flex-row gap-3 rounded-card border bg-card p-3 ${
                      isCheapest ? 'border-ok' : 'border-line'
                    }`}
                  >
                    <ProductThumb uri={product.image} size={76} />

                    <View className="min-w-0 flex-1 gap-1">
                      <View className="flex-row items-center gap-1.5">
                        <Text className="font-medium text-[11px] text-muted">
                          {product.store}
                        </Text>
                        {isCheapest ? (
                          <Text className="overflow-hidden rounded-pill bg-ok px-[7px] py-0.5 font-semibold text-[9.5px] text-white">
                            الأرخص
                          </Text>
                        ) : null}
                      </View>

                      <Num numberOfLines={2} className="font-semibold text-[13px] leading-[19px] text-tx">
                        {product.name}
                      </Num>

                      <View className="mt-auto flex-row items-baseline gap-2">
                        <Num className="font-bold text-[16px] text-tx">
                          {formatSar(product.price)}
                        </Num>
                        {isCheapest ? (
                          <Text className="font-medium text-[11px] text-ok">أرخص عرض</Text>
                        ) : (
                          <Num className="font-medium text-[11px] text-faint">
                            {`+${formatNumber(product.price - cheapestPrice)}`}
                          </Num>
                        )}
                      </View>

                      {product.rating !== null ? (
                        <View className="flex-row items-center gap-1.5">
                          <Ionicons name="star" size={9} color="#F5A623" />
                          <Num className="font-sans text-[10.5px] text-faint">
                            {product.reviews !== null
                              ? `${formatRating(product.rating)} · ${formatNumber(product.reviews)}`
                              : formatRating(product.rating)}
                          </Num>
                        </View>
                      ) : null}

                      {!openable ? (
                        <Text className="font-sans text-[10.5px] text-faint">
                          ما في معرّف لهالعرض — ما بينفتح
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
