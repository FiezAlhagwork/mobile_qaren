import axios from 'axios';

/**
 * الباك إند بيرجّع تلات أشكال مختلفة عند الخطأ:
 *   1. المعتاد        → { success: false, message }
 *   2. 429 و sanitizeParams → { error: "..." }
 *   3. انقطاع شبكة أو مهلة  → ما في رد أصلاً
 *
 * هالملف بيوحّدهن كلهن بصنف واحد، فالشاشات بتتعامل مع شكل واحد بس.
 */
export class ApiError extends Error {
  /** null يعني ما وصلنا للسيرفر إطلاقًا (شبكة أو مهلة) */
  readonly status: number | null;
  /** أخطاء الحقول من zod، لو الرسالة كانت JSON قابل للتفكيك */
  readonly fieldErrors: Record<string, string[]> | null;

  constructor(
    message: string,
    status: number | null,
    fieldErrors: Record<string, string[]> | null = null,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  get isNetwork(): boolean {
    return this.status === null;
  }
  get isUnauthorized(): boolean {
    return this.status === 401;
  }
  /** 403 — الموقع مش محدد. البحث محجوب لحد ما ينتحدد */
  get isLocationRequired(): boolean {
    return this.status === 403;
  }
  get isNotFound(): boolean {
    return this.status === 404;
  }
  /** 409 — عم يراقب نفس المنتج مرتين */
  get isConflict(): boolean {
    return this.status === 409;
  }
  get isRateLimited(): boolean {
    return this.status === 429;
  }
  /** 502 — فشل SerpAPI أو Gemini */
  get isUpstreamFailure(): boolean {
    return this.status === 502;
  }
}

/**
 * أخطاء zod بتوصل كـ **نص JSON** جوا حقل message، لأن errorHandler بالسيرفر
 * بيعمل JSON.stringify(err.flatten().fieldErrors).
 * منحاول نفكّها لخريطة حقول، عشان النماذج تعلّم الحقل الغلط بدل ما تعرض
 * JSON خام للمستخدم.
 */
function parseFieldErrors(
  message: string,
): { fieldErrors: Record<string, string[]>; summary: string } | null {
  if (!message.startsWith('{')) return null;

  try {
    const parsed: unknown = JSON.parse(message);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }

    const fieldErrors: Record<string, string[]> = {};
    for (const [field, messages] of Object.entries(parsed)) {
      if (Array.isArray(messages) && messages.every((m) => typeof m === 'string')) {
        fieldErrors[field] = messages;
      }
    }

    if (Object.keys(fieldErrors).length === 0) return null;

    // أول رسالة صالحة للعرض المباشر
    const summary = Object.values(fieldErrors)[0][0];
    return { fieldErrors, summary };
  } catch {
    return null;
  }
}

/** بيستخرج الرسالة من أي من الشكلين يلي بيرجّعهن السيرفر */
function extractMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const record = body as Record<string, unknown>;

  if (typeof record.message === 'string') return record.message;
  if (typeof record.error === 'string') return record.error; // 429 و sanitizeParams

  return null;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    // ما في رد = ما وصلنا للسيرفر
    if (!error.response) {
      const isTimeout = error.code === 'ECONNABORTED';
      return new ApiError(
        isTimeout
          ? 'الطلب أخذ وقتًا أطول من المتوقع. حاول مرة تانية.'
          : 'ما قدرنا نوصل للخادم. تأكد من اتصالك بالإنترنت.',
        null,
      );
    }

    const { status, data } = error.response;
    const raw = extractMessage(data);

    if (raw) {
      const parsed = parseFieldErrors(raw);
      if (parsed) return new ApiError(parsed.summary, status, parsed.fieldErrors);
      return new ApiError(raw, status);
    }

    return new ApiError(`فشل الطلب (${status})`, status);
  }

  if (error instanceof Error) return new ApiError(error.message, null);

  return new ApiError('صار خطأ غير متوقع.', null);
}
