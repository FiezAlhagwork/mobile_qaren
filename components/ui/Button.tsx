import { ActivityIndicator, Pressable, Text, type ViewStyle } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  /** لتعديل العرض والهوامش من الشاشة — الأنماط الداخلية ما بتنلمس */
  className?: string;
}

/**
 * ظل الزر الأساسي بالتصميم: `0 10px 24px -10px rgba(240,67,74,.7)`.
 * بـ RN ما في «انتشار سالب»، فمنقرّبه بظل ملوّن قصير مع `elevation`
 * لأندرويد (يلي ما بيدعم الظلال الملوّنة قبل API 28).
 */
const BRAND_SHADOW: ViewStyle = {
  shadowColor: '#F0434A',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.32,
  shadowRadius: 14,
  elevation: 6,
};

const CONTAINER: Record<ButtonVariant, string> = {
  primary: 'bg-brand',
  secondary: 'bg-card border border-line',
  ghost: 'bg-transparent',
};

const LABEL: Record<ButtonVariant, string> = {
  primary: 'text-white font-semibold text-[15px]',
  secondary: 'text-tx font-semibold text-[14px]',
  ghost: 'text-brand font-semibold text-[12.5px]',
};

const PADDING: Record<ButtonVariant, string> = {
  primary: 'py-[17px] px-4 rounded-btn',
  secondary: 'py-[16px] px-4 rounded-btn',
  ghost: 'py-1 px-0',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
}: ButtonProps) {
  const isBlocked = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isBlocked}
      accessibilityRole="button"
      accessibilityState={{ disabled: isBlocked, busy: loading }}
      style={({ pressed }) => [
        variant === 'primary' && !isBlocked ? BRAND_SHADOW : null,
        // بدل :hover تبع الويب — الضغط بيغمّق الأساسي وبيخفّت الباقي
        pressed && variant === 'primary' ? { backgroundColor: '#DC343B' } : null,
        pressed && variant !== 'primary' ? { opacity: 0.6 } : null,
        isBlocked ? { opacity: 0.45 } : null,
      ]}
      className={`flex-row items-center justify-center ${CONTAINER[variant]} ${PADDING[variant]} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : '#F0434A'}
        />
      ) : (
        <Text className={LABEL[variant]}>{label}</Text>
      )}
    </Pressable>
  );
}
