import { useEffect, useRef, useState } from 'react'

type UseTimerOptions = {
  duration: number
  onExpire?: () => void
}

export function useTimer({ duration, onExpire }: UseTimerOptions) {
  const [secondsLeft, setSecondsLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(false)
  const expireHandledRef = useRef(false)

  useEffect(() => {
    if (!isRunning) {
      return
    }

    const intervalId = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isRunning])

  useEffect(() => {
    if (secondsLeft === 0 && !expireHandledRef.current) {
      expireHandledRef.current = true
      setIsRunning(false)
      onExpire?.()
    }
  }, [onExpire, secondsLeft])

  function reset(nextDuration = duration) {
    expireHandledRef.current = false
    setIsRunning(false)
    setSecondsLeft(nextDuration)
  }

  function restart() {
    expireHandledRef.current = false
    setSecondsLeft(duration)
    setIsRunning(false)
  }

  function start() {
    if (secondsLeft === 0) {
      reset(duration)
      setIsRunning(true)
      return
    }

    setIsRunning(true)
  }

  function pause() {
    setIsRunning(false)
  }

  return {
    isRunning,
    secondsLeft,
    pause,
    reset,
    restart,
    start,
    setIsRunning,
  }
}
