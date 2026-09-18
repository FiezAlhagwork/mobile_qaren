import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTabBarInset } from '@/components/ui/TabBar';

/**
 * الشاشة موجودة لأن التصميم بيعرض أربع تابات، بس محتواها مؤجّل:
 * feed الإشعارات بدو جدول وendpoint جديدين بالباك إند، والإشعارات نفسها
 * بدها build حقيقي (Expo Go ما بيدعم الإشعارات البعيدة).
 */
export default function NotificationsScreen() {
  // المحتوى متمركز، فبدون هالحشوة بينزاح تحت الشريط العائم
  const tabBarInset = useTabBarInset();

  return (
    <SafeAreaView
      style={{ paddingBottom: tabBarInset }}
      className="flex-1 items-center justify-center bg-bg px-10"
    >
      <View className="mb-4 h-[60px] w-[60px] items-center justify-center rounded-panel bg-chip">
        <Ionicons name="notifications-outline" size={24} color="#9A9DA8" />
      </View>
      <Text className="mb-1.5 font-bold text-[15px] text-tx">الإشعارات قريبًا</Text>
      <Text className="text-center font-sans text-[12px] leading-[21px] text-muted">
        تنبيهات نزول السعر بتوصلك على الجوال أول ما تنفعّل. صفحة السجل هون
        بتنبنى بالدفعة الجاية.
      </Text>
    </SafeAreaView>
  );
}
