import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';

import { ApiError } from '@/lib/api/errors';
import { Button } from './Button';
import { Card } from './Card';

type IconName = keyof typeof Ionicons.glyphMap;

export interface StateCopy {
  title: string;
  body: string;
  icon: IconName;
  /** يعني الحالة خطأ حقيقي — بتاخد لون الماركة بدل الرمادي */
  severe: boolean;
  /** رمز الحالة للعرض الصغير أسفل النص، متل ما بشاشة states */
  code?: string;
}

/**
 * ترجمة `ApiError` لنص عربي مفهوم.
 *
 * النصوص مأخوذة حرفيًا من شاشة «حالات فاضية وأخطاء» بالتصميم، عشان
 * الحالات تنعرض بنفس الصياغة يلي انتصمّمت إلها بدل رسائل تقنية خام.
 *
 * مصدّرة لأن الطفرات (mutations) كمان بتحتاجها — متل 409 عند إضافة مراقبة
 * موجودة أصلاً.
 */
export function describeError(error: ApiError): StateCopy {
  if (error.isNetwork) {
    return {
      title: 'ما في اتصال',
      body: error.message,
      icon: 'cloud-offline-outline',
      severe: true,
    };
  }

  if (error.isLocationRequired) {
    return {
      title: 'الموقع مطلوب قبل البحث',
      body: 'الأسعار مرتبطة بمنطقتك، فلازم نعرف موقعك أول شي.',
      icon: 'location-outline',
      severe: true,
      code: '403 · location required',
    };
  }

  if (error.isRateLimited) {
    return {
      title: 'هدّي شوي',
      body: 'وصلت للحد الأقصى من الطلبات. جرّب بعد دقيقة.',
      icon: 'time-outline',
      severe: false,
      code: '429 · rate limited',
    };
  }

  if (error.status === 410) {
    return {
      title: 'المرجع للمنتج ما عاد صالح',
      body: 'مراجع SerpAPI بتنتهي بعد فترة. ارجع للبحث وافتح المنتج من جديد.',
      icon: 'link-outline',
      severe: false,
      code: '410 · token expired',
    };
  }

  if (error.isConflict) {
    return {
      title: 'هالجهاز مراقَب أصلاً',
      body: 'بتلاقيه بقائمة المراقبة. احذف المراقبة القديمة إذا بدك تغيّر السعر المستهدف.',
      icon: 'copy-outline',
      severe: false,
      code: '409 · duplicate',
    };
  }

  // 404 على /api/user/me بالذات معناها إنه الـ webhook تبع Clerk ما اشتغل،
  // فالمستخدم موجود عند Clerk بس مش موجود بقاعدة بياناتنا. هي أكتر حالة فشل
  // متوقّعة بأول تجريب، ولازم تنقال صريحة بدل «ما لقينا شي».
  if (error.isNotFound) {
    return {
      title: 'ما لقينا حسابك على الخادم',
      body: 'الحساب انعمل عند Clerk بس ما وصل للخادم. تأكد إنه الـ webhook مسجّل وشغّال.',
      icon: 'person-remove-outline',
      severe: true,
      code: '404 · not found',
    };
  }

  if (error.isUpstreamFailure) {
    return {
      title: 'مزوّد البيانات ما استجاب',
      body: 'المشكلة مش عندك. جرّب بعد شوي.',
      icon: 'server-outline',
      severe: true,
      code: '502 · upstream',
    };
  }

  return {
    title: 'صار خطأ',
    body: error.message,
    icon: 'alert-circle-outline',
    severe: true,
    code: error.status ? `${error.status}` : undefined,
  };
}

interface QueryStateProps {
  isLoading?: boolean;
  /**
   * نص تحت الدوّارة. بينحط بس لما يكون الانتظار طويل ومعروف السبب — متل
   * انتظار وصول المستخدم من webhook بعد التسجيل. دوّارة صامتة لدقيقة
   * بتخلي المستخدم يحسب إنه التطبيق علق.
   */
  loadingMessage?: string;
  loadingHint?: string;
  error?: ApiError | null;
  /** نجح الطلب بس ما رجّع ولا عنصر */
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
  emptyIcon?: IconName;
  emptyAction?: { label: string; onPress: () => void };
  onRetry?: () => void;
  className?: string;
}

/**
 * بلوك واحد بيغطي التحميل والخطأ والفراغ.
 *
 * بيرجّع `null` لما ما يكون في شي يُعرض، فالشاشة بتقدر تحطّه جوا تخطيطها
 * (تحت الهيدر مثلاً) وتعرض المحتوى بشكل طبيعي لما يوصل.
 */
export function QueryState({
  isLoading = false,
  loadingMessage,
  loadingHint,
  error = null,
  isEmpty = false,
  emptyTitle = 'ما لقينا نتائج',
  emptyBody = 'جرّب اسم أقصر أو شيل بعض الفلاتر.',
  emptyIcon = 'search-outline',
  emptyAction,
  onRetry,
  className = '',
}: QueryStateProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <View className={`items-center justify-center px-8 py-16 ${className}`}>
        <ActivityIndicator size="large" color="#F0434A" />

        {loadingMessage ? (
          <Text className="mt-4 text-center font-semibold text-[14px] text-tx">
            {loadingMessage}
          </Text>
        ) : null}

        {loadingHint ? (
          <Text className="mt-1.5 text-center font-sans text-[12px] leading-[21px] text-muted">
            {loadingHint}
          </Text>
        ) : null}
      </View>
    );
  }

  if (error) {
    const copy = describeError(error);

    // 403 إلها فعل واضح ووحيد: يروح يحدد موقعه
    const action = error.isLocationRequired
      ? { label: 'حدّد موقعي', onPress: () => router.push('/location') }
      : onRetry
        ? { label: 'حاول مرة تانية', onPress: onRetry }
        : null;

    return (
      <Card
        className={`items-center px-5 py-6 ${copy.severe ? 'border-brand/30' : ''} ${className}`}
      >
        <View
          className={`mb-3.5 h-[60px] w-[60px] items-center justify-center rounded-panel ${
            copy.severe ? 'bg-tint' : 'bg-chip'
          }`}
        >
          <Ionicons
            name={copy.icon}
            size={24}
            color={copy.severe ? '#F0434A' : '#9A9DA8'}
          />
        </View>

        <Text className="mb-1.5 text-center font-bold text-[15px] text-tx">
          {copy.title}
        </Text>
        <Text className="text-center font-sans text-[12px] leading-[21px] text-muted">
          {copy.body}
        </Text>

        {action ? (
          <Button
            label={action.label}
            onPress={action.onPress}
            variant={copy.severe ? 'primary' : 'secondary'}
            className="mt-4 self-stretch"
          />
        ) : null}
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card className={`items-center px-5 py-6 ${className}`}>
        <View className="mb-3.5 h-[60px] w-[60px] items-center justify-center rounded-panel bg-tint">
          <Ionicons name={emptyIcon} size={24} color="#F0434A" />
        </View>

        <Text className="mb-1.5 text-center font-bold text-[15px] text-tx">
          {emptyTitle}
        </Text>
        <Text className="text-center font-sans text-[12px] leading-[21px] text-muted">
          {emptyBody}
        </Text>

        {emptyAction ? (
          <Button
            label={emptyAction.label}
            onPress={emptyAction.onPress}
            variant="secondary"
            className="mt-4 self-stretch"
          />
        ) : null}
      </Card>
    );
  }

  return null;
}
