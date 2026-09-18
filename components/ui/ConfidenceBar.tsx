import { Text, View } from 'react-native';

import { confidencePercent } from '@/lib/format';
import { Num } from './Num';

interface ConfidenceBarProps {
  /** ممكن توصل ككسر (0.7) أو كنسبة (70) — `confidencePercent` بتوحّدهن */
  value: number;
  className?: string;
}

/**
 * شريط ثقة التحليل — مشترك بين شاشتَي التوصية والتوقّع.
 *
 * الثقة رقم بيجي من Gemini، ومهم يبان لأن التوصية بلا سجل أسعار بتكون أضعف
 * والموجّه بالسيرفر بيطلب من النموذج ينزّل ثقته بهالحالة. إخفاؤها بيخلي كل
 * التوصيات تبيّن متساوية بالقوة.
 */
export function ConfidenceBar({ value, className = '' }: ConfidenceBarProps) {
  const percent = confidencePercent(value);

  return (
    <View className={className}>
      <View className="mb-1.5 flex-row items-center justify-between">
        <Text className="font-sans text-[11px] text-muted">ثقة التحليل</Text>
        <Num className="font-semibold text-[11px] text-tx">{`${percent}%`}</Num>
      </View>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: percent }}
        className="h-[5px] overflow-hidden rounded-[3px] bg-chip"
      >
        <View
          style={{ width: `${percent}%` }}
          className="h-full rounded-[3px] bg-brand"
        />
      </View>
    </View>
  );
}
