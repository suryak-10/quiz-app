export type QuizSummary = {
  id: string
  title: string
  slug: string
  timer: number
  totalQuestions: number
}

export type Question = {
  id: string
  order: number
  image: string
  answer: string
  createdAt: string
  updatedAt: string
}

export type Quiz = {
  id: string
  title: string
  slug: string
  timer: number
  createdAt: string
  updatedAt: string
  questions: Question[]
}

export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  details?: string[]
}

export type QuestionFormValues = {
  answer: string
  imageFile: File | null
}

export type Toast = {
  id: string
  message: string
  tone: 'success' | 'error'
}
