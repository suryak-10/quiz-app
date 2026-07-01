export const queryKeys = {
  quizzes: ['quizzes'] as const,
  quiz: (quizId: string | null) => ['quiz', quizId] as const,
  questions: (quizId: string | null) => ['questions', quizId] as const,
}
