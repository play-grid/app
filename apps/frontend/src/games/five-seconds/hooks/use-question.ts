import type { Difficulty } from '@guess-logo/shared/schemas/five-seconds';
import { useQuery } from '@tanstack/react-query';
import { getRandomQuestion } from '../services/questions.service';

export function useQuestion(categoryIds: string[], difficulty: Difficulty) {
  return useQuery({
    queryKey: ['question', categoryIds, difficulty],
    queryFn: () => getRandomQuestion(categoryIds, difficulty),
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
}
