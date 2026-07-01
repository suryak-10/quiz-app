type QuizHeaderProps = {
  emoji: string
  title: string
  currentIndex: number
  totalQuestions: number
  onBack: () => void
}

export function QuizHeader({
  emoji,
  title,
  currentIndex,
  totalQuestions,
  onBack,
}: QuizHeaderProps) {
  return (
    <header className="quiz-player-header">
      <button className="player-back-button" type="button" onClick={onBack}>
        ← Back
      </button>
      <div className="quiz-player-title">
        <span>{emoji}</span>
        <strong>{title}</strong>
      </div>
      <div className="quiz-player-progress">
        Question {Math.min(currentIndex + 1, totalQuestions)} / {totalQuestions}
      </div>
    </header>
  )
}
