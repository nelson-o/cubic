export type FaceName = 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom'

export type CubiePosition = readonly [x: -1 | 0 | 1, y: -1 | 0 | 1, z: -1 | 0 | 1]

export type CubeHighlight = {
  readonly position: CubiePosition
  readonly faces?: readonly FaceName[]
}

export type CubeState = {
  readonly rotation: readonly [x: number, y: number, z: number]
  readonly solvedLayers: readonly ('bottom' | 'middle' | 'top')[]
}

export type TutorialStep = {
  readonly id: string
  readonly title: string
  readonly body: string
  readonly cameraPosition: readonly [x: number, y: number, z: number]
  readonly cubeState: CubeState
  readonly highlights: readonly CubeHighlight[]
}

export const tutorialSteps: readonly TutorialStep[] = [
  {
    id: 'inspect',
    title: 'Inspect the cube',
    body: 'Start by reading the centers. They anchor the face colors and make the rest of the solve easier to follow.',
    cameraPosition: [5.8, 4.6, 6.4],
    cubeState: {
      rotation: [0, -0.35, 0],
      solvedLayers: [],
    },
    highlights: [
      { position: [0, 0, 1], faces: ['front'] },
      { position: [0, 1, 0], faces: ['top'] },
      { position: [1, 0, 0], faces: ['right'] },
    ],
  },
  {
    id: 'first-face',
    title: 'Resolve the first face',
    body: 'Build one complete face first. Keep the matching side colors attached so the first layer is already aligned.',
    cameraPosition: [5.6, 4.2, 6.8],
    cubeState: {
      rotation: [0.18, -0.45, 0],
      solvedLayers: ['bottom'],
    },
    highlights: [
      { position: [-1, -1, 1], faces: ['front', 'bottom'] },
      { position: [0, -1, 1], faces: ['front', 'bottom'] },
      { position: [1, -1, 1], faces: ['front', 'bottom'] },
    ],
  },
  {
    id: 'edge-ring',
    title: 'Align the edge ring',
    body: 'With the first face steady, turn the upper area until edge colors line up with their center pieces.',
    cameraPosition: [6.4, 4, 6.1],
    cubeState: {
      rotation: [0.1, -0.7, 0],
      solvedLayers: ['bottom'],
    },
    highlights: [
      { position: [0, 0, 1], faces: ['front'] },
      { position: [1, 0, 0], faces: ['right'] },
      { position: [-1, 0, 0], faces: ['left'] },
    ],
  },
  {
    id: 'middle-layer',
    title: 'Resolve the middle layer',
    body: 'Move unsolved edges into the side slots while preserving the finished first layer below.',
    cameraPosition: [6.1, 4.4, 6.1],
    cubeState: {
      rotation: [0.08, -0.6, 0],
      solvedLayers: ['bottom', 'middle'],
    },
    highlights: [
      { position: [-1, 0, 1], faces: ['front', 'left'] },
      { position: [1, 0, 1], faces: ['front', 'right'] },
      { position: [1, 0, -1], faces: ['right', 'back'] },
    ],
  },
  {
    id: 'final-orient',
    title: 'Preview final orientation',
    body: 'Finish by orienting the last face, then permuting the final pieces until every face reads as one color.',
    cameraPosition: [5.9, 5.2, 6],
    cubeState: {
      rotation: [0.05, -0.5, 0],
      solvedLayers: ['bottom', 'middle', 'top'],
    },
    highlights: [
      { position: [-1, 1, 1], faces: ['top', 'front'] },
      { position: [0, 1, 1], faces: ['top', 'front'] },
      { position: [1, 1, 1], faces: ['top', 'front'] },
    ],
  },
]

export function getTutorialStep(index: number): TutorialStep {
  const clampedIndex = Math.min(Math.max(index, 0), tutorialSteps.length - 1)

  return tutorialSteps[clampedIndex]
}
