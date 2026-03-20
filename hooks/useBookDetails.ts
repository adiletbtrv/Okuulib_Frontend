import { useQuery } from '@tanstack/react-query';
import type { WorkResponse } from '../interfaces/interfaces';
import { worksApi } from '../lib/api';

export const useBookDetails = (id: number) => {
  return useQuery<WorkResponse>({
    queryKey: ['book', id],
    queryFn: () => worksApi.getById(id),
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 10,
    retry: 2,
  });
};