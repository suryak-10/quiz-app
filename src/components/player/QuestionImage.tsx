import { AnimatePresence, motion } from 'framer-motion'

type QuestionImageProps = {
  alt: string
  image: string
  hidden: boolean
}

export function QuestionImage({ alt, image, hidden }: QuestionImageProps) {
  return (
    <div className="question-image-shell">
      <AnimatePresence mode="wait">
        {!hidden ? (
          <motion.img
            key={image}
            alt={alt}
            animate={{ opacity: 1, scale: 1 }}
            className="question-image"
            exit={{ opacity: 0, scale: 0.97 }}
            initial={{ opacity: 0, scale: 0.985 }}
            src={image}
            transition={{ duration: 0.36, ease: 'easeOut' }}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
