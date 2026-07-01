import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import { Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'

import './App.css'
import { DeleteDialog } from './components/admin/DeleteDialog'
import { QuestionList } from './components/admin/QuestionList'
import { QuestionModal } from './components/admin/QuestionModal'
import { QuizForm } from './components/admin/QuizForm'
import { QuizSelector } from './components/admin/QuizSelector'
import { ToastStack } from './components/admin/ToastStack'
import { LoadingSkeleton } from './components/admin/LoadingSkeleton'
import { KeyboardShortcutProvider } from './components/player/KeyboardShortcutProvider'
import { MemoryOverlay } from './components/player/MemoryOverlay'
import { QuestionImage } from './components/player/QuestionImage'
import { QuestionNavigation } from './components/player/QuestionNavigation'
import { QuizHeader } from './components/player/QuizHeader'
import { QuizTimer } from './components/player/QuizTimer'
import { SuccessOverlay } from './components/player/SuccessOverlay'
import { TimeUpOverlay } from './components/player/TimeUpOverlay'
import { WrongOverlay } from './components/player/WrongOverlay'
import { useQuestions } from './hooks/useQuestions'
import { useQuizPlayer } from './hooks/useQuizPlayer'
import { useQuizzes, useSelectedQuiz } from './hooks/useQuizzes'
import { getErrorMessage } from './lib/api'
import type { QuizSummary, Question, Toast } from './types/quiz'

const particles = Array.from({ length: 32 }, (_, index) => ({
  id: index,
  size: 2 + (index % 4),
  left: (index * 19) % 100,
  top: (index * 29) % 100,
  duration: 11 + (index % 5) * 3,
  delay: -(index % 7) * 1.2,
}))

const quizCardMeta: Record<
  string,
  {
    description: string
    emoji: string
    accent: 'primary' | 'secondary' | 'tertiary' | 'warning'
  }
> = {
  character: {
    description: 'Identify your colleagues or famous icons from blurred silhouettes.',
    emoji: '🎭',
    accent: 'primary',
  },
  word: {
    description: 'Solve cryptic clues and unscramble professional jargon.',
    emoji: '🧩',
    accent: 'secondary',
  },
  movie: {
    description: 'Name the cinematic masterpiece from a single iconic quote or shot.',
    emoji: '🎬',
    accent: 'tertiary',
  },
  memory: {
    description: 'Test your focus with rapid-fire pattern recall and sequences.',
    emoji: '🧠',
    accent: 'warning',
  },
}

const quizOrder = ['character', 'word', 'movie', 'memory']

function App() {
  return (
    <div className="app-shell">
      <BackgroundScene />
      <Routes>
        <Route element={<AdminDashboardPage />} path="/" />
        <Route element={<StageDashboardPage />} path="/dashboard" />
        <Route element={<QuizPlayerPage />} path="/quiz/:quizId" />
      </Routes>
      <div className="ambient ambient-primary" aria-hidden="true" />
      <div className="ambient ambient-secondary" aria-hidden="true" />
    </div>
  )
}

function BackgroundScene() {
  return (
    <>
      <div className="dashboard-bg" aria-hidden="true" />
      <div className="dashboard-grid" aria-hidden="true" />
      <div className="particle-layer" aria-hidden="true">
        {particles.map((particle) => (
          <span
            className="particle"
            key={particle.id}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDuration: `${particle.duration}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  )
}

function AppHeader({
  title,
  kicker,
  rightSlot,
}: {
  title: string
  kicker: string
  rightSlot?: ReactNode
}) {
  return (
    <header className="admin-topbar">
      <div>
        <p className="hero-kicker">{kicker}</p>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions admin-topbar-actions">
        <nav className="route-switcher" aria-label="App sections">
          <NavLink
            className={({ isActive }) =>
              isActive ? 'route-link route-link-active' : 'route-link'
            }
            end
            to="/"
          >
            Admin
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              isActive ? 'route-link route-link-active' : 'route-link'
            }
            to="/dashboard"
          >
            Dashboard
          </NavLink>
        </nav>
        {rightSlot}
      </div>
    </header>
  )
}

function AdminDashboardPage() {
  const questionSectionRef = useRef<HTMLElement | null>(null)
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null)

  const { quizzesQuery, updateQuizMutation } = useQuizzes()
  const effectiveSelectedQuizId = selectedQuizId ?? quizzesQuery.data?.[0]?.id ?? null
  const { selectedQuizQuery } = useSelectedQuiz(effectiveSelectedQuizId)
  const {
    questionsQuery,
    createQuestionMutation,
    updateQuestionMutation,
    deleteQuestionMutation,
    reorderQuestionsMutation,
  } = useQuestions(effectiveSelectedQuizId)

  function pushToast(message: string, tone: Toast['tone']) {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, message, tone }])

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3200)
  }

  function handleManageQuestions() {
    questionSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  async function handleSaveQuiz(values: { title: string; timer: number }) {
    const selectedQuiz = selectedQuizQuery.data

    if (!selectedQuiz) {
      return
    }

    try {
      await updateQuizMutation.mutateAsync({
        id: selectedQuiz.id,
        title: values.title,
        slug: selectedQuiz.slug,
        timer: values.timer,
      })
      pushToast('Quiz updated successfully.', 'success')
    } catch (error) {
      pushToast(getErrorMessage(error), 'error')
    }
  }

  async function handleQuestionSubmit(values: {
    answer: string
    imageFile: File | null
  }) {
    try {
      if (editingQuestion) {
        await updateQuestionMutation.mutateAsync({
          questionId: editingQuestion.id,
          answer: values.answer,
          imageFile: values.imageFile,
        })
        pushToast('Question updated successfully.', 'success')
      } else if (values.imageFile) {
        await createQuestionMutation.mutateAsync({
          answer: values.answer,
          imageFile: values.imageFile,
        })
        pushToast('Question created successfully.', 'success')
      }

      setIsQuestionModalOpen(false)
      setEditingQuestion(undefined)
    } catch (error) {
      pushToast(getErrorMessage(error), 'error')
    }
  }

  async function handleDeleteQuestion(questionId: string) {
    try {
      await deleteQuestionMutation.mutateAsync(questionId)
      setDeleteTarget(null)
      pushToast('Question deleted successfully.', 'success')
    } catch (error) {
      pushToast(getErrorMessage(error), 'error')
    }
  }

  async function handleReorder(questionIds: string[]) {
    try {
      await reorderQuestionsMutation.mutateAsync(questionIds)
    } catch (error) {
      pushToast(getErrorMessage(error), 'error')
    }
  }

  return (
    <div className="page-shell admin-shell">
      <AppHeader
        kicker="Office Quiz Admin"
        title="Quiz Content Manager"
        rightSlot={
          <div className="timer-badge">
            <span className="timer-icon" aria-hidden="true">
              ◔
            </span>
            <span>No auth mode</span>
          </div>
        }
      />

      <main className="admin-main">
        <div className="desktop-only-notice">
          This admin surface is optimized for desktop screens.
        </div>

        <section className="admin-hero glass-panel">
          <div className="hero-copy-block">
            <p className="panel-kicker">Content operations</p>
            <h2>Manage all four quiz types from one workspace.</h2>
            <p>
              Rename quiz display titles, tune timers, and build question sets
              with drag-and-drop ordering, image previews, and fast edit flows.
            </p>
          </div>
        </section>

        <section className="admin-layout">
          <aside className="admin-sidebar">
            <QuizSelector
              isLoading={quizzesQuery.isLoading}
              quizzes={quizzesQuery.data ?? []}
              selectedQuizId={effectiveSelectedQuizId}
              onSelect={setSelectedQuizId}
            />
          </aside>

          <section className="admin-content">
            {quizzesQuery.isError ? (
              <section className="glass-panel message-card message-card-lg">
                <p>We couldn&apos;t load the available quizzes.</p>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => quizzesQuery.refetch()}
                >
                  Retry
                </button>
              </section>
            ) : (
              <>
                <QuizForm
                  isLoading={selectedQuizQuery.isLoading}
                  isSaving={updateQuizMutation.isPending}
                  key={effectiveSelectedQuizId ?? 'quiz-form-empty'}
                  quiz={selectedQuizQuery.data}
                  summary={
                    quizzesQuery.data?.find(
                      (quiz) => quiz.id === effectiveSelectedQuizId,
                    )
                  }
                  onManageQuestions={handleManageQuestions}
                  onSave={handleSaveQuiz}
                />

                <section ref={questionSectionRef}>
                  <QuestionList
                    isError={questionsQuery.isError}
                    isLoading={questionsQuery.isLoading}
                    isReordering={reorderQuestionsMutation.isPending}
                    questions={questionsQuery.data ?? []}
                    onAdd={() => {
                      setEditingQuestion(undefined)
                      setIsQuestionModalOpen(true)
                    }}
                    onDelete={setDeleteTarget}
                    onEdit={(question) => {
                      setEditingQuestion(question)
                      setIsQuestionModalOpen(true)
                    }}
                    onReorder={handleReorder}
                    onRetry={() => questionsQuery.refetch()}
                  />
                </section>
              </>
            )}
          </section>
        </section>
      </main>

      <QuestionModal
        isOpen={isQuestionModalOpen}
        isSaving={
          createQuestionMutation.isPending || updateQuestionMutation.isPending
        }
        key={editingQuestion?.id ?? 'create-question'}
        mode={editingQuestion ? 'edit' : 'create'}
        question={editingQuestion}
        onClose={() => {
          setIsQuestionModalOpen(false)
          setEditingQuestion(undefined)
        }}
        onSubmit={handleQuestionSubmit}
      />

      <DeleteDialog
        isDeleting={deleteQuestionMutation.isPending}
        question={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteQuestion}
      />

      <ToastStack toasts={toasts} />
    </div>
  )
}

function StageDashboardPage() {
  const { quizzesQuery } = useQuizzes()

  const quizzes = (quizzesQuery.data ?? [])
    .slice()
    .sort(
      (first, second) =>
        quizOrder.indexOf(first.slug) - quizOrder.indexOf(second.slug),
    )

  return (
    <div className="page-shell stage-shell">
      <AppHeader
        kicker="Office Quiz Show"
        title="Office Fun Quiz 2026"
        rightSlot={
          <div className="timer-badge">
            <span className="timer-icon" aria-hidden="true">
              ◔
            </span>
            <span>Stage mode</span>
          </div>
        }
      />

      <main className="stage-main">
        <section className="hero-block" aria-labelledby="dashboard-title">
          <span className="hero-kicker">Office quiz show UI</span>
          <h2 id="dashboard-title" className="stage-title">
            Choose a game to begin
          </h2>
        </section>

        {quizzesQuery.isLoading ? (
          <section className="game-grid" aria-label="Loading dashboard">
            {Array.from({ length: 4 }, (_, index) => (
              <LoadingSkeleton key={index} className="skeleton-stage-card" />
            ))}
          </section>
        ) : null}

        {quizzesQuery.isError ? (
          <section className="glass-panel message-card message-card-lg">
            <p>We couldn&apos;t load the stage dashboard.</p>
            <button
              className="secondary-button"
              type="button"
              onClick={() => quizzesQuery.refetch()}
            >
              Retry
            </button>
          </section>
        ) : null}

        {!quizzesQuery.isLoading && !quizzesQuery.isError ? (
          <section className="game-grid" aria-label="Quiz game dashboard">
            {quizzes.map((quiz) => (
              <StageCard key={quiz.id} quiz={quiz} />
            ))}
          </section>
        ) : null}

        <nav className="dashboard-footer" aria-label="Dashboard navigation">
          <Link className="footer-button footer-button-ghost" to="/">
            <span aria-hidden="true">←</span>
            <span>Back To Admin</span>
          </Link>
          <div className="quiz-player-footer-progress">
            Keyboard first experience
          </div>
          <span className="footer-button footer-button-primary footer-button-static">
            Full HD Ready
          </span>
        </nav>
      </main>
    </div>
  )
}

function StageCard({ quiz }: { quiz: QuizSummary }) {
  const meta = quizCardMeta[quiz.slug] ?? {
    description: `Manage and launch ${quiz.title.toLowerCase()} from the quiz console.`,
    emoji: '✨',
    accent: 'primary' as const,
  }

  return (
    <Link className={`game-card game-card-${meta.accent}`} to={`/quiz/${quiz.id}`}>
      <div className="card-glow" aria-hidden="true" />
      <div className="game-icon" aria-hidden="true">
        <span>{meta.emoji}</span>
      </div>
      <div className="game-copy">
        <h3>{quiz.title}</h3>
        <p>{meta.description}</p>
      </div>
      <div className="stage-card-meta">
        <span>{quiz.totalQuestions} questions</span>
        <span>{quiz.timer}s timer</span>
      </div>
      <span className="card-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  )
}

function QuizPlayerPage() {
  const navigate = useNavigate()
  const params = useParams()
  const quizId = params.quizId ?? null
  const { selectedQuizQuery } = useSelectedQuiz(quizId)
  const quiz = selectedQuizQuery.data

  if (selectedQuizQuery.isLoading) {
    return (
      <div className="page-shell quiz-player-shell">
        <section className="quiz-player-loading glass-panel">
          <LoadingSkeleton className="skeleton-stage-card" />
        </section>
      </div>
    )
  }

  if (selectedQuizQuery.isError || !quiz) {
    return (
      <div className="page-shell quiz-player-shell">
        <section className="glass-panel message-card message-card-lg">
          <p>We couldn&apos;t load this quiz.</p>
          <div className="action-row">
            <button
              className="secondary-button"
              type="button"
              onClick={() => selectedQuizQuery.refetch()}
            >
              Retry
            </button>
            <button className="primary-button" type="button" onClick={() => navigate('/dashboard')}>
              Back To Dashboard
            </button>
          </div>
        </section>
      </div>
    )
  }

  if (quiz.questions.length === 0) {
    return (
      <div className="page-shell quiz-player-shell">
        <section className="glass-panel message-card message-card-lg">
          <p>This quiz has no questions yet.</p>
          <button className="primary-button" type="button" onClick={() => navigate('/')}>
            Open Admin
          </button>
        </section>
      </div>
    )
  }

  return <QuizPlayerScene key={quiz.id} quiz={quiz} />
}

function QuizPlayerScene({ quiz }: { quiz: Exclude<ReturnType<typeof useSelectedQuiz>['selectedQuizQuery']['data'], undefined> }) {
  const navigate = useNavigate()
  const {
    currentIndex,
    currentQuestion,
    overlayState,
    showExitDialog,
    timer,
    totalQuestions,
    clearOverlays,
    dismissActiveOverlays,
    goToNextQuestion,
    goToPreviousQuestion,
    handleCorrect,
    handleWrong,
    restartTimer,
    setShowExitDialog,
    startTimer,
    toggleFullscreen,
  } = useQuizPlayer(quiz)
  const emoji = quizCardMeta[quiz.slug]?.emoji ?? '✨'

  if (!currentQuestion || totalQuestions === 0) {
    return null
  }

  const timerStatus = overlayState.timeUp
    ? 'Time Up'
    : timer.isRunning
      ? 'Running'
      : timer.secondsLeft === quiz.timer
        ? 'Waiting'
        : 'Paused'

  return (
    <KeyboardShortcutProvider
      handlers={{
        onCorrect: handleCorrect,
        onDismissOverlay: dismissActiveOverlays,
        onExit: () => setShowExitDialog(true),
        onFullscreen: toggleFullscreen,
        onNext: goToNextQuestion,
        onPause: timer.pause,
        onPrevious: goToPreviousQuestion,
        onRestart: restartTimer,
        onStart: startTimer,
        onWrong: handleWrong,
      }}
    >
      <div className="page-shell quiz-player-shell">
        <div className="quiz-player-layout">
          <QuizHeader
            currentIndex={currentIndex}
            emoji={emoji}
            title={quiz.title}
            totalQuestions={totalQuestions}
            onBack={() => setShowExitDialog(true)}
          />

          <main className="quiz-player-main">
            <section className="quiz-player-stage">
              <QuestionImage
                alt={currentQuestion.answer}
                hidden={overlayState.memoryReveal}
                image={currentQuestion.image}
              />
              <MemoryOverlay visible={overlayState.memoryReveal} />
              <SuccessOverlay visible={overlayState.success} />
              <WrongOverlay visible={overlayState.wrong} />
              <TimeUpOverlay visible={overlayState.timeUp} />
            </section>

            <aside className="quiz-player-sidebar">
              <section className="player-sidebar-card player-sidebar-card-timer glass-panel">
                <p className="panel-kicker">Timer</p>
                <QuizTimer
                  isRunning={timer.isRunning}
                  isTimeUp={overlayState.timeUp}
                  secondsLeft={timer.secondsLeft}
                />
              </section>

              <section className="player-sidebar-card glass-panel">
                <p className="panel-kicker">Keyboard Shortcuts</p>
                <div className="shortcut-list">
                  <div className="shortcut-row">
                    <kbd>S</kbd>
                    <span>Start Timer</span>
                  </div>
                  <div className="shortcut-row">
                    <kbd>Space</kbd>
                    <span>Pause</span>
                  </div>
                  <div className="shortcut-row">
                    <kbd>R</kbd>
                    <span>Restart</span>
                  </div>
                  <div className="shortcut-row">
                    <kbd>D</kbd>
                    <span>Dismiss Overlay</span>
                  </div>
                  <div className="shortcut-row">
                    <kbd>Y</kbd>
                    <span>Correct</span>
                  </div>
                  <div className="shortcut-row">
                    <kbd>N</kbd>
                    <span>Wrong</span>
                  </div>
                  <div className="shortcut-row">
                    <kbd>←</kbd>
                    <span>Previous</span>
                  </div>
                  <div className="shortcut-row">
                    <kbd>→</kbd>
                    <span>Next</span>
                  </div>
                  <div className="shortcut-row">
                    <kbd>F</kbd>
                    <span>Fullscreen</span>
                  </div>
                  <div className="shortcut-row">
                    <kbd>Esc</kbd>
                    <span>Home</span>
                  </div>
                </div>
              </section>

              <section className="player-sidebar-card glass-panel">
                <p className="panel-kicker">Quiz Information</p>
                <div className="player-info-block">
                  <strong>{quiz.title}</strong>
                  <span>
                    Question {currentIndex + 1} / {totalQuestions}
                  </span>
                </div>
                <div className="player-info-status">
                  <span>Timer Status</span>
                  <strong>{timerStatus}</strong>
                </div>
              </section>
            </aside>
          </main>

          <QuestionNavigation
            canGoNext={currentIndex < totalQuestions - 1}
            canGoPrevious={currentIndex > 0}
            currentIndex={currentIndex}
            totalQuestions={totalQuestions}
            onNext={goToNextQuestion}
            onPrevious={goToPreviousQuestion}
          />
        </div>

        {showExitDialog ? (
          <div className="dialog-backdrop" role="presentation">
            <div aria-modal="true" className="dialog-shell delete-dialog" role="dialog">
              <div className="panel-header">
                <p className="panel-kicker">Leave Quiz Player</p>
                <h2>Return to home?</h2>
              </div>
              <p className="dialog-copy">
                The current timer will stop and the projector screen will return to the
                quiz dashboard.
              </p>
              <div className="action-row action-row-end">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setShowExitDialog(false)}
                >
                  Stay Here
                </button>
                <button
                  className="primary-button"
                  type="button"
                  onClick={() => {
                    clearOverlays()
                    timer.pause()
                    navigate('/dashboard')
                  }}
                >
                  Leave Quiz
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </KeyboardShortcutProvider>
  )
}

export default App
