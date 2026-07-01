import multer from 'multer'

import { AppError, sendError } from '../utils/response.js'

export function errorHandler(error, _req, res, _next) {
  console.error(error)

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'File size must not exceed 10 MB', 400)
    }

    return sendError(res, error.message, 400)
  }

  if (error instanceof AppError) {
    return sendError(res, error.message, error.statusCode, error.details)
  }

  return sendError(res, 'Internal server error', 500)
}
