import { Howl } from 'howler'
import { useEffect, useMemo } from 'react'

export function useSoundEffects() {
  const sounds = useMemo(
    () => ({
      tick: new Howl({ src: ['/sounds/tick.mp3'], volume: 0.7 }),
      success: new Howl({ src: ['/sounds/success.mp3'], volume: 0.75 }),
      wrong: new Howl({ src: ['/sounds/wrong.mp3'], volume: 0.75 }),
    }),
    [],
  )

  useEffect(() => {
    return () => {
      sounds.tick.unload()
      sounds.success.unload()
      sounds.wrong.unload()
    }
  }, [sounds])

  function stopAll() {
    sounds.tick.stop()
    sounds.success.stop()
    sounds.wrong.stop()
  }

  return {
    playSuccess: () => {
      stopAll()
      sounds.success.play()
    },
    playTick: () => {
      stopAll()
      sounds.tick.play()
    },
    playWrong: () => {
      stopAll()
      sounds.wrong.play()
    },
    stopAll,
  }
}
