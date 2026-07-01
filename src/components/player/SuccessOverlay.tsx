import { AnimatePresence, motion } from 'framer-motion'

type SuccessOverlayProps = {
  visible: boolean
}

const confetti = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 11) % 100}%`,
  delay: index * 0.04,
  rotate: index % 2 === 0 ? -18 : 18,
}))

export function SuccessOverlay({ visible }: SuccessOverlayProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="player-overlay success-overlay"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <div className="success-fireworks" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <motion.div
            animate={{ scale: 1, opacity: 1 }}
            className="success-card"
            initial={{ scale: 0.82, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="success-icon" aria-hidden="true">
              🏆
            </div>
            <strong>✅ Correct!</strong>
          </motion.div>
          <div className="confetti-field" aria-hidden="true">
            {confetti.map((piece) => (
              <motion.span
                key={piece.id}
                animate={{ y: ['-10%', '120%'], rotate: [0, piece.rotate * 8] }}
                className="confetti-piece"
                initial={{ opacity: 0, y: '-20%' }}
                style={{ left: piece.left, animationDelay: `${piece.delay}s` }}
                transition={{ duration: 1.8, ease: 'easeOut', delay: piece.delay }}
              />
            ))}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
