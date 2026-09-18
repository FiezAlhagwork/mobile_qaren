import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Num } from '@/components/ui/Num';
import { describeError } from '@/components/ui/QueryState';
import { BackButton } from '@/components/ui/ScreenHeader';
import {
  cityMatches,
  SAUDI_CITIES,
  SUPPORTED_COUNTRY,
  type SaudiCity,
} from '@/constants/saudiCities';
import { useMe, useUpdateLocation } from '@/hooks/useUser';

export default function LocationScreen() {
  const router = useRouter();
  const { data: user } = useMe();
  const updateLocation = useUpdateLocation();

  // نفس الشاشة بتخدم حالتين. التمييز بـ param صريح مش بـ `router.canGoBack()`:
  // بعد تبديل مجموعة المسارات (auth ← app) مش مضمون شو بيبقى بتاريخ التنقّل،
  // والاستنتاج منه بيخلي الشاشة تتصرف صح أو غلط حسب كيف وصلها المستخدم
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isChanging = mode === 'change';

  const hasLocation = !!user?.location.city;

  /**
   * أول مرة: بعد الحفظ لازم ننتقل **صراحةً**.
   *
   * `location` معلَنة برّا الحارس بـ (app)/_layout عشان تضل مفتوحة لتغيير
   * المدينة لاحقًا — وبالتالي ما بتصير «غير متاحة» لما ينتحدد الموقع، وما في
   * شي بيجبر الملاح يطلع منها. (قبل هيك كانت تحت `guard={!hasLocation}` فكان
   * الملاح مضطر ينتقل لحالو.)
   *
   * والتنقّل بـ effect مش جوا `onSuccess`: لازم يصير **بعد** ما React يعيد
   * التصيير ويصير `(tabs)` متاح فعليًا، وإلا منروح لوجهة لسا مفلترة
   */
  useEffect(() => {
    if (!isChanging && hasLocation) router.replace('/');
  }, [isChanging, hasLocation, router]);

  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SaudiCity | null>(
    () => SAUDI_CITIES.find((city) => city.en === user?.location.city) ?? null,
  );

  const visible = useMemo(
    () => SAUDI_CITIES.filter((city) => cityMatches(city, query)),
    [query],
  );

  const onConfirm = () => {
    if (!selected) return;

    updateLocation.mutate(
      {
        latitude: selected.latitude,
        longitude: selected.longitude,
        city: selected.en, // الإنجليزي هو يلي السيرفر بيترجمه لموقع SerpAPI
        country: SUPPORTED_COUNTRY,
        source: 'manual',
      },
      {
        // وضع التغيير بس: منرجع من وين إجينا. أول مرة بيتكفّل فيها الـ effect
        // فوق، بعد ما تنقلب `hasLocation` ويصير `(tabs)` متاح
        onSuccess: () => {
          if (isChanging) router.back();
        },
      },
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="px-6 pb-4 pt-3">
          {isChanging ? (
            <View className="mb-4 flex-row">
              <BackButton onPress={() => router.back()} />
            </View>
          ) : null}

          <Text className="mb-2 font-bold text-[22px] leading-[32px] text-tx">
            وين موقعك؟
          </Text>
          <Text className="font-sans text-[13px] leading-[23px] text-muted">
            الأسعار والمتاجر المتوفرة تختلف حسب المنطقة، فاختيار مدينتك إلزامي قبل
            أول بحث.
          </Text>
        </View>

        <View className="px-6 pb-3">
          <View className="flex-row items-center gap-2.5 rounded-input border border-line bg-card px-3.5 py-3">
            <Ionicons name="search" size={15} color="#9A9DA8" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="دوّر على مدينتك"
              placeholderTextColor="#9A9DA8"
              className="min-w-0 flex-1 font-sans text-[13.5px] text-tx"
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color="#9A9DA8" />
              </Pressable>
            ) : null}
          </View>
        </View>

        <ScrollView
          contentContainerClassName="px-6 pb-4 gap-2"
          keyboardShouldPersistTaps="handled"
        >
          {visible.length === 0 ? (
            <Card className="items-center px-5 py-8">
              <Text className="mb-1.5 font-bold text-[15px] text-tx">
                ما لقينا هالمدينة
              </Text>
              <Text className="text-center font-sans text-[12px] leading-[21px] text-muted">
                منغطّي أكبر مدن السعودية حاليًا. جرّب أقرب مدينة كبيرة إلك.
              </Text>
            </Card>
          ) : null}

          {visible.map((city) => {
            const isSelected = selected?.en === city.en;

            return (
              <Pressable
                key={city.en}
                onPress={() => setSelected(city)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
                className={`flex-row items-center gap-3 rounded-card border bg-card px-4 py-3.5 ${
                  isSelected ? 'border-[1.5px] border-brand' : 'border-line'
                }`}
              >
                <View
                  className={`h-9 w-9 items-center justify-center rounded-field ${
                    isSelected ? 'bg-brand' : 'bg-chip'
                  }`}
                >
                  <Ionicons
                    name="location"
                    size={16}
                    color={isSelected ? '#FFFFFF' : '#7C808C'}
                  />
                </View>

                <View className="flex-1">
                  <Text className="font-semibold text-[14px] text-tx">{city.ar}</Text>
                  <Num className="mt-0.5 font-sans text-[11.5px] text-muted">
                    {city.en}
                  </Num>
                </View>

                {isSelected ? (
                  <Ionicons name="checkmark-circle" size={20} color="#F0434A" />
                ) : (
                  <View className="h-[19px] w-[19px] rounded-full border border-line" />
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="border-t border-line bg-card px-6 pb-6 pt-4">
          {updateLocation.error ? (
            <View className="mb-3 rounded-field border border-brand/30 bg-tint px-4 py-3">
              <Text className="font-medium text-[12.5px] leading-[21px] text-brand">
                {describeError(updateLocation.error).body}
              </Text>
            </View>
          ) : null}

          <Button
            label={isChanging ? 'احفظ المدينة' : 'تأكيد الموقع والمتابعة'}
            onPress={onConfirm}
            loading={updateLocation.isPending}
            disabled={!selected}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
