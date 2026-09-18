/**
 * اشتقاق عنوان الـ API من مضيف خادم التطوير.
 *
 * المشكلة يلي بيحلها: `localhost` ما بينفع على جهاز حقيقي — بيشير للجوال نفسو
 * مش للكمبيوتر. والبديل التقليدي (كتابة IP يدويًا بـ `.env`) بينكسر كل مرة
 * تتبدّل الشبكة، وبيطلع كخطأ 404/شبكة غامض بعدين.
 *
 * الملاحظة المفتاحية: التطبيق **أصلاً محمّل من كمبيوترك** عبر Metro، فعنوانه
 * معروف وقت التشغيل (`Constants.expoConfig.hostUri` = "192.168.0.105:8081").
 * منبدّل المنفذ وخلص.
 *
 * الملف نقي عن قصد — بلا `expo-constants` ولا `react-native` — عشان ينختبر
 * بـ node لحاله. نفس نمط `lib/query/retry.ts`.
 */

/** بمحاكي أندرويد، `localhost` هو المحاكي نفسه؛ المضيف بينوصلّو بهالعنوان */
const ANDROID_EMULATOR_HOST = '10.0.2.2';

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

export function apiUrlFromHostUri(
  /** "192.168.0.105:8081" — من `Constants.expoConfig?.hostUri` */
  hostUri: string | undefined | null,
  /** `Platform.OS` */
  platform: string,
  port: number,
): string | null {
  if (!hostUri) return null; // حزمة إنتاج: ما في خادم تطوير

  const host = hostUri.split(':')[0]?.trim();
  if (!host) return null;

  const isLocal = host === 'localhost' || host === '127.0.0.1';

  // وضع `--tunnel` بيعطي دومين عام (‎*.exp.direct)؛ سيرفرنا المحلي مش عليه،
  // فمنرجّع null ومنخلي التجاوز الصريح يتكفّل
  if (!isLocal && !IPV4.test(host)) return null;

  if (isLocal && platform === 'android') {
    return `http://${ANDROID_EMULATOR_HOST}:${port}`;
  }

  return `http://${host}:${port}`;
}
