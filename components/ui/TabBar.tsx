import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * أبعاد الشريط بمكان واحد — بيستعملها `(tabs)/_layout.tsx` للتنسيق،
 * و`useTabBarInset` للحشوة السفلية بالشاشات.
 */
export const TAB_BAR = {
  height: 66,
  /** الهامش الجانبي، وأقل مسافة عن أسفل الشاشة */
  inset: 16,
  /** حبّة الأيقونة — بتتلوّن أبيض لما التاب يكون فعّال */
  pill: { width: 54, height: 40, radius: 20 },
  /**
   * حشوة ثابتة جوّا زر التاب بـ BottomTabItem (`styles.tabVerticalUiKit`)
   * وما إلها منفذ إعداد. منطرحها من ارتفاع إطار الأيقونة عشان الإطار يملا
   * المساحة المتبقية بالضبط، فتتوسّط الحبّة عموديًا بلا أرقام تخمينية
   */
  itemPadding: 5,
} as const;

/**
 * الشريط عائم (`position: absolute`) فما بيحجز مكان بالتخطيط — بلا هالحشوة،
 * آخر عنصر بأي شاشة بينطمر تحته.
 */
export function useTabBarInset(): number {
  const insets = useSafeAreaInsets();
  return TAB_BAR.height + Math.max(insets.bottom, TAB_BAR.inset) + TAB_BAR.inset;
}

// نفس أسماء الألوان الدلالية بـ tailwind.config.js — منكتبها هون كقيم لأن
// الشريط كله StyleSheet (ألوان مشروطة داخل مصفوفة أنماط، مش أصناف)
export const TAB_BAR_COLOR = '#F0434A'; // brand
const ACTIVE_PILL = '#FFFFFF';
const ACTIVE_ICON = '#F0434A'; // brand
const INACTIVE_ICON = 'rgba(255,255,255,0.78)';
const BADGE = '#1BA672'; // ok — نفس أخضر «تحقق الهدف» بقائمة المراقبة

interface TabIconProps {
  focused: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  showBadge?: boolean;
}

/**
 * كلها `outline` بنفس سماكة الخط — الفعّال بيتميّز بالحبّة البيضا واللون،
 * مش بأيقونة مملوءة. خلط المملوء مع المفرّغ بيخلي الفعّال يبان أتخن من
 * جيرانه وبينكسر انسجام الصف.
 *
 * ملاحظة: `TabBarIcon` تبع المكتبة بيرسم هالمكوّن **مرتين** فوق بعض —
 * نسخة `focused` ونسخة مش `focused` — وبيحرّك الشفافية بيناتهن. فحجم
 * الحبّة لازم يكون هو هو بالحالتين، وإلا بينط الشكل عند التبديل.
 */
export function TabIcon({ focused, icon, showBadge = false }: TabIconProps) {
  return (
    <View style={[styles.pill, focused ? styles.pillActive : null]}>
      <Ionicons name={icon} size={22} color={focused ? ACTIVE_ICON : INACTIVE_ICON} />
      {showBadge ? <View style={styles.badge} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    width: TAB_BAR.pill.width,
    height: TAB_BAR.pill.height,
    borderRadius: TAB_BAR.pill.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: ACTIVE_PILL,
  },
  badge: {
    position: 'absolute',
    top: 4,
    // بلا هالسطر العنصر المطلق بينحط عند بداية المحور — يعني يمين مع RTL
    end: 8,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: BADGE,
    // حدّ بلون الشريط بيفصل النقطة عن الأحمر ورا وعن الحبّة البيضا
    borderWidth: 1.5,
    borderColor: TAB_BAR_COLOR,
  },
});
