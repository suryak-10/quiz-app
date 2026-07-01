import * as questionService from '../services/question.service.js'
import { sendSuccess } from '../utils/response.js'

export async function getQuestions(req, res) {
  const questions = await questionService.getQuestions(req.params.quizId)
  sendSuccess(res, 'Questions fetched successfully', questions)
}

export async function createQuestion(req, res) {
  const question = await questionService.createQuestion(req.params.quizId, {
    answer: req.body.answer,
    file: req.file,
  })

  sendSuccess(res, 'Question created successfully', question, 201)
}

export async function updateQuestion(req, res) {
  const question = await questionService.updateQuestion(
    req.params.quizId,
    req.params.questionId,
    {
      answer: req.body.answer,
      order: req.body.order,
      file: req.file,
    },
  )

  sendSuccess(res, 'Question updated successfully', question)
}

export async function deleteQuestion(req, res) {
  await questionService.deleteQuestion(req.params.quizId, req.params.questionId)
  sendSuccess(res, 'Question deleted successfully', null)
}

export async function reorderQuestions(req, res) {
  const questions = await questionService.reorderQuestions(req.params.quizId, req.body)
  sendSuccess(res, 'Questions reordered successfully', questions)
}
