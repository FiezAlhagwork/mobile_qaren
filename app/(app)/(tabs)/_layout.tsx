import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR, TAB_BAR_COLOR, TabIcon } from '@/components/ui/TabBar';
import { useNotifications } from '@/hooks/useNotifications';
import { useWatches } from '@/hooks/useWatches';
import { deriveWatch } from '@/lib/watchDerive';

/** الترتيب هون هو ترتيب التابات، و`index` هو المدخل */
const TABS: { name: string; title: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'index', title: 'الرئيسية', icon: 'home-outline' },
  { name: 'watchlist', title: 'المراقبة', icon: 'eye-outline' },
  { name: 'notifications', title: 'الإشعارات', icon: 'notifications-outline' },
  { name: 'account', title: 'حسابي', icon: 'person-outline' },
];

/**
 * شريط النظام نفسه، بس معوّم بـ `tabBarStyle`: حبّة حمرا فوق المحتوى،
 * بلا أسماء، وكل أيقونة جوّا حبّة بتصير بيضا لما تكون فعّالة.
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { data: watches } = useWatches();
  const { data: notifications } = useNotifications();

  // نقطة على كل تاب من مصدره. التنين بيستعملوا نفس مفاتيح الاستعلام يلي
  // بتستعملها الشاشات نفسها، فما في نداء شبكة إضافي
  const hasHitTarget = !!watches?.some((watch) => deriveWatch(watch).hitTarget);
  const hasUnread = (notifications?.unreadCount ?? 0) > 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Math.max(insets.bottom, TAB_BAR.inset),
          marginHorizontal: TAB_BAR.inset,
          height: TAB_BAR.height,
          borderRadius: TAB_BAR.height / 2,
          backgroundColor: TAB_BAR_COLOR,
          borderTopWidth: 0,
          // 🔴 ضروري: BottomTabBar بيحط `paddingBottom: insets.bottom` جوّا
          // الشريط. مع ارتفاع ثابت، هالحشوة بتاكل من جوّا وبتزيح الأيقونات
          // لفوق وبتخلي مساحة ميتة تحت
          paddingBottom: 0,
          paddingHorizontal: 0,
          // ظل خفيف يرفع الشريط عن المحتوى — أندرويد بياخد elevation
          shadowColor: '#14151A',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.18,
          shadowRadius: 16,
          elevation: 10,
        },
        // إطار الأيقونة بيملا المساحة المتبقّية بالضبط (الارتفاع ناقص حشوة
        // الزر الثابتة فوق وتحت)، والمكتبة بتوسّط محتواه لحالها — فما في
        // حاجة لأرقام تخمينية تدفع الأيقونة لتحت
        tabBarIconStyle: {
          width: TAB_BAR.pill.width,
          height: TAB_BAR.height - TAB_BAR.itemPadding * 2,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          // الاسم مخفي بصريًا بس بيضل هو التسمية لقارئ الشاشة
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                icon={tab.icon}
                showBadge={
                  !focused &&
                  ((tab.name === 'watchlist' && hasHitTarget) ||
                    (tab.name === 'notifications' && hasUnread))
                }
              />
            ),
          }}
          listeners={{
            tabPress: () => {
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            },
          }}
        />
      ))}
    </Tabs>
  );
}
