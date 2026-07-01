import { useEffect } from 'react'

export type KeyboardShortcutHandlers = {
  onStart: () => void
  onPause: () => void
  onRestart: () => void
  onCorrect: () => void
  onWrong: () => void
  onNext: () => void
  onPrevious: () => void
  onExit: () => void
  onFullscreen: () => void
}

type UseKeyboardShortcutsOptions = {
  enabled?: boolean
  handlers: KeyboardShortcutHandlers
}

export function useKeyboardShortcuts({
  enabled = true,
  handlers,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null

      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }

      const key = event.key.toLowerCase()

      if (key === 's') {
        event.preventDefault()
        handlers.onStart()
        return
      }

      if (event.code === 'Space') {
        event.preventDefault()
        handlers.onPause()
        return
      }

      if (key === 'r') {
        event.preventDefault()
        handlers.onRestart()
        return
      }

      if (key === 'y' && !event.repeat) {
        event.preventDefault()
        handlers.onCorrect()
        return
      }

      if (key === 'n' && !event.repeat) {
        event.preventDefault()
        handlers.onWrong()
        return
      }

      if (event.key === 'ArrowRight' && !event.repeat) {
        event.preventDefault()
        handlers.onNext()
        return
      }

      if (event.key === 'ArrowLeft' && !event.repeat) {
        event.preventDefault()
        handlers.onPrevious()
        return
      }

      if (event.key === 'Escape' && !event.repeat) {
        event.preventDefault()
        handlers.onExit()
        return
      }

      if (key === 'f' && !event.repeat) {
        event.preventDefault()
        handlers.onFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handlers])
}
