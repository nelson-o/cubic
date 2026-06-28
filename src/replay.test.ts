import { describe, expect, test } from 'bun:test'
import { isCubeSolved, serializeCube } from './cube'
import { createReplayState, replayReducer } from './replay'
import { tutorialCases } from './tutorial'

describe('replay controller', () => {
  test('plays moves deterministically and completes at the checkpoint', () => {
    const caseIndex = tutorialCases.findIndex((item) => item.id === 'middle-right')
    let state = createReplayState(caseIndex)
    state = replayReducer(state, { type: 'play' })

    while (state.status === 'playing') {
      state = replayReducer(state, { type: 'commit-move' })
    }

    expect(state.status).toBe('complete')
    expect(state.moveIndex).toBe(tutorialCases[caseIndex].algorithm.length)
    expect(tutorialCases[caseIndex].checkpoint(state.cube)).toBe(true)
  })

  test('pause prevents a move from committing', () => {
    let state = replayReducer(createReplayState(0), { type: 'play' })
    state = replayReducer(state, { type: 'pause' })
    const paused = replayReducer(state, { type: 'commit-move' })

    expect(paused).toBe(state)
    expect(paused.moveIndex).toBe(0)
  })

  test('select and restart cancel progress and restore exact setup state', () => {
    let state = replayReducer(createReplayState(0), { type: 'play' })
    state = replayReducer(state, { type: 'commit-move' })
    state = replayReducer(state, { type: 'select-case', caseIndex: 3 })

    expect(state.caseIndex).toBe(3)
    expect(state.moveIndex).toBe(0)
    expect(state.status).toBe('idle')

    state = replayReducer(replayReducer(state, { type: 'play' }), { type: 'commit-move' })
    const restarted = replayReducer(state, { type: 'restart' })
    const fresh = createReplayState(3)
    expect(serializeCube(restarted.cube)).toBe(serializeCube(fresh.cube))
    expect(restarted.moveIndex).toBe(0)
    expect(restarted.status).toBe('idle')
    expect(restarted.revision).toBeGreaterThan(fresh.revision)
  })

  test('the final replay reports a solved cube', () => {
    let state = createReplayState(tutorialCases.length - 1)
    state = replayReducer(state, { type: 'play' })
    while (state.status === 'playing') state = replayReducer(state, { type: 'commit-move' })

    expect(isCubeSolved(state.cube)).toBe(true)
  })

  test('case selection clamps to the available library', () => {
    const state = replayReducer(createReplayState(), { type: 'select-case', caseIndex: 999 })
    expect(state.caseIndex).toBe(tutorialCases.length - 1)
  })
})
