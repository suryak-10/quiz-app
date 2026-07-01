import { AnimatePresence, motion } from 'framer-motion'

type TimeUpOverlayProps = {
  visible: boolean
}

export function TimeUpOverlay({ visible }: TimeUpOverlayProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="player-overlay timeup-overlay"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            className="timeup-card"
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
          >
            TIME&apos;S UP!
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
