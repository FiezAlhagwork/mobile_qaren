import { Text } from 'react-native';

interface LogoProps {
  /** أبيض على خلفية حمرا، أو أحمر على خلفية فاتحة */
  inverted?: boolean;
  /** حجم الكلمة نفسها — الشعار كله كلمة وحدة */
  size?: number;
  className?: string;
}

/**
 * شعار «قارن» — الكلمة وحدها بخط Lalezar العرضي، بلا رمز ولا مربّع.
 *
 * الخط هو الشعار: `font-logo` مربوطة بـ Lalezar بـ tailwind.config.js، وهي
 * المكان الوحيد بالتطبيق يلي بيستعملها. وبدون `letterSpacing` عن قصد — بـ
 * React Native بيفصل الحروف العربية المتّصلة عن بعضها.
 */
export function Logo({ inverted = false, size = 38, className = '' }: LogoProps) {
  return (
    <Text
      accessibilityRole="header"
      // بلا هالسطر قارئ الشاشة بيلفظ الكلمة كنص عادي، وهي اسم منتج
      accessibilityLabel="قارن"
      // ارتفاع سطر واسع: Lalezar حروفه طويلة وبتنقص من فوق لو ضيّقناه
      style={{ fontSize: size, lineHeight: Math.round(size * 1.5) }}
      className={`font-logo ${inverted ? 'text-white' : 'text-brand'} ${className} text-right`}
    >
      قارن
    </Text>
  );
}
