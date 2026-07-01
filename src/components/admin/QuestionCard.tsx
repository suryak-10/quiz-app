import type { Question } from '../../types/quiz'

type QuestionCardProps = {
  question: Question
  canMoveUp: boolean
  canMoveDown: boolean
  isDragging: boolean
  onEdit: (question: Question) => void
  onDelete: (question: Question) => void
  onMoveUp: (questionId: string) => void
  onMoveDown: (questionId: string) => void
  onDragStart: (questionId: string) => void
  onDragOver: (questionId: string) => void
  onDrop: () => void
}

export function QuestionCard({
  question,
  canMoveDown,
  canMoveUp,
  isDragging,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
}: QuestionCardProps) {
  return (
    <article
      className={`question-card ${isDragging ? 'question-card-dragging' : ''}`}
      draggable
      onDragOver={(event) => {
        event.preventDefault()
        onDragOver(question.id)
      }}
      onDragStart={() => onDragStart(question.id)}
      onDrop={onDrop}
    >
      <img alt={question.answer} className="question-thumb" src={question.image} />

      <div className="question-copy">
        <div className="question-meta-row">
          <span className="question-order-badge">Order {question.order}</span>
          <span className="question-id">#{question.id.slice(0, 8)}</span>
        </div>
        <h3>{question.answer}</h3>
      </div>

      <div className="question-actions">
        <button
          className="icon-pill"
          disabled={!canMoveUp}
          type="button"
          onClick={() => onMoveUp(question.id)}
        >
          ↑
        </button>
        <button
          className="icon-pill"
          disabled={!canMoveDown}
          type="button"
          onClick={() => onMoveDown(question.id)}
        >
          ↓
        </button>
        <button className="secondary-button" type="button" onClick={() => onEdit(question)}>
          Edit
        </button>
        <button className="danger-button" type="button" onClick={() => onDelete(question)}>
          Delete
        </button>
      </div>
    </article>
  )
}
