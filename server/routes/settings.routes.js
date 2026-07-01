import { Router } from 'express'

import {
  getSettings,
  updateSettings,
} from '../controllers/settings.controller.js'
import { asyncHandler, validateRequest } from '../middleware/validateRequest.js'

const router = Router()

const settingsValidator = ({ body }) => {
  const errors = []

  if (
    body.tickSoundStart !== undefined &&
    (!Number.isInteger(Number(body.tickSoundStart)) || Number(body.tickSoundStart) < 0)
  ) {
    errors.push('tickSoundStart must be a non-negative integer')
  }

  if (
    body.enableSound !== undefined &&
    typeof body.enableSound !== 'boolean'
  ) {
    errors.push('enableSound must be a boolean')
  }

  if (
    body.enableAnimation !== undefined &&
    typeof body.enableAnimation !== 'boolean'
  ) {
    errors.push('enableAnimation must be a boolean')
  }

  return errors
}

router.get('/', asyncHandler(getSettings))
router.put('/', validateRequest(settingsValidator), asyncHandler(updateSettings))

export default router
