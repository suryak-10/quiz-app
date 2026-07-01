import fs from 'fs-extra'
import path from 'node:path'

import { AppError } from '../utils/response.js'

export async function handleUpload(file) {
  if (!file) {
    throw new AppError('image is required', 400)
  }

  const folderName = path.basename(path.dirname(file.path))
  await fs.pathExists(file.path)

  return {
    image: `/uploads/${folderName}/${file.filename}`,
  }
}
