import { useAuth } from '@clerk/expo';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { ApiError } from '@/lib/api/errors';
import { clearSelectedProducts } from '@/lib/selectedProduct';

/**
 * جلسة Clerk ممكن تنتهي أو تنسحب بينما التطبيق لسا فاتح. بهالحالة كل نداء
 * بيرجّع 401 والمستخدم بيضل "مسجّل دخول" ظاهريًا وكل شي بيفشل بصمت.
 *
 * هاد الـ hook بيحوّل أول 401 لتسجيل خروج فعلي، فالحُرّاس بيرجّعوه لشاشة
 * الدخول بدل ما يعلق بتطبيق مكسور.
 */
export function useAuthGuard() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();

  const handleApiError = useCallback(
    async (error: unknown) => {
      if (!(error instanceof ApiError) || !error.isUnauthorized) return false;

      // منفضّي الكاش أول شي — وإلا بيضل يعرض بيانات المستخدم السابق.
      // المنتجات المختارة عايشة بـ Map خارج TanStack، فلازم تنفضى لحالها
      queryClient.clear();
      clearSelectedProducts();
      await signOut();
      return true;
    },
    [queryClient, signOut],
  );

  return { handleApiError };
}
