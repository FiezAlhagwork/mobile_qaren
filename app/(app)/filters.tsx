import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { BRANDS, CATEGORIES } from '@/constants/catalog';

const ALL = '';

export default function FiltersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string;
    brand?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  }>();

  const name = params.name ?? '';
  const [brand, setBrand] = useState(params.brand ?? ALL);
  const [category, setCategory] = useState(params.category ?? ALL);
  const [minPrice, setMinPrice] = useState(params.minPrice ?? '');
  const [maxPrice, setMaxPrice] = useState(params.maxPrice ?? '');

  const reset = () => {
    setBrand(ALL);
    setCategory(ALL);
    setMinPrice('');
    setMaxPrice('');
  };

  const apply = () => {
    // replace مش push: الفلاتر مش محطة بالرحلة، والرجوع من النتايج لازم
    // يوصّل للبحث مش يرجّع لشاشة الفلاتر
    router.replace({
      pathname: '/results',
      params: {
        name,
        ...(brand ? { brand } : {}),
        ...(category ? { category } : {}),
        ...(minPrice ? { minPrice } : {}),
        ...(maxPrice ? { maxPrice } : {}),
      },
    });
  };

  const digitsOnly = (value: string) => value.replace(/[^\d]/g, '');

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-6 pb-4 pt-2">
        <Text className="font-bold text-[18px] text-tx">الفلاتر</Text>
        <Pressable onPress={reset} hitSlop={8}>
          <Text className="font-semibold text-[12.5px] text-brand">إعادة تعيين</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerClassName="px-6 pb-6" keyboardShouldPersistTaps="handled">
        <Text className="mb-3 font-semibold text-[13px] text-tx">الفئة</Text>
        <View className="mb-6 flex-row flex-wrap gap-2">
          <Chip label="الكل" selected={category === ALL} onPress={() => setCategory(ALL)} />
          {CATEGORIES.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              selected={category === item.term}
              onPress={() => setCategory(item.term)}
            />
          ))}
        </View>

        <Text className="mb-3 font-semibold text-[13px] text-tx">الماركة</Text>
        <View className="mb-6 flex-row flex-wrap gap-2">
          <Chip label="الكل" selected={brand === ALL} onPress={() => setBrand(ALL)} />
          {BRANDS.map((item) => (
            <Chip
              key={item}
              label={item}
              selected={brand === item}
              onPress={() => setBrand(item)}
              ltr
            />
          ))}
        </View>

        <Text className="mb-3 font-semibold text-[13px] text-tx">نطاق السعر (ر.س)</Text>
        <View className="flex-row gap-3">
          <Input
            label="من"
            value={minPrice}
            onChangeText={(value) => setMinPrice(digitsOnly(value))}
            keyboardType="number-pad"
            placeholder="0"
            ltr
            className="flex-1"
          />
          <Input
            label="إلى"
            value={maxPrice}
            onChangeText={(value) => setMaxPrice(digitsOnly(value))}
            keyboardType="number-pad"
            placeholder="—"
            ltr
            className="flex-1"
          />
        </View>

        <View className="mt-4 flex-row gap-2">
          <View className="mt-[7px] h-1 w-1 rounded-full bg-brand" />
          <Text className="flex-1 font-sans text-[11.5px] leading-[20px] text-muted">
            الفلاتر تنمرّر مباشرة لمحرك البحث، مش فلترة محلية — فالنتائج تطلع أدق.
          </Text>
        </View>
      </ScrollView>

      <View className="flex-row gap-3 px-6 pb-6 pt-4">
        <Button
          label="إلغاء"
          onPress={() => router.back()}
          variant="secondary"
          className="w-[92px]"
        />
        <Button label="تطبيق الفلاتر" onPress={apply} className="flex-1" />
      </View>
    </SafeAreaView>
  );
}
