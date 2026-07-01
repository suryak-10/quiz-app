import { useEffect, useMemo, useRef, useState } from 'react'

import type { Quiz } from '../types/quiz'
import { useImagePreloader } from './useImagePreloader'
import { useSoundEffects } from './useSoundEffects'
import { useTimer } from './useTimer'

const EMPTY_QUESTIONS: Quiz['questions'] = []

type OverlayState = {
  success: boolean
  wrong: boolean
  timeUp: boolean
  memoryReveal: boolean
}

export function useQuizPlayer(quiz: Quiz | undefined) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [overlayState, setOverlayState] = useState<OverlayState>({
    success: false,
    wrong: false,
    timeUp: false,
    memoryReveal: false,
  })
  const overlayTimeoutsRef = useRef<number[]>([])
  const isMemoryQuiz = quiz?.slug === 'memory'
  const soundEffects = useSoundEffects()

  const questions = quiz?.questions ?? EMPTY_QUESTIONS
  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length
  const nextQuestion = questions[currentIndex + 1]
  const imageUrls = useMemo(() => questions.map((question) => question.image), [questions])

  useImagePreloader(imageUrls)
  useImagePreloader(nextQuestion ? [nextQuestion.image] : [])

  useEffect(() => {
    return () => {
      soundEffects.stopAll()
      overlayTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
    }
  }, [soundEffects])

  function clearOverlays() {
    overlayTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
    overlayTimeoutsRef.current = []
    setOverlayState({
      success: false,
      wrong: false,
      timeUp: false,
      memoryReveal: false,
    })
  }

  const timer = useTimer({
    duration: quiz?.timer ?? 30,
    onExpire: () => {
      soundEffects.stopAll()
      setOverlayState((current) => ({
        ...current,
        timeUp: !isMemoryQuiz,
        memoryReveal: Boolean(isMemoryQuiz),
      }))
    },
    onWarningTick: () => {
      if (!isMemoryQuiz) {
        soundEffects.playTick()
      }
    },
  })

  function resetForQuestion(index: number) {
    clearOverlays()
    soundEffects.stopAll()
    timer.reset(quiz?.timer ?? 30)
    setCurrentIndex(index)
  }

  function goToNextQuestion() {
    if (currentIndex >= totalQuestions - 1) {
      return
    }

    resetForQuestion(currentIndex + 1)
  }

  function goToPreviousQuestion() {
    if (currentIndex <= 0) {
      return
    }

    resetForQuestion(currentIndex - 1)
  }

  function restartTimer() {
    clearOverlays()
    soundEffects.stopAll()
    timer.restart()
  }

  function startTimer() {
    if (
      overlayState.timeUp ||
      overlayState.memoryReveal ||
      overlayState.success
    ) {
      clearOverlays()
    }

    timer.start()
  }

  function handleCorrect() {
    if (
      isMemoryQuiz ||
      overlayState.success ||
      overlayState.timeUp ||
      overlayState.memoryReveal
    ) {
      return
    }

    timer.pause()
    soundEffects.playSuccess()
    setOverlayState((current) => ({ ...current, success: true, wrong: false, timeUp: false }))
    const timeoutId = window.setTimeout(() => {
      setOverlayState((current) => ({ ...current, success: false }))
    }, 2000)
    overlayTimeoutsRef.current.push(timeoutId)
  }

  function handleWrong() {
    if (
      isMemoryQuiz ||
      overlayState.wrong ||
      overlayState.timeUp ||
      overlayState.memoryReveal
    ) {
      return
    }

    soundEffects.playWrong()
    setOverlayState((current) => ({ ...current, wrong: true }))
    const timeoutId = window.setTimeout(() => {
      setOverlayState((current) => ({ ...current, wrong: false }))
    }, 1000)
    overlayTimeoutsRef.current.push(timeoutId)
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen()
      return
    }

    void document.exitFullscreen()
  }

  return {
    currentIndex,
    currentQuestion,
    nextQuestion,
    overlayState,
    showExitDialog,
    soundEffects,
    timer,
    totalQuestions,
    clearOverlays,
    goToNextQuestion,
    goToPreviousQuestion,
    handleCorrect,
    handleWrong,
    restartTimer,
    resetForQuestion,
    setShowExitDialog,
    startTimer,
    toggleFullscreen,
  }
}
