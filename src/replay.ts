import { applyAlgorithm, applyMove, createSolvedCube, type CubeState } from './cube'
import { getTutorialCase, tutorialCases } from './tutorial'

export type ReplayStatus = 'idle' | 'playing' | 'paused' | 'complete'

export type ReplayState = {
  readonly caseIndex: number
  readonly cube: CubeState
  readonly moveIndex: number
  readonly status: ReplayStatus
  readonly speed: 0.5 | 1 | 1.5
  readonly revision: number
}

export type ReplayAction =
  | { readonly type: 'play' }
  | { readonly type: 'pause' }
  | { readonly type: 'commit-move' }
  | { readonly type: 'restart' }
  | { readonly type: 'select-case'; readonly caseIndex: number }
  | { readonly type: 'set-speed'; readonly speed: ReplayState['speed'] }

export function createReplayState(caseIndex = 0, revision = 0): ReplayState {
  const clampedCaseIndex = Math.min(Math.max(caseIndex, 0), tutorialCases.length - 1)
  const tutorialCase = getTutorialCase(clampedCaseIndex)
  return {
    caseIndex: clampedCaseIndex,
    cube: applyAlgorithm(createSolvedCube(), tutorialCase.setup),
    moveIndex: 0,
    status: 'idle',
    speed: 1,
    revision,
  }
}

export function replayReducer(state: ReplayState, action: ReplayAction): ReplayState {
  if (action.type === 'select-case') return createReplayState(action.caseIndex, state.revision + 1)
  if (action.type === 'restart') return { ...createReplayState(state.caseIndex, state.revision + 1), speed: state.speed }
  if (action.type === 'set-speed') return { ...state, speed: action.speed }
  if (action.type === 'pause') return state.status === 'playing' ? { ...state, status: 'paused' } : state
  if (action.type === 'play') {
    if (state.status === 'complete') return state
    return { ...state, status: 'playing' }
  }

  if (state.status !== 'playing') return state
  const tutorialCase = getTutorialCase(state.caseIndex)
  const move = tutorialCase.algorithm[state.moveIndex]
  if (!move) return { ...state, status: 'complete' }

  const moveIndex = state.moveIndex + 1
  return {
    ...state,
    cube: applyMove(state.cube, move),
    moveIndex,
    status: moveIndex === tutorialCase.algorithm.length ? 'complete' : 'playing',
  }
}
