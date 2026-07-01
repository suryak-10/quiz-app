type LoadingSkeletonProps = {
  className?: string
}

export function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return <div className={`loading-skeleton ${className}`.trim()} aria-hidden="true" />
}
