import { useEffect, useMemo, useReducer, useState } from 'react'
import './App.css'
import { CubeScene } from './CubeScene'
import { createReplayState, replayReducer } from './replay'
import { getTutorialCase, moveToNotation, tutorialCases, tutorialStages } from './tutorial'

function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return reduced
}

function App() {
  const [state, dispatch] = useReducer(replayReducer, undefined, () => createReplayState())
  const [libraryOpen, setLibraryOpen] = useState(false)
  const reducedMotion = useReducedMotion()
  const tutorialCase = getTutorialCase(state.caseIndex)
  const stageIndex = tutorialStages.findIndex((stage) => stage.id === tutorialCase.stage)
  const stage = tutorialStages[stageIndex]
  const activeMove = tutorialCase.algorithm[state.moveIndex]
  const stageCases = useMemo(
    () => tutorialCases.filter((item) => item.stage === tutorialCase.stage),
    [tutorialCase.stage],
  )
  const stageCaseIndex = stageCases.findIndex((item) => item.id === tutorialCase.id)

  const selectCase = (index: number) => {
    dispatch({ type: 'select-case', caseIndex: index })
    setLibraryOpen(false)
  }

  const goRelative = (offset: number) => {
    selectCase(Math.min(Math.max(state.caseIndex + offset, 0), tutorialCases.length - 1))
  }

  return (
    <main className="app-stage">
      <section className="scene-stage" aria-label="Interactive Rubik cube replay">
        <CubeScene
          cube={state.cube}
          activeMove={activeMove}
          animationKey={`${state.revision}:${state.moveIndex}`}
          focusedPieces={tutorialCase.focusedPieces}
          cameraPosition={tutorialCase.camera}
          playing={state.status === 'playing'}
          reducedMotion={reducedMotion}
          speed={state.speed}
          onMoveComplete={() => dispatch({ type: 'commit-move' })}
        />
      </section>

      <header className="top-bar">
        <button className="brand" type="button" onClick={() => selectCase(0)} aria-label="Go to first lesson">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
          <span>Cubic</span>
        </button>
        <div className="stage-progress" aria-label={`Stage ${stageIndex + 1} of ${tutorialStages.length}`}>
          <span>Layer {stage.layer}</span>
          <div className="stage-dots" aria-hidden="true">
            {tutorialStages.map((item, index) => (
              <i key={item.id} className={index <= stageIndex ? 'active' : undefined} />
            ))}
          </div>
          <strong>{stage.label}</strong>
        </div>
        <button className="library-button" type="button" onClick={() => setLibraryOpen(true)}>
          All cases <span>{tutorialCases.length}</span>
        </button>
      </header>

      <aside className="lesson-overlay" aria-label="Replay controls">
        <div className="lesson-meta">
          <span>Layer {stage.layer} · Case {stageCaseIndex + 1}/{stageCases.length}</span>
          <span>{state.moveIndex}/{tutorialCase.algorithm.length} moves</span>
        </div>
        <h1>{tutorialCase.title}</h1>
        <p>{tutorialCase.instruction}</p>

        <div className="notation" aria-label="Move sequence">
          {tutorialCase.algorithm.map((move, index) => (
            <span
              key={`${moveToNotation(move)}-${index}`}
              className={index === state.moveIndex ? 'current' : index < state.moveIndex ? 'complete' : undefined}
            >
              {moveToNotation(move)}
            </span>
          ))}
        </div>

        <div className="replay-controls">
          <button type="button" onClick={() => goRelative(-1)} disabled={state.caseIndex === 0} aria-label="Previous case">
            ←
          </button>
          <button type="button" onClick={() => dispatch({ type: 'restart' })} aria-label="Restart case">
            ↻
          </button>
          <button
            type="button"
            className="play-button"
            onClick={() => dispatch({ type: state.status === 'playing' ? 'pause' : 'play' })}
            disabled={state.status === 'complete'}
          >
            {state.status === 'playing' ? 'Pause' : state.status === 'complete' ? 'Complete' : 'Play replay'}
          </button>
          <label className="speed-control">
            <span className="sr-only">Replay speed</span>
            <select
              value={state.speed}
              onChange={(event) => dispatch({ type: 'set-speed', speed: Number(event.target.value) as 0.5 | 1 | 1.5 })}
            >
              <option value={0.5}>0.5×</option>
              <option value={1}>1×</option>
              <option value={1.5}>1.5×</option>
            </select>
          </label>
          <button type="button" onClick={() => goRelative(1)} disabled={state.caseIndex === tutorialCases.length - 1} aria-label="Next case">
            →
          </button>
        </div>
        <div className="interaction-hint" aria-live="polite">
          <span className={`status-light ${state.status}`} />
          {state.status === 'playing' ? `Playing ${activeMove ? moveToNotation(activeMove) : ''}` : 'Drag the cube to inspect it'}
        </div>
      </aside>

      {libraryOpen && (
        <div className="sheet-backdrop" role="presentation" onMouseDown={() => setLibraryOpen(false)}>
          <section className="case-sheet" role="dialog" aria-modal="true" aria-labelledby="case-sheet-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="sheet-header">
              <div>
                <span>Beginner method</span>
                <h2 id="case-sheet-title">All replay cases</h2>
              </div>
              <button type="button" onClick={() => setLibraryOpen(false)} aria-label="Close case library">×</button>
            </div>
            <div className="case-sheet-scroll">
              {[1, 2, 3].map((layer) => (
                <section key={layer} className="case-group">
                  <h3>Layer {layer}</h3>
                  {tutorialStages.filter((item) => item.layer === layer).map((stageItem) => (
                    <div key={stageItem.id} className="case-stage">
                      <span>{stageItem.label}</span>
                      {tutorialCases.map((item, index) => item.stage === stageItem.id && (
                        <button key={item.id} type="button" className={item.id === tutorialCase.id ? 'selected' : undefined} onClick={() => selectCase(index)}>
                          <strong>{item.title}</strong>
                          <small>{item.algorithm.map(moveToNotation).join(' ')}</small>
                        </button>
                      ))}
                    </div>
                  ))}
                </section>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  )
}

export default App
