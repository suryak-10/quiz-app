import { AnimatePresence, motion } from 'framer-motion'

type WrongOverlayProps = {
  visible: boolean
}

export function WrongOverlay({ visible }: WrongOverlayProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="player-overlay wrong-overlay"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <motion.div
            animate={{ x: [0, -18, 18, -12, 12, 0], opacity: 1 }}
            className="wrong-card"
            initial={{ opacity: 0 }}
            transition={{ duration: 0.55 }}
          >
            ❌ Wrong Answer
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
