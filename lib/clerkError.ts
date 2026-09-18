import { isClerkAPIResponseError } from '@clerk/expo';

/**
 * أخطاء Clerk بتوصل بالإنجليزي دايمًا، وواجهتنا كلها عربية.
 *
 * منترجم الحالات يلي المستخدم فعليًا بيوقع فيها عبر `code` (وهو المعرّف
 * المستقر حسب توثيق Clerk — `message` ما بيضمنوا ثباتها)، وللباقي منرجع
 * `longMessage` كما هي: إنجليزية بس مفيدة، أحسن من «صار خطأ» مبهمة.
 */
const MESSAGES: Record<string, string> = {
  form_identifier_not_found: 'ما في حساب مسجّل بهالبريد.',
  form_password_incorrect: 'كلمة السر غلط. جرّب مرة تانية.',
  form_identifier_exists: 'هالبريد مستخدم بحساب موجود. سجّل دخولك بدالو.',
  form_param_format_invalid: 'صيغة البريد الإلكتروني مش صحيحة.',
  form_param_nil: 'في حقل مطلوب فاضي.',
  form_password_length_too_short: 'كلمة السر قصيرة — لازم 8 محارف على الأقل.',
  form_password_pwned:
    'هالكلمة ظهرت بتسريبات معروفة. اختار وحدة غيرها لحماية حسابك.',
  form_password_validation_failed: 'كلمة السر ما بتحقق الشروط المطلوبة.',
  form_code_incorrect: 'الكود غلط. تأكد من الأرقام وجرّب مرة تانية.',
  verification_expired: 'انتهت صلاحية الكود. اطلب كود جديد.',
  verification_failed: 'فشل التحقق. اطلب كود جديد.',
  session_exists: 'أنت مسجّل دخول أصلاً.',
  too_many_requests: 'محاولات كتير بوقت قصير. استنى شوي وجرّب من جديد.',
};

/** الشكل الجديد: كل نداء بيرجّع `{ error }` وهو نسخة من `ClerkError` بـ `code` مسطّح */
function isFlatClerkError(value: unknown): value is { code: string; message: string; longMessage?: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { code?: unknown }).code === 'string'
  );
}

export function clerkErrorMessage(error: unknown): string {
  if (isFlatClerkError(error)) {
    return MESSAGES[error.code] ?? error.longMessage ?? error.message ?? 'ما قدرنا نكمّل العملية.';
  }

  // الشكل القديم — ردود الـ API الخام بتجي بمصفوفة errors
  if (isClerkAPIResponseError(error)) {
    const first = error.errors?.[0];
    if (first) {
      return (
        MESSAGES[first.code] ??
        first.longMessage ??
        first.message ??
        'ما قدرنا نكمّل العملية.'
      );
    }
  }

  if (error instanceof Error) return error.message;
  return 'ما قدرنا نكمّل العملية.';
}
