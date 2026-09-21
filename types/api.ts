/**
 * أنواع الـ API — مأخوذة حرفيًا من SERVER-API-DOCS.md.
 * أي تعديل بعقد الباك إند لازم ينعكس هون أولًا.
 */

// ─── الغلاف الموحّد ──────────────────────────────────────────────────────
// كل endpoint (ما عدا /health و429) بيرجّع بهالشكل. حقل data بينحذف بالكامل
// لما تكون القيمة null — متل رد حذف المراقبة
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface HealthResponse {
  status: string;
}

// ─── المستخدم ────────────────────────────────────────────────────────────
export type LocationSource = 'gps' | 'manual';

export interface UserLocation {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
  source: LocationSource | null;
  updatedAt: string | null;
}

export interface User {
  _id: string;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  location: UserLocation;
  preferences: {
    pushNotificationsEnabled: boolean;
  };
  pushToken: string | null;
  createdAt: string;
  updatedAt: string;
}

// كل الحقول مطلوبة — updateLocationSchema بالسيرفر مش متساهلة.
// updatedAt بينحسب بالسيرفر، ما بينبعت من هون
export interface UpdateLocationInput {
  latitude: number;
  longitude: number;
  city: string | null;
  country: string | null;
  source: LocationSource;
}

export interface UpdatePushTokenInput {
  pushToken: string;
}

export interface UserPreferences {
  pushNotificationsEnabled: boolean;
}

export type UpdatePreferencesInput = UserPreferences;

// ─── المنتجات ────────────────────────────────────────────────────────────
export interface InstallmentInfo {
  monthlyPrice: number;
  months: number;
}

/**
 * المنتج بعد ما يمر على normalizeProduct بالسيرفر.
 * price دايمًا رقم بنتائج البحث — السيرفر بيفلتر المنتجات يلي سعرها null.
 */
export interface Product {
  id: string | null;
  /** لازم لإنشاء مراقبة — بدونه ما في مراقبة */
  productToken: string | null;
  name: string;
  price: number;
  priceDisplay: string | null;
  hasInstallment: boolean;
  installmentInfo: InstallmentInfo | null;
  store: string;
  image: string | null;
  rating: number | null;
  reviews: number | null;
  link: string | null;
}

export interface SearchFilters {
  name: string;
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface SearchResponse {
  /** مرتبة تصاعديًا بالسعر */
  results: Product[];
  priceComparison: {
    cheapest: Product | null;
    mostExpensive: Product | null;
    priceDifference: number;
  };
}

/** عرض متجر واحد ضمن تفاصيل المنتج */
export interface StoreOffer {
  name: string;
  logo: string | null;
  link: string | null;
  /** مجمّعة من details_and_offers — مثلاً "In stock online" */
  note: string | null;
  price: number;
  priceDisplay: string | null;
}

export interface ProductSpec {
  k: string;
  v: string;
}

/**
 * GET /api/products/:id/details
 *
 * ⚠️ ما في "السعر قبل الخصم" برد SerpAPI لهالـ engine، فنسبة الخصم يلي
 * بالتصميم بتنعرض بس لما تكون متوفرة من نتيجة البحث.
 */
export interface ProductDetails {
  productId: string;
  title: string;
  brand: string | null;
  rating: number | null;
  reviews: number | null;
  images: string[];
  description: string | null;
  specs: ProductSpec[];
  /** مرتبة تصاعديًا بالسعر */
  stores: StoreOffer[];
  cheapest: StoreOffer | null;
  mostExpensive: StoreOffer | null;
}

// ─── المراقبة ────────────────────────────────────────────────────────────
export interface Watch {
  _id: string;
  userId: string;
  productId: string;
  productToken: string;
  productName: string;
  productImage: string | null;
  /** معلومة عرض فقط — بتتحدث كل تشيك لتعكس مين حاليًا الأرخص */
  store: string;
  priceAtAdd: number;
  targetPrice: number;
  lastCheckedPrice: number | null;
  lastCheckedAt: string | null;
  isActive: boolean;
  expiresAt: string;
  notifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWatchInput {
  productId: string;
  productToken: string;
  productName: string;
  productImage?: string | null;
  store: string;
  priceAtAdd: number;
  targetPrice: number;
}

// ─── تاريخ الأسعار ───────────────────────────────────────────────────────
export interface PriceHistoryPoint {
  _id: string;
  watchId: string;
  price: number;
  store: string;
  checkedAt: string;
}

export interface HistoryStats {
  min: number;
  max: number;
  avg: number;
}

export interface HistoryResponse {
  /** مرتبة تصاعديًا بـ checkedAt، آخر 30 يوم */
  dataPoints: PriceHistoryPoint[];
  /** null لما ما يكون في ولا قراءة بعد */
  stats: HistoryStats | null;
}

// ─── الذكاء الاصطناعي ────────────────────────────────────────────────────
/** نفس المدخل للتوصية والتنبؤ — productInputSchema بالسيرفر */
export interface ProductInput {
  productId: string;
  name: string;
  price: number;
  store?: string;
  category?: string;
  rating?: number | null;
  reviews?: number | null;
}

export type Decision = 'buy_now' | 'wait';

export interface Recommendation {
  /** معرّف إنجليزي دايمًا — ما بينترجم */
  decision: Decision;
  /** بالعربي */
  reason: string;
  confidence: number;
  basedOnHistory: boolean;
  cached: boolean;
}

export type Trend = 'rising' | 'falling' | 'stable';
export type BestTimeToBuy = 'now' | 'soon' | 'wait';

export interface PredictionFactors {
  priceHistory: string;
  productLifecycle: string;
  currentDiscounts: string;
  marketBehavior: string;
}

export interface Prediction {
  /** معرّف إنجليزي دايمًا — ما بينترجم */
  trend: Trend;
  /** بإشارة: سالب = نزول متوقع */
  expectedChangePercent: number;
  horizonWeeks: number;
  /** معرّف إنجليزي دايمًا */
  bestTimeToBuy: BestTimeToBuy;
  /** بالعربي */
  reason: string;
  confidence: number;
  /** بالعربي */
  analysis: string;
  /** كلها بالعربي */
  factors: PredictionFactors;
  cached: boolean;
}

/**
 * تنبيه نزول سعر. بينكتب من كرون السيرفر لما يتحقق هدف مراقبة.
 *
 * ⚠️ الاسم `AppNotification` مش `Notification` عن قصد — `Notification` اسم
 * عام محجوز بأنواع DOM، والتظليل عليه بيعمل تضاربًا صامتًا.
 *
 * حقول المنتج **نسخة وقت الحدث**، مش مرجع للمراقبة: المستخدم بيقدر يحذف
 * المراقبة والتنبيه لازم يضل مقروء بالسجل. ولهيك `watchId` بيصير `null`
 * للصفوف اليتيمة — بتنعرض بس ما بتفتح سجل أسعار.
 */
export interface AppNotification {
  _id: string;
  watchId: string | null;
  productName: string;
  productImage: string | null;
  /** السعر يلي حقّق الهدف */
  price: number;
  targetPrice: number;
  store: string;
  /** null = غير مقروء */
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  /** على كل غير المقروء، مش على الصفحة المعروضة بس */
  unreadCount: number;
}
