import './App.css'

const games = [
  {
    title: 'Character Guessing',
    description:
      'Identify your colleagues or famous icons from blurred silhouettes.',
    emoji: '🎭',
    accent: 'primary',
  },
  {
    title: 'Guess the Word',
    description: 'Solve cryptic clues and unscramble professional jargon.',
    emoji: '🧩',
    accent: 'secondary',
  },
  {
    title: 'Guess the Movie',
    description:
      'Name the cinematic masterpiece from a single iconic quote or shot.',
    emoji: '🎬',
    accent: 'tertiary',
  },
  {
    title: 'Memory Challenge',
    description: 'Test your focus with rapid-fire pattern recall and sequences.',
    emoji: '🧠',
    accent: 'primary',
  },
]

const particles = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  size: 2 + (index % 4),
  left: (index * 17) % 100,
  top: (index * 23) % 100,
  duration: 10 + (index % 6) * 3,
  delay: -(index % 5) * 2,
}))

function App() {
  return (
    <div className="dashboard-shell">
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

      <header className="dashboard-topbar">
        <div className="dashboard-brand">QUIZ MASTER</div>
        <div className="topbar-actions" aria-label="Quiz status">
          <div className="timer-badge">
            <span className="timer-icon" aria-hidden="true">
              ◔
            </span>
            <span>00:30</span>
          </div>
          <button className="icon-button" type="button" aria-label="Quiz help">
            ?
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="hero-block" aria-labelledby="dashboard-title">
          <span className="hero-kicker">Office quiz show UI</span>
          <h1 id="dashboard-title">Office Fun Quiz 2026</h1>
          <p className="hero-copy">Choose a game to begin</p>
        </section>

        <section className="game-grid" aria-label="Quiz game dashboard">
          {games.map((game) => (
            <button
              className={`game-card game-card-${game.accent}`}
              key={game.title}
              type="button"
            >
              <div className="card-glow" aria-hidden="true" />
              <div className="game-icon" aria-hidden="true">
                <span>{game.emoji}</span>
              </div>
              <div className="game-copy">
                <h2>{game.title}</h2>
                <p>{game.description}</p>
              </div>
              <span className="card-arrow" aria-hidden="true">
                →
              </span>
            </button>
          ))}
        </section>
      </main>

      <nav className="dashboard-footer" aria-label="Dashboard navigation">
        <button className="footer-button footer-button-ghost" type="button">
          <span aria-hidden="true">←</span>
          <span>Previous</span>
        </button>
        <button className="footer-button footer-button-primary" type="button">
          <span>Next</span>
          <span aria-hidden="true">→</span>
        </button>
      </nav>

      <div className="ambient ambient-primary" aria-hidden="true" />
      <div className="ambient ambient-secondary" aria-hidden="true" />
    </div>
  )
}

export default App
