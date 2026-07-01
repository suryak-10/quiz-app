import fs from 'fs-extra'
import path from 'node:path'

import {
  findQuiz,
  generateId,
  getUploadsDir,
  normalizeQuizSlug,
  readQuizzes,
  writeQuizzes,
} from '../utils/jsonDb.js'
import { AppError } from '../utils/response.js'

function sanitizeQuizPayload(payload) {
  return {
    title: payload.title.trim(),
    slug: normalizeQuizSlug(payload.slug),
    timer: Number(payload.timer),
  }
}

function mapQuizSummary(quiz) {
  return {
    id: quiz.id,
    title: quiz.title,
    slug: quiz.slug,
    timer: quiz.timer,
    totalQuestions: quiz.questions.length,
  }
}

async function ensureUniqueSlug(slug, excludedQuizId) {
  const { quizzes } = await readQuizzes()
  const existingQuiz = quizzes.find(
    (quiz) => quiz.slug === slug && quiz.id !== excludedQuizId,
  )

  if (existingQuiz) {
    throw new AppError('slug must be unique', 400)
  }
}

async function syncUploadFolderForSlugChange(quiz, previousSlug) {
  if (quiz.slug === previousSlug) {
    return quiz
  }

  const uploadsDir = getUploadsDir()
  const oldDir = path.join(uploadsDir, previousSlug)
  const newDir = path.join(uploadsDir, quiz.slug)

  if (await fs.pathExists(oldDir)) {
    await fs.ensureDir(newDir)
    const files = await fs.readdir(oldDir)

    for (const fileName of files) {
      await fs.move(path.join(oldDir, fileName), path.join(newDir, fileName), {
        overwrite: true,
      })
    }

    await fs.remove(oldDir)
  }

  quiz.questions = quiz.questions.map((question) => ({
    ...question,
    image: question.image.replace(`/uploads/${previousSlug}/`, `/uploads/${quiz.slug}/`),
  }))

  return quiz
}

export async function getAllQuizzes() {
  const { quizzes } = await readQuizzes()
  return quizzes.map(mapQuizSummary)
}

export async function getQuizById(quizId) {
  return findQuiz(quizId)
}

export async function createQuiz(payload) {
  const { title, slug, timer } = sanitizeQuizPayload(payload)
  await ensureUniqueSlug(slug)

  const database = await readQuizzes()
  const timestamp = new Date().toISOString()

  const createdQuiz = {
    id: generateId(),
    title,
    slug,
    timer,
    createdAt: timestamp,
    updatedAt: timestamp,
    questions: [],
  }

  database.quizzes.push(createdQuiz)
  await writeQuizzes(database)
  await fs.ensureDir(path.join(getUploadsDir(), slug))

  return createdQuiz
}

export async function updateQuiz(quizId, payload) {
  const database = await readQuizzes()
  const quizIndex = database.quizzes.findIndex((quiz) => quiz.id === quizId)

  if (quizIndex === -1) {
    throw new AppError('Quiz not found', 404)
  }

  const existingQuiz = database.quizzes[quizIndex]
  const { title, slug, timer } = sanitizeQuizPayload(payload)
  await ensureUniqueSlug(slug, quizId)

  const updatedQuiz = await syncUploadFolderForSlugChange(
    {
      ...existingQuiz,
      title,
      slug,
      timer,
      updatedAt: new Date().toISOString(),
    },
    existingQuiz.slug,
  )

  database.quizzes[quizIndex] = updatedQuiz
  await writeQuizzes(database)

  return updatedQuiz
}

export async function deleteQuiz(quizId) {
  const database = await readQuizzes()
  const quizIndex = database.quizzes.findIndex((quiz) => quiz.id === quizId)

  if (quizIndex === -1) {
    throw new AppError('Quiz not found', 404)
  }

  const [removedQuiz] = database.quizzes.splice(quizIndex, 1)
  await writeQuizzes(database)
  await fs.remove(path.join(getUploadsDir(), removedQuiz.slug))
}
