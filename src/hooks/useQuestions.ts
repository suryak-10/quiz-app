import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createQuestion,
  deleteQuestion,
  fetchQuestions,
  reorderQuestions,
  updateQuestion,
} from '../lib/api'
import { queryKeys } from '../lib/queryKeys'

export function useQuestions(selectedQuizId: string | null) {
  const queryClient = useQueryClient()

  const questionsQuery = useQuery({
    queryKey: queryKeys.questions(selectedQuizId),
    queryFn: () => fetchQuestions(selectedQuizId as string),
    enabled: Boolean(selectedQuizId),
  })

  async function invalidateAll() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.questions(selectedQuizId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.quizzes }),
      queryClient.invalidateQueries({ queryKey: queryKeys.quiz(selectedQuizId) }),
    ])
  }

  const createQuestionMutation = useMutation({
    mutationFn: (payload: { answer: string; imageFile: File }) =>
      createQuestion(selectedQuizId as string, payload),
    onSuccess: invalidateAll,
  })

  const updateQuestionMutation = useMutation({
    mutationFn: (payload: {
      questionId: string
      answer: string
      imageFile?: File | null
    }) =>
      updateQuestion(selectedQuizId as string, payload.questionId, {
        answer: payload.answer,
        imageFile: payload.imageFile,
      }),
    onSuccess: invalidateAll,
  })

  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: string) => deleteQuestion(selectedQuizId as string, questionId),
    onSuccess: invalidateAll,
  })

  const reorderQuestionsMutation = useMutation({
    mutationFn: (questionIds: string[]) =>
      reorderQuestions(selectedQuizId as string, questionIds),
    onSuccess: invalidateAll,
  })

  return {
    questionsQuery,
    createQuestionMutation,
    updateQuestionMutation,
    deleteQuestionMutation,
    reorderQuestionsMutation,
  }
}
