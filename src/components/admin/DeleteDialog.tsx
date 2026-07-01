import type { Question } from '../../types/quiz'

type DeleteDialogProps = {
  question: Question | null
  isDeleting: boolean
  onClose: () => void
  onConfirm: (questionId: string) => void
}

export function DeleteDialog({
  question,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteDialogProps) {
  if (!question) {
    return null
  }

  return (
    <div className="dialog-backdrop" role="presentation">
      <div aria-modal="true" className="dialog-shell delete-dialog" role="dialog">
        <div className="panel-header">
          <p className="panel-kicker">Delete Question</p>
          <h2>Remove this question?</h2>
        </div>

        <p className="dialog-copy">
          This will delete the question and its uploaded image permanently.
        </p>

        <div className="dialog-preview">
          <img alt={question.answer} className="dialog-preview-image" src={question.image} />
          <div>
            <strong>{question.answer}</strong>
            <span>Order {question.order}</span>
          </div>
        </div>

        <div className="action-row action-row-end">
          <button className="secondary-button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="danger-button"
            disabled={isDeleting}
            type="button"
            onClick={() => onConfirm(question.id)}
          >
            {isDeleting ? 'Deleting...' : 'Delete Question'}
          </button>
        </div>
      </div>
    </div>
  )
}
