import * as settingsService from '../services/settings.service.js'
import { sendSuccess } from '../utils/response.js'

export async function getSettings(_req, res) {
  const settings = await settingsService.getSettings()
  sendSuccess(res, 'Settings fetched successfully', settings)
}

export async function updateSettings(req, res) {
  const settings = await settingsService.updateSettings(req.body)
  sendSuccess(res, 'Settings updated successfully', settings)
}
