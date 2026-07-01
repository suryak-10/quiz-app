import fs from 'fs-extra'
import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { v4 as uuidv4 } from 'uuid'

import { AppError } from './response.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadsRoot = path.resolve(__dirname, '..', 'uploads')
const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

const storage = multer.diskStorage({
  destination: async (req, _file, callback) => {
    try {
      const subdir = req.uploadSubdir || 'tmp'
      const uploadDir = path.join(uploadsRoot, subdir)
      await fs.ensureDir(uploadDir)
      callback(null, uploadDir)
    } catch (error) {
      callback(error)
    }
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase() || '.jpg'
    callback(null, `${uuidv4()}${extension}`)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      callback(new AppError('Only jpg, jpeg, png, and webp files are allowed', 400))
      return
    }

    callback(null, true)
  },
})

export function uploadSingleImage(fieldName) {
  return upload.single(fieldName)
}
