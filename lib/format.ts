/**
 * تنسيق الأرقام والتواريخ للعرض.
 *
 * الفاصل الألفي معمول يدويًا مش بـ `Intl` — Hermes بتدعمها بس السلوك بيتغيّر
 * بين إصدارات المحرّك والأجهزة، وهاد شي بيبان بكل شاشة فما منراهن عليه.
 */

/** 3149 → "3,149" */
export function formatNumber(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? '-' : '';
  return sign + String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** 3149 → "3,149 ر.س" — الشكل يلي بيستخدمه التصميم بكل مكان */
export function formatSar(value: number): string {
  return `${formatNumber(value)} ر.س`;
}

/** -8.4 → "−8%" (بإشارة الطرح الحقيقية U+2212، مش الشرطة) */
export function formatPercent(value: number): string {
  const rounded = Math.round(value);
  if (rounded > 0) return `+${rounded}%`;
  if (rounded < 0) return `−${Math.abs(rounded)}%`;
  return '0%';
}

/**
 * ثقة Gemini → نسبة من 100.
 *
 * 🔴 المدى مش مضمون بين الميزتين: موجّه التوصية بيطلب صراحةً قيمة بين 0 و1،
 * بينما موجّه التنبؤ بيقول «رقم عادي» بس — فوارد يرجع 0.7 أو 70. منتعامل مع
 * الشكلين، وإلا شريط ثقة 70٪ بيطلع 7000٪ أو 0.7٪ حسب الميزة.
 */
export function confidencePercent(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  const percent = value <= 1 ? value * 100 : value;
  return Math.min(100, Math.round(percent));
}

/** "2026-08-30T00:00:00Z" → "30/8" — تسمية محور الرسم البياني */
export function dayMonth(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

/** 4.55 → "4.6" — التقييم دايمًا برقم عشري واحد */
export function formatRating(value: number): string {
  return value.toFixed(1);
}

/**
 * جمع التكسير بالعربي مش قاعدة وحدة: الواحد والاتنين إلهن صيغة خاصة،
 * ومن 3 لـ 10 جمع، ومن 11 وفوق مفرد منصوب.
 */
function arabicCount(
  n: number,
  one: string,
  two: string,
  few: string,
  many: string,
): string {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n <= 10) return `${n} ${few}`;
  return `${n} ${many}`;
}

/**
 * "قبل 3 ساعات" — لبطاقات المراقبة («آخر فحص قبل …»).
 * بيرجّع null لما يكون التاريخ فاضي أو غير صالح، فالشاشة بتقرر شو تعرض.
 */
export function relativeTime(iso: string | null): string | null {
  if (!iso) return null;

  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;

  const minutes = Math.floor((Date.now() - then) / 60000);
  if (minutes < 1) return 'الآن';
  if (minutes < 60) {
    return `قبل ${arabicCount(minutes, 'دقيقة', 'دقيقتين', 'دقائق', 'دقيقة')}`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `قبل ${arabicCount(hours, 'ساعة', 'ساعتين', 'ساعات', 'ساعة')}`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `قبل ${arabicCount(days, 'يوم', 'يومين', 'أيام', 'يوم')}`;
  }

  const months = Math.floor(days / 30);
  return `قبل ${arabicCount(months, 'شهر', 'شهرين', 'أشهر', 'شهر')}`;
}

/** "3 مراقبات نشطة" — نفس قاعدة الجمع، بس بدون «قبل» */
export function countLabel(
  n: number,
  one: string,
  two: string,
  few: string,
  many: string,
): string {
  return arabicCount(n, one, two, few, many);
}
