import * as uploadService from '../services/upload.service.js'
import { sendSuccess } from '../utils/response.js'

export async function uploadImage(req, res) {
  const result = await uploadService.handleUpload(req.file)
  sendSuccess(res, 'Image uploaded successfully', result, 201)
}
