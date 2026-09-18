import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Num } from '@/components/ui/Num';
import { ProductThumb } from '@/components/ui/ProductThumb';
import { describeError, QueryState } from '@/components/ui/QueryState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useToast } from '@/components/ui/Toast';
import { useMe, useUpdatePreferences } from '@/hooks/useUser';
import { useCreateWatch } from '@/hooks/useWatches';
import { formatNumber, formatSar } from '@/lib/format';
import { getSelectedProduct } from '@/lib/selectedProduct';

const PRESETS = [5, 10, 15, 20];

export default function WatchAddScreen() {
  const router = useRouter();
  const toast = useToast();
  const { productId } = useLocalSearchParams<{ productId?: string }>();

  const product = getSelectedProduct(productId ?? null);
  const { data: user } = useMe();
  const createWatch = useCreateWatch();
  const updatePreferences = useUpdatePreferences();

  const pushEnabled = user?.preferences.pushNotificationsEnabled ?? true;

  // القيمة الأولية: 10% تحت السعر الحالي، مقرّبة لأقرب عشرة متل التصميم
  const [target, setTarget] = useState(() =>
    product ? String(Math.round((product.price * 0.9) / 10) * 10) : '',
  );

  if (!product) {
    return (
      <SafeAreaView className="flex-1 justify-center bg-bg px-6">
        <QueryState
          isEmpty
          emptyTitle="ما لقينا المنتج"
          emptyBody="ارجع للبحث وافتح المنتج من جديد."
          emptyIcon="cube-outline"
          emptyAction={{ label: 'ارجع للبحث', onPress: () => router.replace('/search') }}
        />
      </SafeAreaView>
    );
  }

  const targetValue = Number(target) || 0;
  const gap = product.price - targetValue;

  const presetValue = (percent: number) =>
    Math.round((product.price * (1 - percent / 100)) / 10) * 10;

  const onSubmit = () => {
    if (!product.id || !product.productToken || targetValue <= 0) return;

    createWatch.mutate(
      {
        productId: product.id,
        productToken: product.productToken,
        productName: product.name,
        // الباك إند بيتحقق إنها URL صالح — أي شي غير http بينرمى قبل ما ينبعت
        productImage: product.image?.startsWith('http') ? product.image : null,
        store: product.store,
        priceAtAdd: product.price,
        targetPrice: targetValue,
      },
      {
        onSuccess: () => {
          toast.show('بدأت المراقبة — منفحص كل ليلة 12:00');
          router.replace('/watchlist');
        },
      },
    );
  };

  const canSubmit =
    !!product.id && !!product.productToken && targetValue > 0 && !createWatch.isPending;

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScreenHeader title="سعرك المستهدف" className="pb-5 pt-2" />

        <ScrollView
          contentContainerClassName="px-[22px] pb-6"
          keyboardShouldPersistTaps="handled"
        >
          <Card className="mb-6 flex-row items-center gap-3 p-3">
            <ProductThumb uri={product.image} size={56} />
            <View className="min-w-0 flex-1">
              <Num numberOfLines={2} className="font-semibold text-[13px] leading-[19px] text-tx">
                {product.name}
              </Num>
              <Text className="mt-1 font-sans text-[11.5px] text-muted">
                السعر الحالي {formatSar(product.price)} · {product.store}
              </Text>
            </View>
          </Card>

          <View className="items-center pb-4 pt-1.5">
            <Text className="mb-2.5 font-sans text-[12.5px] text-muted">
              نبّهني لما ينزل السعر لـ
            </Text>

            <View className="flex-row items-center gap-2">
              <TextInput
                value={target}
                onChangeText={(value) => setTarget(value.replace(/[^\d]/g, ''))}
                keyboardType="number-pad"
                maxLength={7}
                style={{ writingDirection: 'ltr', textAlign: 'center' }}
                className="w-[150px] font-bold text-[44px] text-brand"
              />
              <Text className="font-semibold text-[16px] text-muted">ر.س</Text>
            </View>

            <View
              className={`mt-3 rounded-pill px-3 py-1.5 ${gap > 0 ? 'bg-ok-bg' : 'bg-tint'}`}
            >
              <Text
                className={`font-medium text-[11.5px] ${gap > 0 ? 'text-ok' : 'text-brand'}`}
              >
                {gap > 0
                  ? `أقل من السعر الحالي بـ ${formatNumber(gap)} ر.س`
                  : 'هدفك أعلى من السعر الحالي — بيتحقق من أول فحص'}
              </Text>
            </View>
          </View>

          <View className="mb-6 flex-row gap-2">
            {PRESETS.map((percent) => {
              const value = presetValue(percent);
              return (
                <Chip
                  key={percent}
                  label={`−${percent}%`}
                  selected={targetValue === value}
                  onPress={() => setTarget(String(value))}
                  ltr
                  className="flex-1 items-center px-1"
                />
              );
            })}
          </View>

          <Card className="px-4">
            <View className="flex-row items-center justify-between border-b border-line py-3.5">
              <View className="flex-1 pl-3">
                <Text className="font-sans text-[12.5px] text-tx">إشعار على الجوال</Text>
                <Text className="mt-0.5 font-sans text-[10.5px] text-muted">
                  إعداد عام لكل المراقبات
                </Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={(next) =>
                  updatePreferences.mutate({ pushNotificationsEnabled: next })
                }
                trackColor={{ false: '#DEDEE4', true: '#F0434A' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View className="flex-row items-center justify-between py-3.5">
              <Text className="font-sans text-[12.5px] text-tx">مدة المراقبة</Text>
              <Text className="font-medium text-[12.5px] text-muted">30 يوم (تلقائي)</Text>
            </View>
          </Card>

          {createWatch.error ? (
            <Card className="mt-4 border-brand/30 p-4">
              <Text className="font-semibold text-[13px] text-tx">
                {describeError(createWatch.error).title}
              </Text>
              <Text className="mt-1.5 font-sans text-[11.5px] leading-[20px] text-muted">
                {describeError(createWatch.error).body}
              </Text>
            </Card>
          ) : null}

          <View className="mt-4 flex-row gap-2">
            <View className="mt-[7px] h-1 w-1 rounded-full bg-brand" />
            <Text className="flex-1 font-sans text-[11.5px] leading-[20px] text-muted">
              الفحص يصير كل يوم منتصف الليل. أول ما يتحقق هدفك يوصلك إشعار وتنتهي
              المراقبة تلقائياً.
            </Text>
          </View>
        </ScrollView>

        <View className="px-[22px] pb-6 pt-4">
          <Button
            label="ابدأ المراقبة"
            onPress={onSubmit}
            loading={createWatch.isPending}
            disabled={!canSubmit}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
