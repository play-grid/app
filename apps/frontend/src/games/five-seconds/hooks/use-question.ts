import type { Difficulty } from '@guess-logo/shared/schemas/five-seconds';
import { useQuery } from '@tanstack/react-query';
import { getRandomQuestion } from '../services/questions.service';

export function useQuestion(
  categoryIds: string[],
  difficulty: Difficulty,
  excludeIds: string[],
) {
  return useQuery({
    queryKey: ['question', categoryIds, difficulty],
    queryFn: () => getRandomQuestion(categoryIds, difficulty, excludeIds),
    staleTime: 0,
    gcTime: 0,
    retry: false,
    enabled: false, // Only fetch manually
  });
}
