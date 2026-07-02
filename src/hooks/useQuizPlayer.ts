import { useEffect, useMemo, useRef, useState } from 'react'

import type { Quiz } from '../types/quiz'
import { useImagePreloader } from './useImagePreloader'
import { useSoundEffects } from './useSoundEffects'
import { useTimer } from './useTimer'

const EMPTY_QUESTIONS: Quiz['questions'] = []
// time.mp3 plays at full volume for the last stretch of the countdown as a warning cue.
const TIMER_WARNING_THRESHOLD_SECONDS = 5
const TIME_AMBIENT_VOLUME = 0.5
const TIME_AMBIENT_WARNING_VOLUME = 1

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
  const isTimeAmbientPlayingRef = useRef(false)
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
    soundEffects.stopAll()
    setOverlayState({
      success: false,
      wrong: false,
      timeUp: false,
      memoryReveal: false,
    })
  }

  function dismissActiveOverlays() {
    if (!overlayState.success && !overlayState.wrong && !overlayState.timeUp) {
      return
    }

    overlayTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
    overlayTimeoutsRef.current = []
    soundEffects.stopAll()
    setOverlayState((current) => ({
      ...current,
      success: false,
      wrong: false,
      timeUp: false,
    }))
  }

  const timer = useTimer({
    duration: quiz?.timer ?? 30,
    onExpire: () => {
      soundEffects.playTimeUp()
      setOverlayState((current) => ({
        ...current,
        timeUp: !isMemoryQuiz,
        memoryReveal: Boolean(isMemoryQuiz),
      }))
    },
  })

  useEffect(() => {
    if (timer.isRunning && !isTimeAmbientPlayingRef.current) {
      const duration = quiz?.timer ?? 30
      const elapsedSeconds = Math.max(0, duration - timer.secondsLeft)
      soundEffects.playTime(elapsedSeconds)
    } else if (!timer.isRunning && isTimeAmbientPlayingRef.current) {
      soundEffects.stopTime()
    }

    isTimeAmbientPlayingRef.current = timer.isRunning
  }, [timer.isRunning, timer.secondsLeft, quiz?.timer, soundEffects])

  useEffect(() => {
    const isFinalStretch = timer.secondsLeft > 0 && timer.secondsLeft <= TIMER_WARNING_THRESHOLD_SECONDS
    soundEffects.setTimeVolume(isFinalStretch ? TIME_AMBIENT_WARNING_VOLUME : TIME_AMBIENT_VOLUME)
  }, [timer.secondsLeft, soundEffects])

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

  function pauseTimer() {
    soundEffects.stopAll()
    timer.pause()
  }

  function handleCorrect() {
    if (
      isMemoryQuiz ||
      overlayState.success ||
      overlayState.wrong ||
      overlayState.timeUp ||
      overlayState.memoryReveal
    ) {
      return
    }

    pauseTimer()
    soundEffects.playCorrect()
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
      overlayState.success ||
      overlayState.timeUp ||
      overlayState.memoryReveal
    ) {
      return
    }

    pauseTimer()
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
    dismissActiveOverlays,
    goToNextQuestion,
    goToPreviousQuestion,
    handleCorrect,
    handleWrong,
    pauseTimer,
    restartTimer,
    resetForQuestion,
    setShowExitDialog,
    startTimer,
    toggleFullscreen,
  }
}
