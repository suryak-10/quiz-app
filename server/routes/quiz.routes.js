import { Router } from 'express'

import {
  createQuiz,
  deleteQuiz,
  getQuizById,
  getQuizzes,
  updateQuiz,
} from '../controllers/quiz.controller.js'
import { asyncHandler, validateRequest } from '../middleware/validateRequest.js'

const router = Router()

const quizValidator = ({ body }) => {
  const errors = []

  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    errors.push('title is required')
  }

  if (!body.slug || typeof body.slug !== 'string' || !body.slug.trim()) {
    errors.push('slug is required')
  }

  if (!Number.isFinite(Number(body.timer)) || Number(body.timer) <= 0) {
    errors.push('timer must be greater than 0')
  }

  return errors
}

router.get('/', asyncHandler(getQuizzes))
router.get('/:quizId', asyncHandler(getQuizById))
router.post('/', validateRequest(quizValidator), asyncHandler(createQuiz))
router.put('/:quizId', validateRequest(quizValidator), asyncHandler(updateQuiz))
router.delete('/:quizId', asyncHandler(deleteQuiz))

export default router
