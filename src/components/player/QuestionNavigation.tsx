type QuestionNavigationProps = {
  currentIndex: number
  totalQuestions: number
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void
}

export function QuestionNavigation({
  currentIndex,
  totalQuestions,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: QuestionNavigationProps) {
  return (
    <footer className="quiz-player-footer">
      <button
        className="footer-button footer-button-ghost"
        disabled={!canGoPrevious}
        type="button"
        onClick={onPrevious}
      >
        ← Previous
      </button>
      <div className="quiz-player-footer-progress">
        Question {currentIndex + 1} / {totalQuestions}
      </div>
      <button
        className="footer-button footer-button-primary"
        disabled={!canGoNext}
        type="button"
        onClick={onNext}
      >
        Next →
      </button>
    </footer>
  )
}
