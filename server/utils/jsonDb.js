import fs from 'fs-extra'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { v4 as uuidv4 } from 'uuid'

import { AppError } from './response.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const dbDir = path.join(rootDir, 'db')
const uploadsDir = path.join(rootDir, 'uploads')
const quizzesFile = path.join(dbDir, 'quizzes.json')
const settingsFile = path.join(dbDir, 'settings.json')

const defaultQuizzesData = { quizzes: [] }
const defaultSettingsData = {
  tickSoundStart: 5,
  enableSound: true,
  enableAnimation: true,
}

const defaultQuizzes = [
  { title: 'Character Guessing', slug: 'character', timer: 30 },
  { title: 'Guess the Word', slug: 'word', timer: 20 },
  { title: 'Guess the Movie', slug: 'movie', timer: 30 },
  { title: 'Memory Challenge', slug: 'memory', timer: 30 },
]

async function ensureJsonFile(filePath, defaultData) {
  await fs.ensureDir(path.dirname(filePath))

  if (!(await fs.pathExists(filePath))) {
    await fs.writeJson(filePath, defaultData, { spaces: 2 })
  }
}

async function readJson(filePath, defaultData) {
  await ensureJsonFile(filePath, defaultData)
  return fs.readJson(filePath)
}

async function writeJson(filePath, data) {
  await fs.ensureDir(path.dirname(filePath))
  await fs.writeJson(filePath, data, { spaces: 2 })
}

export function generateId() {
  return uuidv4()
}

export function normalizeQuizSlug(slug) {
  return slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function getUploadsDir() {
  return uploadsDir
}

export async function readQuizzes() {
  return readJson(quizzesFile, defaultQuizzesData)
}

export async function writeQuizzes(quizzes) {
  await writeJson(quizzesFile, quizzes)
}

export async function readSettings() {
  return readJson(settingsFile, defaultSettingsData)
}

export async function writeSettings(settings) {
  await writeJson(settingsFile, settings)
}

export async function findQuiz(id) {
  const { quizzes } = await readQuizzes()
  const quiz = quizzes.find((entry) => entry.id === id)

  if (!quiz) {
    throw new AppError('Quiz not found', 404)
  }

  return quiz
}

export async function findQuestion(quizId, questionId) {
  const quiz = await findQuiz(quizId)
  const question = quiz.questions.find((entry) => entry.id === questionId)

  if (!question) {
    throw new AppError('Question not found', 404)
  }

  return question
}

export async function initializeStorage() {
  await fs.ensureDir(dbDir)
  await fs.ensureDir(uploadsDir)

  for (const folderName of ['character', 'word', 'movie', 'memory', 'tmp']) {
    await fs.ensureDir(path.join(uploadsDir, folderName))
  }

  await ensureJsonFile(quizzesFile, defaultQuizzesData)
  await ensureJsonFile(settingsFile, defaultSettingsData)

  const quizzesData = await readQuizzes()
  const settingsData = await readSettings()

  if (!Array.isArray(quizzesData.quizzes) || quizzesData.quizzes.length === 0) {
    const timestamp = new Date().toISOString()

    quizzesData.quizzes = defaultQuizzes.map((quiz) => ({
      id: generateId(),
      title: quiz.title,
      slug: quiz.slug,
      timer: quiz.timer,
      createdAt: timestamp,
      updatedAt: timestamp,
      questions: [],
    }))

    await writeQuizzes(quizzesData)
  }

  await writeSettings({
    ...defaultSettingsData,
    ...settingsData,
  })
}
