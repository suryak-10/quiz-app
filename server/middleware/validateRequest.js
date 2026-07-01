import fs from 'fs-extra'

import { AppError } from '../utils/response.js'

export function validateRequest(validator) {
  return (req, _res, next) => {
    const errors = validator(req)

    if (errors.length > 0) {
      if (req.file?.path) {
        void fs.remove(req.file.path)
      }
      next(new AppError('Validation failed', 400, errors))
      return
    }

    next()
  }
}

export function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}
