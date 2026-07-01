import * as quizService from '../services/quiz.service.js'
import { sendSuccess } from '../utils/response.js'

export async function getQuizzes(_req, res) {
  const quizzes = await quizService.getAllQuizzes()
  sendSuccess(res, 'Quizzes fetched successfully', quizzes)
}

export async function getQuizById(req, res) {
  const quiz = await quizService.getQuizById(req.params.quizId)
  sendSuccess(res, 'Quiz fetched successfully', quiz)
}

export async function createQuiz(req, res) {
  const quiz = await quizService.createQuiz(req.body)
  sendSuccess(res, 'Quiz created successfully', quiz, 201)
}

export async function updateQuiz(req, res) {
  const quiz = await quizService.updateQuiz(req.params.quizId, req.body)
  sendSuccess(res, 'Quiz updated successfully', quiz)
}

export async function deleteQuiz(req, res) {
  await quizService.deleteQuiz(req.params.quizId)
  sendSuccess(res, 'Quiz deleted successfully', null)
}
