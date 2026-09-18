import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { apiUrlFromHostUri } from './api/resolveApiUrl.ts';

/**
 * متغيرات البيئة مع تحقق fail-fast.
 *
 * ⚠️ لازم نكتب `process.env.EXPO_PUBLIC_X` **حرفيًا** — Expo بيستبدلها وقت
 * البناء بنص ثابت، فأي وصول ديناميكي (تفكيك، أقواس مربعة، حلقة) بيرجّع
 * undefined دايمًا.
 */

/** نفس `PORT` بـ server/.env */
const API_PORT = 8000;

const EXPLICIT_API_URL = process.env.EXPO_PUBLIC_API_URL;
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

/**
 * التجاوز الصريح بيغلب (للإنتاج، أو للتأشير على staging وقت التطوير)، وإلا
 * منشتقّ العنوان من مضيف Metro. الترتيب مقصود: بالتطوير الاشتقاق هو
 * الافتراضي عشان ما يضل حدا يحدّث IP يدويًا كل مرة تتبدّل الشبكة.
 */
function resolveApiUrl(): string {
  if (EXPLICIT_API_URL) return EXPLICIT_API_URL;

  const derived = apiUrlFromHostUri(
    Constants.expoConfig?.hostUri,
    Platform.OS,
    API_PORT,
  );
  if (derived) return derived;

  // بنوقع هون بدل ما نخلي الخطأ يطلع لاحقًا كفشل شبكة غامض بعمق axios
  throw new Error(
    'ما قدرنا نحدد عنوان الـ API. عادةً بينشتق تلقائيًا من خادم Expo، بس ' +
      'الاشتقاق ما بيشتغل بحزمة إنتاج ولا بوضع --tunnel. حط ' +
      'EXPO_PUBLIC_API_URL بـ mobile/.env وأعد تشغيل Expo بـ `npx expo start -c` ' +
      '(متغيرات EXPO_PUBLIC_ بتنقرأ وقت البناء، فإعادة التحميل السريع ما بتكفي).',
  );
}

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `متغير البيئة ${name} ناقص. ضيفه لـ mobile/.env وأعد تشغيل خادم Expo ` +
        `(متغيرات EXPO_PUBLIC_ بتنقرأ وقت البناء، فإعادة التحميل السريع ما بتكفي).`,
    );
  }
  return value;
}

export const env = {
  API_URL: resolveApiUrl(),
  CLERK_PUBLISHABLE_KEY: required(
    CLERK_PUBLISHABLE_KEY,
    'EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY',
  ),
} as const;
