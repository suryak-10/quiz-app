import type { ApiResponse, Question, Quiz, QuizSummary } from '../types/quiz'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

class ApiError extends Error {
  status: number
  details?: string[]

  constructor(message: string, status: number, details?: string[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  let payload: ApiResponse<T> | { status?: string }

  try {
    payload = await response.json()
  } catch {
    throw new ApiError('Unable to parse server response', response.status)
  }

  if (!response.ok) {
    const message =
      'message' in payload && typeof payload.message === 'string'
        ? payload.message
        : 'Request failed'
    const details =
      'details' in payload && Array.isArray(payload.details)
        ? payload.details
        : undefined
    throw new ApiError(message, response.status, details)
  }

  if (!('data' in payload)) {
    throw new ApiError('Unexpected response payload', response.status)
  }

  return payload.data
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init)
  return parseResponse<T>(response)
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.details?.length) {
      return error.details.join(', ')
    }

    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong'
}

export async function fetchQuizzes() {
  return request<QuizSummary[]>('/api/quizzes')
}

export async function fetchQuiz(quizId: string) {
  return request<Quiz>(`/api/quizzes/${quizId}`)
}

export async function updateQuiz(quiz: Pick<Quiz, 'id' | 'title' | 'slug' | 'timer'>) {
  return request<Quiz>(`/api/quizzes/${quiz.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: quiz.title,
      slug: quiz.slug,
      timer: quiz.timer,
    }),
  })
}

export async function fetchQuestions(quizId: string) {
  return request<Question[]>(`/api/quizzes/${quizId}/questions`)
}

export async function createQuestion(
  quizId: string,
  payload: { answer: string; imageFile: File },
) {
  const formData = new FormData()
  formData.append('answer', payload.answer)
  formData.append('image', payload.imageFile)

  return request<Question>(`/api/quizzes/${quizId}/questions`, {
    method: 'POST',
    body: formData,
  })
}

export async function updateQuestion(
  quizId: string,
  questionId: string,
  payload: { answer: string; imageFile?: File | null },
) {
  const formData = new FormData()
  formData.append('answer', payload.answer)

  if (payload.imageFile) {
    formData.append('image', payload.imageFile)
  }

  return request<Question>(`/api/quizzes/${quizId}/questions/${questionId}`, {
    method: 'PUT',
    body: formData,
  })
}

export async function deleteQuestion(quizId: string, questionId: string) {
  return request<null>(`/api/quizzes/${quizId}/questions/${questionId}`, {
    method: 'DELETE',
  })
}

export async function reorderQuestions(quizId: string, questionIds: string[]) {
  return request<Question[]>(`/api/quizzes/${quizId}/questions/reorder`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ questionIds }),
  })
}
