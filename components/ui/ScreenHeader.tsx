import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string | null;
  /** بيغلب الرجوع الافتراضي لما الشاشة بدها تنظّف شي قبل ما تطلع */
  onBack?: () => void;
  showBack?: boolean;
  right?: ReactNode;
  className?: string;
}

/** زر الرجوع — سهم لليمين لأن الواجهة RTL والرجوع باتجاه بداية السطر */
export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="رجوع"
      hitSlop={8}
      style={({ pressed }) => (pressed ? { opacity: 0.6 } : null)}
      className="h-9 w-9 items-center justify-center rounded-field border border-line bg-card"
    >
      <Ionicons name="chevron-forward" size={17} color="#14151A" />
    </Pressable>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  showBack = true,
  right,
  className = '',
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) return router.back();
    router.replace('/');
  };

  return (
    <View className={`flex-row items-center gap-3 px-5 ${className}`}>
      {showBack ? <BackButton onPress={handleBack} /> : null}

      <View className="min-w-0 flex-1">
        <Text
          numberOfLines={1}
          className="font-bold text-[17px] text-tx"
        >
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} className="mt-0.5 font-sans text-[11.5px] text-muted">
            {subtitle}
          </Text>
        ) : null}
      </View>

      {right}
    </View>
  );
}
