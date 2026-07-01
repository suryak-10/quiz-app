import type { QuizSummary } from '../../types/quiz'
import { LoadingSkeleton } from './LoadingSkeleton'

type QuizSelectorProps = {
  quizzes: QuizSummary[]
  selectedQuizId: string | null
  onSelect: (quizId: string) => void
  isLoading: boolean
}

export function QuizSelector({
  quizzes,
  selectedQuizId,
  onSelect,
  isLoading,
}: QuizSelectorProps) {
  return (
    <section className="glass-panel selector-panel">
      <div className="panel-header">
        <p className="panel-kicker">Quiz Selection</p>
        <h2>Select Quiz</h2>
      </div>

      {isLoading ? (
        <>
          <LoadingSkeleton className="skeleton-label" />
          <LoadingSkeleton className="skeleton-input" />
          <LoadingSkeleton className="skeleton-hint" />
        </>
      ) : (
        <>
          <label className="field-label" htmlFor="quiz-selector">
            Select Quiz
          </label>
          <select
            className="glass-input glass-select"
            id="quiz-selector"
            value={selectedQuizId ?? ''}
            onChange={(event) => onSelect(event.target.value)}
          >
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={quiz.id}>
                {quiz.title}
              </option>
            ))}
          </select>
          <p className="selector-caption">
            Quiz names come from the API so organizers can rename games before the
            event.
          </p>
        </>
      )}
    </section>
  )
}
