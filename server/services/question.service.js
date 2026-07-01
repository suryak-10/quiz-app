import fs from 'fs-extra'
import path from 'node:path'

import {
  findQuiz,
  getUploadsDir,
  readQuizzes,
  writeQuizzes,
  generateId,
} from '../utils/jsonDb.js'
import { AppError } from '../utils/response.js'

function sortQuestions(questions) {
  return [...questions].sort((first, second) => first.order - second.order)
}

async function moveTempFileToQuizFolder(file, quizSlug) {
  if (!file) {
    return null
  }

  const targetDir = path.join(getUploadsDir(), quizSlug)
  await fs.ensureDir(targetDir)

  const targetPath = path.join(targetDir, file.filename)
  await fs.move(file.path, targetPath, { overwrite: true })

  return `/uploads/${quizSlug}/${file.filename}`
}

async function removeImageFile(imagePath) {
  if (!imagePath) {
    return
  }

  const relativePath = imagePath.replace(/^\/uploads\/+/, '')
  await fs.remove(path.join(getUploadsDir(), relativePath))
}

function reorderQuestionsList(questions) {
  return sortQuestions(questions).map((question, index) => ({
    ...question,
    order: index + 1,
  }))
}

export async function getQuestions(quizId) {
  const quiz = await findQuiz(quizId)
  return sortQuestions(quiz.questions)
}

export async function createQuestion(quizId, payload) {
  const database = await readQuizzes()
  const quiz = database.quizzes.find((entry) => entry.id === quizId)

  if (!quiz) {
    if (payload.file) {
      await fs.remove(payload.file.path)
    }
    throw new AppError('Quiz not found', 404)
  }

  if (!payload.file) {
    throw new AppError('image is required', 400)
  }

  const image = await moveTempFileToQuizFolder(payload.file, quiz.slug)
  const timestamp = new Date().toISOString()
  const lastOrder = quiz.questions.reduce(
    (maxOrder, question) => Math.max(maxOrder, question.order),
    0,
  )

  const question = {
    id: generateId(),
    order: lastOrder + 1,
    image,
    answer: payload.answer.trim(),
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  quiz.questions.push(question)
  await writeQuizzes(database)

  return question
}

export async function updateQuestion(quizId, questionId, payload) {
  const database = await readQuizzes()
  const quiz = database.quizzes.find((entry) => entry.id === quizId)

  if (!quiz) {
    if (payload.file) {
      await fs.remove(payload.file.path)
    }
    throw new AppError('Quiz not found', 404)
  }

  const questionIndex = quiz.questions.findIndex((question) => question.id === questionId)

  if (questionIndex === -1) {
    if (payload.file) {
      await fs.remove(payload.file.path)
    }
    throw new AppError('Question not found', 404)
  }

  const currentQuestion = quiz.questions[questionIndex]
  let nextImage = currentQuestion.image

  if (payload.file) {
    nextImage = await moveTempFileToQuizFolder(payload.file, quiz.slug)
    await removeImageFile(currentQuestion.image)
  }

  let updatedQuestion = {
    ...currentQuestion,
    image: nextImage,
    updatedAt: new Date().toISOString(),
  }

  if (payload.answer !== undefined) {
    updatedQuestion.answer = payload.answer.trim()
  }

  if (payload.order !== undefined) {
    updatedQuestion.order = Number(payload.order)
  }

  quiz.questions[questionIndex] = updatedQuestion
  quiz.questions = reorderQuestionsList(quiz.questions)
  updatedQuestion = quiz.questions.find((question) => question.id === questionId)

  await writeQuizzes(database)

  return updatedQuestion
}

export async function deleteQuestion(quizId, questionId) {
  const database = await readQuizzes()
  const quiz = database.quizzes.find((entry) => entry.id === quizId)

  if (!quiz) {
    throw new AppError('Quiz not found', 404)
  }

  const questionIndex = quiz.questions.findIndex((question) => question.id === questionId)

  if (questionIndex === -1) {
    throw new AppError('Question not found', 404)
  }

  const [removedQuestion] = quiz.questions.splice(questionIndex, 1)
  quiz.questions = reorderQuestionsList(quiz.questions)

  await removeImageFile(removedQuestion.image)
  await writeQuizzes(database)
}

export async function reorderQuestions(quizId, payload) {
  const database = await readQuizzes()
  const quiz = database.quizzes.find((entry) => entry.id === quizId)

  if (!quiz) {
    throw new AppError('Quiz not found', 404)
  }

  const existingIds = quiz.questions.map((question) => question.id).sort()
  const nextIds = [...payload.questionIds].sort()

  if (
    existingIds.length !== nextIds.length ||
    existingIds.some((id, index) => id !== nextIds[index])
  ) {
    throw new AppError('questionIds must include every question exactly once', 400)
  }

  const questionMap = new Map(quiz.questions.map((question) => [question.id, question]))
  quiz.questions = payload.questionIds.map((questionId, index) => ({
    ...questionMap.get(questionId),
    order: index + 1,
    updatedAt: new Date().toISOString(),
  }))

  await writeQuizzes(database)

  return sortQuestions(quiz.questions)
}
