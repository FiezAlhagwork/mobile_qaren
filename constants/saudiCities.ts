export interface SaudiCity {
  /** الاسم الإنجليزي — هو يلي بينبعت للسيرفر كـ `location.city` */
  en: string;
  /** الاسم العربي — للعرض بس */
  ar: string;
  latitude: number;
  longitude: number;
}

export const SUPPORTED_COUNTRY = 'Saudi Arabia';

/**
 * المدن المدعومة.
 *
 * ⚠️ الأسماء الإنجليزية **مش اختيارية**: السيرفر بيترجمها لأسماء SerpAPI
 * القانونية عبر خريطة ثابتة (`server/src/shared/constants/saudiCities.js`)،
 * وأي اسم مش موجود بالخريطة بيترفض بـ 400. فأي إضافة هون لازم تنضاف هناك
 * كمان، وبعد ما تتأكد إنه SerpAPI بتعرف المدينة أصلاً عبر
 * `serpapi.com/locations.json`.
 *
 * الإحداثيات موجودة لأن `updateLocationSchema` بيفرض `latitude`/`longitude`
 * كأرقام — مش لأنها بتستخدم بالبحث نفسه.
 */
export const SAUDI_CITIES: SaudiCity[] = [
  { en: 'Riyadh', ar: 'الرياض', latitude: 24.7136, longitude: 46.6753 },
  { en: 'Jeddah', ar: 'جدة', latitude: 21.4858, longitude: 39.1925 },
  { en: 'Makkah', ar: 'مكة المكرمة', latitude: 21.3891, longitude: 39.8579 },
  { en: 'Madinah', ar: 'المدينة المنورة', latitude: 24.5247, longitude: 39.5692 },
  { en: 'Dammam', ar: 'الدمام', latitude: 26.4207, longitude: 50.0888 },
  { en: 'Al Khobar', ar: 'الخبر', latitude: 26.2794, longitude: 50.2083 },
  { en: 'Dhahran', ar: 'الظهران', latitude: 26.2361, longitude: 50.0393 },
  { en: 'Taif', ar: 'الطائف', latitude: 21.2854, longitude: 40.4183 },
  { en: 'Buraydah', ar: 'بريدة', latitude: 26.326, longitude: 43.975 },
  { en: 'Tabuk', ar: 'تبوك', latitude: 28.3835, longitude: 36.5662 },
  { en: 'Abha', ar: 'أبها', latitude: 18.2465, longitude: 42.5117 },
  { en: 'Hail', ar: 'حائل', latitude: 27.5114, longitude: 41.7208 },
  { en: 'Najran', ar: 'نجران', latitude: 17.4924, longitude: 44.1277 },
  { en: 'Jazan', ar: 'جازان', latitude: 16.8894, longitude: 42.5706 },
  { en: 'Al Jubail', ar: 'الجبيل', latitude: 27.0174, longitude: 49.6225 },
  { en: 'Yanbu', ar: 'ينبع', latitude: 24.0895, longitude: 38.0618 },
  { en: 'Al Qatif', ar: 'القطيف', latitude: 26.5196, longitude: 50.0115 },
  { en: 'Al Hofuf', ar: 'الهفوف', latitude: 25.3647, longitude: 49.5878 },
  { en: 'Arar', ar: 'عرعر', latitude: 30.9753, longitude: 41.0381 },
];

/**
 * توحيد النص قبل المقارنة: الهمزات والتاء المربوطة والألف المقصورة بتنكتب
 * بأشكال مختلفة، والمستخدم مش رح يضبطها وهو عم يكتب بسرعة.
 */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[ً-ْ]/g, '') // التشكيل
    .trim();
}

/** «خبر» لازم توصّل لـ«الخبر»، و«jed» لـ«جدة» */
export function cityMatches(city: SaudiCity, query: string): boolean {
  const needle = normalize(query);
  if (!needle) return true;

  const haystack = [
    city.ar,
    city.ar.replace(/^ال/, ''), // بدون أداة التعريف
    city.en,
  ]
    .map(normalize)
    .join(' ');

  return haystack.includes(needle);
}

export function findCityByEnglishName(name: string | null): SaudiCity | null {
  if (!name) return null;
  return SAUDI_CITIES.find((city) => city.en === name) ?? null;
}

/** الاسم العربي للعرض، مع الرجوع للإنجليزي لو كان الموقع محفوظ بمدينة قديمة */
export function displayCityName(name: string | null): string | null {
  if (!name) return null;
  return findCityByEnglishName(name)?.ar ?? name;
}
