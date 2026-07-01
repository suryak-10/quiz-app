import { Router } from 'express'

import { uploadImage } from '../controllers/upload.controller.js'
import { asyncHandler } from '../middleware/validateRequest.js'
import { AppError } from '../utils/response.js'
import { uploadSingleImage } from '../utils/fileUpload.js'

const router = Router()

function resolveUploadFolder(req, _res, next) {
  const folder = typeof req.query.folder === 'string' ? req.query.folder : 'tmp'

  if (!/^[a-z0-9-]+$/i.test(folder)) {
    next(new AppError('folder must be alphanumeric', 400))
    return
  }

  req.uploadSubdir = folder.toLowerCase()
  next()
}

router.post(
  '/',
  resolveUploadFolder,
  uploadSingleImage('image'),
  asyncHandler(uploadImage),
)

export default router
