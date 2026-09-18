import type { SearchFilters } from '@/types/api';

/**
 * مصنع مفاتيح الاستعلام — مصدر وحيد لكل مفاتيح TanStack Query،
 * عشان الإبطال (invalidation) ما يعتمد على نصوص متناثرة بالكود.
 */
export const queryKeys = {
  health: ['health'] as const,

  user: {
    all: ['user'] as const,
    me: () => [...queryKeys.user.all, 'me'] as const,
  },

  products: {
    all: ['products'] as const,
    search: (filters: SearchFilters) =>
      [...queryKeys.products.all, 'search', filters] as const,
    /**
     * بـ productId بس — الـ productToken طويل وبيتغيّر بين عمليات البحث
     * لنفس المنتج، فحطّه بالمفتاح بيعمل miss بلا فايدة على نداء مدفوع
     */
    details: (productId: string) =>
      [...queryKeys.products.all, 'details', productId] as const,
  },

  watches: {
    all: ['watches'] as const,
    list: () => [...queryKeys.watches.all, 'list'] as const,
  },

  history: {
    all: ['history'] as const,
    byWatch: (watchId: string) => [...queryKeys.history.all, watchId] as const,
  },

  /**
   * ⚠️ مفتوحة بـ productId **بس**، مش بكائن المنتج كامل.
   * السيرفر بيكاش بـ productId لوحده لمدة 24 ساعة، فلو حطينا كل الكائن
   * بالمفتاح، أي تغيير بسيط بالسعر بيعمل miss على العميل بينما السيرفر
   * بيرجّع نفس الجواب المخزّن — نداء بلا فايدة على حساب حد الـ 5/دقيقة.
   */
  ai: {
    all: ['ai'] as const,
    recommendation: (productId: string) =>
      [...queryKeys.ai.all, 'recommendation', productId] as const,
    prediction: (productId: string) =>
      [...queryKeys.ai.all, 'prediction', productId] as const,
  },
} as const;
