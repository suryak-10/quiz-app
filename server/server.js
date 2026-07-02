import cors from 'cors'
import express from 'express'
import fs from 'fs-extra'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import questionRoutes from './routes/question.routes.js'
import quizRoutes from './routes/quiz.routes.js'
import settingsRoutes from './routes/settings.routes.js'
import uploadRoutes from './routes/upload.routes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { AppError } from './utils/response.js'
import { initializeStorage } from './utils/jsonDb.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const port = Number(process.env.PORT) || 5163
const host = '0.0.0.0'

app.disable('x-powered-by')

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use((req, res, next) => {
  const startedAt = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - startedAt
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
    )
  })
  next()
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/quizzes/:quizId/questions', questionRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/settings', settingsRoutes)

app.use((_req, _res, next) => {
  next(new AppError('Route not found', 404))
})

app.use(errorHandler)

let httpServer

async function startServer() {
  await initializeStorage()
  await fs.ensureDir(path.join(__dirname, 'uploads'))

  httpServer = app.listen(port, host, () => {
    console.log(`Office Quiz API listening on http://${host}:${port}`)
  })
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`)

  if (!httpServer) {
    process.exit(0)
  }

  httpServer.close((error) => {
    if (error) {
      console.error('Error while closing server', error)
      process.exit(1)
    }

    process.exit(0)
  })
}

process.on('SIGINT', () => {
  void shutdown('SIGINT')
})

process.on('SIGTERM', () => {
  void shutdown('SIGTERM')
})

startServer().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})
