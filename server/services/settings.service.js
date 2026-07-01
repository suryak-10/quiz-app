import { readSettings, writeSettings } from '../utils/jsonDb.js'

export async function getSettings() {
  return readSettings()
}

export async function updateSettings(payload) {
  const settings = await readSettings()

  const nextSettings = {
    ...settings,
    ...payload,
  }

  await writeSettings(nextSettings)

  return nextSettings
}
