import { useEffect, useRef, useState } from 'react'

type UseTimerOptions = {
  duration: number
  warningThreshold?: number
  onExpire?: () => void
  onWarningTick?: (secondsRemaining: number) => void
}

export function useTimer({
  duration,
  warningThreshold = 5,
  onExpire,
  onWarningTick,
}: UseTimerOptions) {
  const [secondsLeft, setSecondsLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(false)
  const lastWarningRef = useRef<number | null>(null)
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
    if (secondsLeft > 0 && secondsLeft <= warningThreshold && lastWarningRef.current !== secondsLeft) {
      lastWarningRef.current = secondsLeft
      onWarningTick?.(secondsLeft)
    }

    if (secondsLeft === 0 && !expireHandledRef.current) {
      expireHandledRef.current = true
      setIsRunning(false)
      onExpire?.()
    }
  }, [onExpire, onWarningTick, secondsLeft, warningThreshold])

  function reset(nextDuration = duration) {
    lastWarningRef.current = null
    expireHandledRef.current = false
    setIsRunning(false)
    setSecondsLeft(nextDuration)
  }

  function restart() {
    lastWarningRef.current = null
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
