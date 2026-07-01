import { useState } from 'react'

import type { Question } from '../../types/quiz'
import { useImageUpload } from '../../hooks/useImageUpload'
import { ImageUploader } from './ImageUploader'

type QuestionModalProps = {
  mode: 'create' | 'edit'
  question?: Question
  isOpen: boolean
  isSaving: boolean
  onClose: () => void
  onSubmit: (values: { answer: string; imageFile: File | null }) => void
}

export function QuestionModal({
  mode,
  question,
  isOpen,
  isSaving,
  onClose,
  onSubmit,
}: QuestionModalProps) {
  const [answer, setAnswer] = useState(() => question?.answer ?? '')
  const [error, setError] = useState('')
  const upload = useImageUpload(question?.image)

  if (!isOpen) {
    return null
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!answer.trim()) {
      setError('Answer is required.')
      return
    }

    if (mode === 'create' && !upload.file) {
      setError('Image is required when creating a question.')
      return
    }

    setError('')
    onSubmit({
      answer: answer.trim(),
      imageFile: upload.file,
    })
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <div
        aria-labelledby="question-modal-title"
        aria-modal="true"
        className="dialog-shell question-modal"
        role="dialog"
      >
        <div className="panel-header panel-header-spread">
          <div>
            <p className="panel-kicker">Question Manager</p>
            <h2 id="question-modal-title">
              {mode === 'create' ? 'Add Question' : 'Edit Question'}
            </h2>
          </div>
          <button className="icon-button subtle-icon" type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <ImageUploader
            fileName={upload.file?.name ?? null}
            hasPreview={Boolean(upload.previewUrl)}
            inputRef={upload.inputRef}
            isDragging={upload.isDragging}
            previewUrl={upload.previewUrl}
            onDragLeave={upload.onDragLeave}
            onDragOver={upload.onDragOver}
            onDrop={upload.onDrop}
            onInputChange={upload.onInputChange}
            onOpen={upload.openFilePicker}
            onRemove={upload.removeFile}
          />

          <div className="field-block">
            <label className="field-label" htmlFor="question-answer">
              Answer
            </label>
            <input
              className="glass-input"
              id="question-answer"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
            />
          </div>

          {error ? <p className="field-error">{error}</p> : null}

          <div className="action-row action-row-end">
            <button className="secondary-button" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-button" disabled={isSaving} type="submit">
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
