import { useRef, useState } from 'react'
import { Link, NavLink, Route, Routes } from 'react-router-dom'

import './App.css'
import { DeleteDialog } from './components/admin/DeleteDialog'
import { QuestionList } from './components/admin/QuestionList'
import { QuestionModal } from './components/admin/QuestionModal'
import { QuizForm } from './components/admin/QuizForm'
import { QuizSelector } from './components/admin/QuizSelector'
import { ToastStack } from './components/admin/ToastStack'
import { useQuestions } from './hooks/useQuestions'
import { useQuizzes, useSelectedQuiz } from './hooks/useQuizzes'
import type { QuizSummary, Question, Toast } from './types/quiz'
import { getErrorMessage } from './lib/api'
import { LoadingSkeleton } from './components/admin/LoadingSkeleton'

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
  { description: string; emoji: string; accent: 'primary' | 'secondary' | 'tertiary' | 'warning' }
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
  rightSlot?: React.ReactNode
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
          <button className="footer-button footer-button-primary" type="button">
            <span>Next</span>
            <span aria-hidden="true">→</span>
          </button>
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
    <button className={`game-card game-card-${meta.accent}`} type="button">
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
    </button>
  )
}

export default App
