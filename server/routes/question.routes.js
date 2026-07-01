import { Router } from 'express'

import {
  createQuestion,
  deleteQuestion,
  getQuestions,
  reorderQuestions,
  updateQuestion,
} from '../controllers/question.controller.js'
import { asyncHandler, validateRequest } from '../middleware/validateRequest.js'
import { uploadSingleImage } from '../utils/fileUpload.js'

const router = Router({ mergeParams: true })

const createQuestionValidator = ({ body }) => {
  const errors = []

  if (!body.answer || typeof body.answer !== 'string' || !body.answer.trim()) {
    errors.push('answer is required')
  }

  return errors
}

const updateQuestionValidator = ({ body, file }) => {
  const errors = []

  if (
    body.answer !== undefined &&
    (typeof body.answer !== 'string' || !body.answer.trim())
  ) {
    errors.push('answer must be a non-empty string')
  }

  if (body.order !== undefined) {
    const order = Number(body.order)
    if (!Number.isInteger(order) || order <= 0) {
      errors.push('order must be a positive integer')
    }
  }

  if (!file && body.answer === undefined && body.order === undefined) {
    errors.push('at least one field is required')
  }

  return errors
}

const reorderValidator = ({ body }) => {
  const errors = []
  const questionIds = body.questionIds

  if (!Array.isArray(questionIds) || questionIds.length === 0) {
    errors.push('questionIds must be a non-empty array')
  }

  if (Array.isArray(questionIds) && questionIds.some((id) => typeof id !== 'string')) {
    errors.push('questionIds must contain only strings')
  }

  return errors
}

router.get('/', asyncHandler(getQuestions))
router.post(
  '/',
  uploadSingleImage('image'),
  validateRequest(createQuestionValidator),
  asyncHandler(createQuestion),
)
router.put(
  '/:questionId',
  uploadSingleImage('image'),
  validateRequest(updateQuestionValidator),
  asyncHandler(updateQuestion),
)
router.delete('/:questionId', asyncHandler(deleteQuestion))
router.patch(
  '/reorder',
  validateRequest(reorderValidator),
  asyncHandler(reorderQuestions),
)

export default router
