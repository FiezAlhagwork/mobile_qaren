import { Text, type TextProps } from 'react-native';

/**
 * محارف عزل اتجاهي (Unicode Bidi Isolate). ملفوفة حوالين النص بتخلي
 * الخوارزمية تعامله كمقطع LTR مستقل جوا الفقرة العربية.
 */
const LTR_ISOLATE = '⁦';
const POP_ISOLATE = '⁩';

interface NumProps extends Omit<TextProps, 'children'> {
  children: string | number;
}

/**
 * التصميم صريح: «كل الأرقام والماركات بالإنجليزي داخل واجهة RTL».
 *
 * بس `I18nManager.forceRTL(true)` بيخلي محرّك النص يعامل السطر كعربي، فسعر
 * متل "3,149 ر.س" أو اسم متل "iPhone 15 Pro" ممكن تنقلب أجزاؤه.
 *
 * الحل هون بمستوى **النص** مش بمستوى الستايل: `writingDirection` لحالها
 * ما بتشتغل بثبات على أندرويد، بينما محارف العزل جزء من خوارزمية Unicode
 * نفسها فبتشتغل على المنصتين.
 */
export function Num({ children, style, ...rest }: NumProps) {
  return (
    <Text style={[{ writingDirection: 'ltr' }, style]} {...rest}>
      {LTR_ISOLATE}
      {String(children)}
      {POP_ISOLATE}
    </Text>
  );
}
