import { Pressable, Text } from 'react-native';

import { Num } from './Num';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** للماركات والنِسب — محتوى لاتيني بيتلفّ بعزل LTR */
  ltr?: boolean;
  className?: string;
}

/**
 * حبة قابلة للاختيار — التصميم بيستعملها بأربع أماكن: فلاتر الفئة والماركة،
 * ترتيب النتايج، تابات قائمة المراقبة، ونِسب السعر المستهدف.
 */
export function Chip({
  label,
  selected = false,
  onPress,
  ltr = false,
  className = '',
}: ChipProps) {
  const textClass = `font-medium text-[12.5px] ${selected ? 'text-white' : 'text-tx'}`;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
      className={`rounded-pill border px-4 py-2.5 ${
        selected ? 'border-brand bg-brand' : 'border-line bg-card'
      } ${className}`}
    >
      {ltr ? (
        <Num className={textClass}>{label}</Num>
      ) : (
        <Text className={textClass}>{label}</Text>
      )}
    </Pressable>
  );
}
