import { useMemo, useState } from 'react'
import './App.css'
import { CubeScene } from './CubeScene'
import { getTutorialStep, tutorialSteps } from './tutorial'

function App() {
  const [stepIndex, setStepIndex] = useState(0)
  const step = getTutorialStep(stepIndex)
  const progressLabel = `${stepIndex + 1} / ${tutorialSteps.length}`
  const solvedLabel = useMemo(() => {
    if (step.cubeState.solvedLayers.length === 0) return 'No solved layers yet'

    return `Solved: ${step.cubeState.solvedLayers.join(', ')}`
  }, [step.cubeState.solvedLayers])

  const goPrevious = () => setStepIndex((current) => Math.max(current - 1, 0))
  const goNext = () => setStepIndex((current) => Math.min(current + 1, tutorialSteps.length - 1))

  return (
    <main className="app-shell">
      <section className="scene-panel" aria-label="Interactive cubic tutorial mock">
        <CubeScene step={step} />
        <div className="scene-status" aria-live="polite">
          <span>{solvedLabel}</span>
          <span>{step.highlights.length} highlighted targets</span>
        </div>
      </section>

      <aside className="lesson-panel" aria-label="Tutorial step controls">
        <div className="lesson-kicker">Cubic resolver</div>
        <h1>Learn the cube one resolving step at a time</h1>
        <p className="lesson-intro">
          Rotate the mock cube, inspect the highlighted pieces, then advance through the
          guided states.
        </p>

        <div className="step-card">
          <div className="step-meta">
            <span>Step {progressLabel}</span>
            <span>{step.id}</span>
          </div>
          <h2>{step.title}</h2>
          <p>{step.body}</p>
        </div>

        <div className="step-controls" aria-label="Tutorial navigation">
          <button type="button" onClick={goPrevious} disabled={stepIndex === 0}>
            Previous
          </button>
          <div className="progress-track" aria-hidden="true">
            {tutorialSteps.map((item, index) => (
              <span
                key={item.id}
                className={index <= stepIndex ? 'progress-dot active' : 'progress-dot'}
              />
            ))}
          </div>
          <button
            type="button"
            className="primary"
            onClick={goNext}
            disabled={stepIndex === tutorialSteps.length - 1}
          >
            Next
          </button>
        </div>

        <ol className="step-list" aria-label="All tutorial steps">
          {tutorialSteps.map((item, index) => (
            <li key={item.id} className={index === stepIndex ? 'selected' : undefined}>
              <button type="button" onClick={() => setStepIndex(index)}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {item.title}
              </button>
            </li>
          ))}
        </ol>
      </aside>
    </main>
  )
}

export default App
