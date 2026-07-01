import { motion } from 'framer-motion'

type QuizTimerProps = {
  isRunning: boolean
  isTimeUp: boolean
  secondsLeft: number
  warningThreshold?: number
}

export function QuizTimer({
  isRunning,
  isTimeUp,
  secondsLeft,
  warningThreshold = 5,
}: QuizTimerProps) {
  const isWarning = secondsLeft <= warningThreshold

  return (
    <motion.div
      animate={
        isWarning && isRunning
          ? { scale: [1, 1.05, 1], boxShadow: ['0 0 0 rgba(255,0,0,0)', '0 0 60px rgba(255,110,110,0.45)', '0 0 0 rgba(255,0,0,0)'] }
          : { scale: 1, boxShadow: '0 0 0 rgba(0,0,0,0)' }
      }
      className={`quiz-timer ${isWarning ? 'quiz-timer-warning' : ''} ${isTimeUp ? 'quiz-timer-expired' : ''}`}
      transition={{ duration: 0.9, repeat: isWarning && isRunning ? Number.POSITIVE_INFINITY : 0 }}
    >
      <span>{secondsLeft}</span>
    </motion.div>
  )
}
