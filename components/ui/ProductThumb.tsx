import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { View } from 'react-native';

interface ProductThumbProps {
  uri: string | null;
  size: number;
  className?: string;
}

/**
 * صورة المنتج بمربّع ثابت.
 *
 * التصميم بيستخدم placeholder مخطّط قطريًا (repeating-linear-gradient)، وهاد
 * ما إلو مقابل بـ RN بدون مكتبة تدرّجات. فمنستبدله بمربّع `ph` وأيقونة —
 * نفس الوظيفة بلا تبعية جديدة.
 *
 * `contentFit="contain"` مقصود: صور المتاجر نِسبها مختلفة، والقص بيوكل
 * أطراف المنتج.
 */
export function ProductThumb({ uri, size, className = '' }: ProductThumbProps) {
  return (
    <View
      style={{ width: size, height: size }}
      className={`items-center justify-center overflow-hidden rounded-field bg-ph ${className}`}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          contentFit="contain"
          transition={150}
        />
      ) : (
        <Ionicons name="image-outline" size={size * 0.3} color="#9A9DA8" />
      )}
    </View>
  );
}
