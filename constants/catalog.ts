/**
 * الفئات والماركات المعروضة بالفلاتر وشاشة الرئيسية.
 *
 * ⚠️ الباك إند بيلزق `name + brand + category` بنص بحث واحد بيروح لـ
 * SerpAPI (`buildSerpApiQuery` بـ product.service.js) — لأن محرّك
 * google_shopping ما عندو parameters منفصلة للماركة والفئة.
 *
 * فلو بعتنا العنوان العربي كما هو، البحث بيصير `"iPhone 15 جوالات"` والنتايج
 * بتخرب. لهيك كل فئة بتحمل **مصطلح بحث لاتيني** منفصل عن عنوانها العربي:
 * العنوان للعرض بس، والمصطلح هو يلي بينبعت.
 */

export interface Category {
  id: string;
  /** للعرض بالواجهة */
  label: string;
  /** يلي بينبعت فعليًا لـ SerpAPI */
  term: string;
}

export const CATEGORIES: Category[] = [
  { id: 'phones', label: 'جوالات', term: 'smartphone' },
  { id: 'laptops', label: 'لابتوبات', term: 'laptop' },
  { id: 'headphones', label: 'سماعات', term: 'headphones' },
  { id: 'watches', label: 'ساعات', term: 'smartwatch' },
  { id: 'tablets', label: 'تابلت', term: 'tablet' },
];

export function findCategoryByTerm(term: string | undefined): Category | null {
  if (!term) return null;
  return CATEGORIES.find((c) => c.term === term) ?? null;
}

/** ماركات التصميم — لاتينية أصلاً فبتنبعت كما هي */
export const BRANDS = ['Apple', 'Samsung', 'Sony', 'Xiaomi', 'HP'] as const;

/** خيارات الترتيب المحلية.
 *
 * التصميم بيعرض أربعة، بس «الأقرب لي» و«خصم أكبر» ما إلهن أي مصدر بيانات:
 * نتيجة البحث ما فيها لا مسافة ولا سعر قبل الخصم. فمنعرض الاتنين يلي
 * بينحسبوا فعليًا من `Product`.
 */
export type SortKey = 'cheapest' | 'rating';

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'cheapest', label: 'الأرخص أولاً' },
  { key: 'rating', label: 'الأعلى تقييمًا' },
];
