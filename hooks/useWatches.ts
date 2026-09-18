import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { ApiError } from '@/lib/api/errors';
import { queryKeys } from '@/lib/query/keys';
import { createWatch, deleteWatch, getWatches } from '@/services/watch.service';
import type { CreateWatchInput, Watch } from '@/types/api';

export function useWatches() {
  return useQuery<Watch[], ApiError>({
    queryKey: queryKeys.watches.list(),
    queryFn: getWatches,
  });
}

/** بيرمي ApiError بـ isConflict (409) لو المنتج مراقَب أصلاً */
export function useCreateWatch() {
  const queryClient = useQueryClient();

  return useMutation<Watch, ApiError, CreateWatchInput>({
    mutationFn: createWatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watches.all });
    },
  });
}

export function useDeleteWatch() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: deleteWatch,
    onSuccess: (_data, watchId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watches.all });
      // تاريخ مراقبة محذوفة ما إلو معنى، وما رح ينجلب تاني (بيرجّع 404)
      queryClient.removeQueries({ queryKey: queryKeys.history.byWatch(watchId) });
    },
  });
}
