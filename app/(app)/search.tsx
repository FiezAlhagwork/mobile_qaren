import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { BackButton } from '@/components/ui/ScreenHeader';
import { CATEGORIES } from '@/constants/catalog';
import { loadRecentSearches, pushRecentSearch } from '@/lib/recentSearches';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    void loadRecentSearches().then(setRecent);
  }, []);

  const runSearch = useCallback(
    async (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;

      setRecent(await pushRecentSearch(trimmed));
      router.push({ pathname: '/results', params: { name: trimmed } });
    },
    [router],
  );

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-row items-center gap-2.5 px-5 pb-4">
        <BackButton onPress={() => router.back()} />

        <View className="flex-1 flex-row items-center gap-2.5 rounded-input border-[1.5px] border-brand bg-card px-3.5 py-3">
          <Ionicons name="search" size={15} color="#F0434A" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => void runSearch(query)}
            placeholder="اسم الجهاز أو الماركة"
            placeholderTextColor="#9A9DA8"
            returnKeyType="search"
            autoFocus
            className="min-w-0 flex-1 font-sans text-[13.5px] text-tx"
          />
        </View>

        <Pressable
          onPress={() =>
            router.push({ pathname: '/filters', params: { name: query.trim() } })
          }
          accessibilityRole="button"
          accessibilityLabel="الفلاتر"
          className="h-9 w-9 items-center justify-center rounded-field bg-brand"
        >
          <Ionicons name="options-outline" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerClassName="px-6 pb-8"
        keyboardShouldPersistTaps="handled"
      >
        {recent.length > 0 ? (
          <>
            <Text className="mb-3 font-semibold text-[13px] text-tx">
              بحثاتك الأخيرة
            </Text>
            <View className="mb-6 flex-row flex-wrap gap-2">
              {recent.map((term) => (
                <Chip
                  key={term}
                  label={term}
                  onPress={() => void runSearch(term)}
                  ltr
                />
              ))}
            </View>
          </>
        ) : null}

        {/* التصميم بيعرض اقتراحات ثابتة. ما في endpoint اقتراحات، فمنحط
            الفئات — بتوصل لنفس الهدف ببيانات حقيقية بدل أسماء مفبركة */}
        <Text className="mb-3 font-semibold text-[13px] text-tx">تصفّح بالفئة</Text>
        <View className="mb-6">
          {CATEGORIES.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => void runSearch(category.term)}
              style={({ pressed }) => (pressed ? { opacity: 0.6 } : null)}
              className="flex-row items-center gap-3 border-b border-line py-3.5"
            >
              <Ionicons name="pricetag-outline" size={15} color="#9A9DA8" />
              <Text className="flex-1 font-sans text-[13.5px] text-tx">
                {category.label}
              </Text>
              <Ionicons name="chevron-back" size={15} color="#9A9DA8" />
            </Pressable>
          ))}
        </View>

        <Button
          label="ابحث وقارن الأسعار"
          onPress={() => void runSearch(query)}
          disabled={query.trim().length === 0}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
