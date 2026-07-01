import type { ReactNode } from 'react'

import {
  type KeyboardShortcutHandlers,
  useKeyboardShortcuts,
} from '../../hooks/useKeyboardShortcuts'

type KeyboardShortcutProviderProps = {
  children: ReactNode
  enabled?: boolean
  handlers: KeyboardShortcutHandlers
}

export function KeyboardShortcutProvider({
  children,
  enabled = true,
  handlers,
}: KeyboardShortcutProviderProps) {
  useKeyboardShortcuts({ enabled, handlers })
  return <>{children}</>
}
