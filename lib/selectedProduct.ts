import type { Product } from '@/types/api';

/**
 * تسليم المنتج المختار بين الشاشات.
 *
 * ليش مش route params: الـ `productToken` (وهو `immersive_product_page_token`
 * تبع SerpAPI) طوله **~2000 حرف** بردود حقيقية. حطّه بمسار التنقل بيولّد URL
 * وحش وطويل وبيخاطر بحدود المنصة.
 *
 * وليش مش كاش TanStack Query: `gcTime` عنّا 10 دقايق، وأي قيمة محطوطة بـ
 * `setQueryData` بلا مراقِب بتنمسح لما تخلص المهلة. يعني لو المستخدم رجّع
 * التطبيق للخلفية وهو بشاشة النتايج، بيرجع على شاشة منتج فاضية. هالـ Map
 * ما إلها إخلاء تلقائي.
 *
 * بتنفضى عند تسجيل الخروج مع كاش الاستعلامات — شوف `useAuthGuard`.
 */
const store = new Map<string, Product>();

export function setSelectedProduct(product: Product): void {
  if (!product.id) return; // منتج بلا معرّف ما بينفتح أصلاً
  store.set(product.id, product);
}

export function getSelectedProduct(productId: string | null): Product | null {
  if (!productId) return null;
  return store.get(productId) ?? null;
}

export function clearSelectedProducts(): void {
  store.clear();
}
