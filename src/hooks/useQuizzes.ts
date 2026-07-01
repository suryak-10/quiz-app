import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchQuiz, fetchQuizzes, updateQuiz } from '../lib/api'
import { queryKeys } from '../lib/queryKeys'

export function useQuizzes() {
  const queryClient = useQueryClient()

  const quizzesQuery = useQuery({
    queryKey: queryKeys.quizzes,
    queryFn: fetchQuizzes,
  })

  const updateQuizMutation = useMutation({
    mutationFn: updateQuiz,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.quizzes }),
        queryClient.invalidateQueries({ queryKey: queryKeys.quiz(variables.id) }),
      ])
    },
  })

  return {
    quizzesQuery,
    updateQuizMutation,
  }
}

export function useSelectedQuiz(selectedQuizId: string | null) {
  const selectedQuizQuery = useQuery({
    queryKey: queryKeys.quiz(selectedQuizId),
    queryFn: () => fetchQuiz(selectedQuizId as string),
    enabled: Boolean(selectedQuizId),
  })

  return { selectedQuizQuery }
}
