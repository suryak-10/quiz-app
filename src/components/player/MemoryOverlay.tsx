import { AnimatePresence, motion } from 'framer-motion'

type MemoryOverlayProps = {
  visible: boolean
}

export function MemoryOverlay({ visible }: MemoryOverlayProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="memory-overlay"
          exit={{ opacity: 0, scale: 0.98 }}
          initial={{ opacity: 0, scale: 0.98 }}
        >
          <span className="memory-emoji">🧠</span>
          <strong>MEMORY TIME</strong>
          <p>Image Hidden</p>
          <span>Ask the participants questions based on what they remember.</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
