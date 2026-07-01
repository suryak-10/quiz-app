import type { Toast } from '../../types/quiz'

type ToastStackProps = {
  toasts: Toast[]
}

export function ToastStack({ toasts }: ToastStackProps) {
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <div
          className={`toast-card toast-card-${toast.tone}`}
          key={toast.id}
          role="status"
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
