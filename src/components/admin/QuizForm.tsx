import { useState } from 'react'

import type { Quiz, QuizSummary } from '../../types/quiz'

type QuizFormProps = {
  quiz: Quiz | undefined
  summary: QuizSummary | undefined
  isLoading: boolean
  isSaving: boolean
  onSave: (values: { title: string; timer: number }) => void
  onManageQuestions: () => void
}

export function QuizForm({
  quiz,
  summary,
  isLoading,
  isSaving,
  onSave,
  onManageQuestions,
}: QuizFormProps) {
  const [title, setTitle] = useState(() => quiz?.title ?? '')
  const [timer, setTimer] = useState(() => quiz?.timer ?? 30)
  const [errors, setErrors] = useState<{ title?: string; timer?: string }>({})

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: typeof errors = {}

    if (!title.trim()) {
      nextErrors.title = 'Display name is required.'
    } else if (title.trim().length > 100) {
      nextErrors.title = 'Display name must be 100 characters or fewer.'
    }

    if (!Number.isInteger(timer) || timer < 5 || timer > 300) {
      nextErrors.timer = 'Timer must be between 5 and 300 seconds.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    onSave({
      title: title.trim(),
      timer,
    })
  }

  if (isLoading || !quiz || !summary) {
    return (
      <section className="glass-panel quiz-form-panel">
        <div className="panel-header">
          <p className="panel-kicker">Quiz Overview</p>
          <h2>Selected quiz details</h2>
        </div>
        <div className="form-grid">
          <div className="field-block field-span-2 loading-card" />
          <div className="field-block loading-card" />
          <div className="field-block loading-card" />
          <div className="field-block loading-card" />
        </div>
      </section>
    )
  }

  return (
    <section className="glass-panel quiz-form-panel">
      <div className="panel-header">
        <div>
          <p className="panel-kicker">Quiz Overview</p>
          <h2>{quiz.title}</h2>
        </div>
        <span className="chip-status">Live editable</span>
      </div>

      <form className="quiz-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="field-block field-span-2">
            <label className="field-label" htmlFor="quiz-title">
              Quiz Display Name
            </label>
            <input
              className="glass-input"
              id="quiz-title"
              maxLength={100}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            {errors.title ? <p className="field-error">{errors.title}</p> : null}
          </div>

          <div className="field-block">
            <label className="field-label" htmlFor="quiz-slug">
              Slug
            </label>
            <input className="glass-input glass-input-readonly" id="quiz-slug" readOnly value={quiz.slug} />
          </div>

          <div className="field-block">
            <label className="field-label" htmlFor="quiz-timer">
              Timer
            </label>
            <input
              className="glass-input"
              id="quiz-timer"
              max={300}
              min={5}
              type="number"
              value={timer}
              onChange={(event) => setTimer(Number(event.target.value))}
            />
            {errors.timer ? <p className="field-error">{errors.timer}</p> : null}
          </div>

          <div className="field-block">
            <label className="field-label" htmlFor="quiz-total">
              Total Questions
            </label>
            <input
              className="glass-input glass-input-readonly"
              id="quiz-total"
              readOnly
              value={summary.totalQuestions}
            />
          </div>
        </div>

        <div className="action-row">
          <button className="primary-button" disabled={isSaving} type="submit">
            {isSaving ? 'Saving...' : 'Save Quiz'}
          </button>
          <button className="secondary-button" type="button" onClick={onManageQuestions}>
            Manage Questions
          </button>
        </div>
      </form>
    </section>
  )
}
