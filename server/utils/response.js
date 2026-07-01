export class AppError extends Error {
  constructor(message, statusCode = 500, details = undefined) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.details = details
  }
}

export function sendSuccess(res, message, data = null, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

export function sendError(res, message, statusCode = 500, details = undefined) {
  const payload = {
    success: false,
    message,
  }

  if (details !== undefined) {
    payload.details = details
  }

  return res.status(statusCode).json(payload)
}
