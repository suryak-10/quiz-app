import { useState } from 'react'

import type { Question } from '../../types/quiz'
import { LoadingSkeleton } from './LoadingSkeleton'
import { QuestionCard } from './QuestionCard'

type QuestionListProps = {
  questions: Question[]
  isLoading: boolean
  isReordering: boolean
  isError: boolean
  onRetry: () => void
  onAdd: () => void
  onEdit: (question: Question) => void
  onDelete: (question: Question) => void
  onReorder: (questionIds: string[]) => void
}

export function QuestionList({
  questions,
  isLoading,
  isReordering,
  isError,
  onRetry,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
}: QuestionListProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [targetId, setTargetId] = useState<string | null>(null)

  function moveQuestion(questionId: string, direction: -1 | 1) {
    const currentIndex = questions.findIndex((question) => question.id === questionId)
    const nextIndex = currentIndex + direction

    if (currentIndex === -1 || nextIndex < 0 || nextIndex >= questions.length) {
      return
    }

    const nextIds = questions.map((question) => question.id)
    const [movedId] = nextIds.splice(currentIndex, 1)
    nextIds.splice(nextIndex, 0, movedId)
    onReorder(nextIds)
  }

  function handleDrop() {
    if (!draggingId || !targetId || draggingId === targetId) {
      setDraggingId(null)
      setTargetId(null)
      return
    }

    const nextIds = questions.map((question) => question.id)
    const fromIndex = nextIds.indexOf(draggingId)
    const toIndex = nextIds.indexOf(targetId)

    if (fromIndex === -1 || toIndex === -1) {
      setDraggingId(null)
      setTargetId(null)
      return
    }

    const [movedId] = nextIds.splice(fromIndex, 1)
    nextIds.splice(toIndex, 0, movedId)

    setDraggingId(null)
    setTargetId(null)
    onReorder(nextIds)
  }

  return (
    <section className="glass-panel question-panel">
      <div className="panel-header panel-header-spread">
        <div>
          <p className="panel-kicker">Question Manager</p>
          <h2>Manage Questions</h2>
        </div>
        <button className="primary-button" type="button" onClick={onAdd}>
          + Add Question
        </button>
      </div>

      <p className="question-helper">
        Reorder with drag-and-drop or the move buttons. All quiz types share the
        same admin workflow.
      </p>

      {isLoading ? (
        <div className="question-skeleton-stack">
          <LoadingSkeleton className="skeleton-card" />
          <LoadingSkeleton className="skeleton-card" />
          <LoadingSkeleton className="skeleton-card" />
        </div>
      ) : null}

      {!isLoading && isError ? (
        <div className="message-card">
          <p>We couldn&apos;t load questions for this quiz.</p>
          <button className="secondary-button" type="button" onClick={onRetry}>
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && questions.length === 0 ? (
        <div className="message-card">
          <p>No questions added yet.</p>
          <p>Click &quot;Add Question&quot; to create one.</p>
        </div>
      ) : null}

      {!isLoading && !isError && questions.length > 0 ? (
        <div className="question-stack" aria-busy={isReordering}>
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              canMoveDown={index < questions.length - 1}
              canMoveUp={index > 0}
              isDragging={draggingId === question.id}
              question={question}
              onDelete={onDelete}
              onDragOver={setTargetId}
              onDragStart={setDraggingId}
              onDrop={handleDrop}
              onEdit={onEdit}
              onMoveDown={() => moveQuestion(question.id, 1)}
              onMoveUp={() => moveQuestion(question.id, -1)}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
