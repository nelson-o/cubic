import {
  faceFromNormal,
  isCubeSolved,
  parseAlgorithm,
  type CubeState,
  type Face,
  type Move,
  type Vec3,
} from './cube'

export type TutorialStage =
  | 'white-cross'
  | 'white-corners'
  | 'middle-edges'
  | 'yellow-cross'
  | 'yellow-face'
  | 'yellow-corners'
  | 'yellow-edges'

export type TutorialCase = {
  readonly id: string
  readonly stage: TutorialStage
  readonly title: string
  readonly instruction: string
  readonly setup: readonly Move[]
  readonly algorithm: readonly Move[]
  readonly focusedTargets: readonly string[]
  readonly camera: readonly [x: number, y: number, z: number]
  readonly checkpoint: (state: CubeState) => boolean
}

export const tutorialStages: readonly { id: TutorialStage; label: string; layer: 1 | 2 | 3 }[] = [
  { id: 'white-cross', label: 'White cross', layer: 1 },
  { id: 'white-corners', label: 'White corners', layer: 1 },
  { id: 'middle-edges', label: 'Middle edges', layer: 2 },
  { id: 'yellow-cross', label: 'Yellow cross', layer: 3 },
  { id: 'yellow-face', label: 'Yellow face', layer: 3 },
  { id: 'yellow-corners', label: 'Position corners', layer: 3 },
  { id: 'yellow-edges', label: 'Position edges', layer: 3 },
]

function samePosition(left: Vec3, right: Vec3) {
  return left.every((value, index) => value === right[index])
}

function pieceStickers(state: CubeState, position: Vec3) {
  return state.stickers.filter((sticker) => samePosition(sticker.position, position))
}

function isPieceSolved(state: CubeState, position: Vec3) {
  return pieceStickers(state, position).every((sticker) => sticker.color === faceFromNormal(sticker.normal))
}

function topStickerIsYellow(state: CubeState, position: Vec3) {
  return pieceStickers(state, position).some(
    (sticker) => sticker.color === 'U' && faceFromNormal(sticker.normal) === 'U',
  )
}

function expectedColors(position: Vec3): Face[] {
  const [x, y, z] = position
  const colors: Face[] = []
  if (x) colors.push(x === 1 ? 'R' : 'L')
  if (y) colors.push(y === 1 ? 'U' : 'D')
  if (z) colors.push(z === 1 ? 'F' : 'B')
  return colors.sort()
}

function pieceIsPositioned(state: CubeState, position: Vec3) {
  const actual = pieceStickers(state, position).map((sticker) => sticker.color).sort()
  return actual.join('') === expectedColors(position).join('')
}

const bottomEdges: readonly Vec3[] = [[0, -1, 1], [1, -1, 0], [0, -1, -1], [-1, -1, 0]]
const bottomPieces: readonly Vec3[] = [
  ...bottomEdges,
  [-1, -1, -1], [-1, -1, 1], [1, -1, -1], [1, -1, 1], [0, -1, 0],
]
const middleEdges: readonly Vec3[] = [[1, 0, 1], [1, 0, -1], [-1, 0, -1], [-1, 0, 1]]
const topEdges: readonly Vec3[] = [[0, 1, 1], [1, 1, 0], [0, 1, -1], [-1, 1, 0]]
const topCorners: readonly Vec3[] = [[1, 1, 1], [1, 1, -1], [-1, 1, -1], [-1, 1, 1]]

export const checkpoints = {
  whiteCross: (state: CubeState) => bottomEdges.every((position) => isPieceSolved(state, position)),
  firstLayer: (state: CubeState) => bottomPieces.every((position) => isPieceSolved(state, position)),
  middleLayer: (state: CubeState) =>
    bottomPieces.every((position) => isPieceSolved(state, position)) &&
    middleEdges.every((position) => isPieceSolved(state, position)),
  yellowCross: (state: CubeState) => topEdges.every((position) => topStickerIsYellow(state, position)),
  yellowFace: (state: CubeState) =>
    [...topEdges, ...topCorners, [0, 1, 0] as Vec3].every((position) => topStickerIsYellow(state, position)),
  yellowCornersPositioned: (state: CubeState) => topCorners.every((position) => pieceIsPositioned(state, position)),
  yellowEdgesPositioned: (state: CubeState) => topEdges.every((position) => pieceIsPositioned(state, position)),
  solved: isCubeSolved,
} as const

function inverse(moves: readonly Move[]): Move[] {
  return [...moves].reverse().map((move) => ({
    ...move,
    turns: move.turns === 2 ? 2 : move.turns === 1 ? -1 : 1,
  }))
}

function defineCase(
  data: Omit<TutorialCase, 'setup' | 'algorithm'> & { algorithm: string },
): TutorialCase {
  const algorithm = parseAlgorithm(data.algorithm)
  return { ...data, algorithm, setup: inverse(algorithm) }
}

const defaultCamera = [5.8, 4.8, 6.4] as const

export const tutorialCases: readonly TutorialCase[] = [
  defineCase({
    id: 'cross-flipped', stage: 'white-cross', title: 'Flip a white edge',
    instruction: 'Align the side color with its center, then turn that face twice.',
    algorithm: 'F2', focusedTargets: ['0,-1,1'], camera: defaultCamera,
    checkpoint: checkpoints.whiteCross,
  }),
  defineCase({
    id: 'cross-side', stage: 'white-cross', title: 'Lift an edge from the side',
    instruction: 'Lift the white edge, align its partner color, and return it to the base.',
    algorithm: "F U R U'", focusedTargets: ['0,-1,1'], camera: defaultCamera,
    checkpoint: checkpoints.whiteCross,
  }),
  defineCase({
    id: 'corner-right', stage: 'white-corners', title: 'Insert from the right',
    instruction: 'Place the corner above its slot and use the right-hand trigger.',
    algorithm: "R U R'", focusedTargets: ['1,-1,1'], camera: defaultCamera,
    checkpoint: checkpoints.firstLayer,
  }),
  defineCase({
    id: 'corner-left', stage: 'white-corners', title: 'Insert from the left',
    instruction: 'Place the corner above its slot and use the mirrored trigger.',
    algorithm: "L' U' L", focusedTargets: ['-1,-1,1'], camera: defaultCamera,
    checkpoint: checkpoints.firstLayer,
  }),
  defineCase({
    id: 'middle-right', stage: 'middle-edges', title: 'Insert a right edge',
    instruction: 'Match the front center, move the edge away, then open and restore its slot.',
    algorithm: "U R U' R' U' F' U F", focusedTargets: ['1,0,1'], camera: defaultCamera,
    checkpoint: checkpoints.middleLayer,
  }),
  defineCase({
    id: 'middle-left', stage: 'middle-edges', title: 'Insert a left edge',
    instruction: 'Mirror the insertion when the target belongs left of the front center.',
    algorithm: "U' L' U L U F U' F'", focusedTargets: ['-1,0,1'], camera: defaultCamera,
    checkpoint: checkpoints.middleLayer,
  }),
  defineCase({
    id: 'yellow-cross-line', stage: 'yellow-cross', title: 'Line to yellow cross',
    instruction: 'Hold the yellow line horizontally and run the cross pattern once.',
    algorithm: "F R U R' U' F'", focusedTargets: ['0,1,1', '1,1,0', '0,1,-1', '-1,1,0'], camera: defaultCamera,
    checkpoint: checkpoints.yellowCross,
  }),
  defineCase({
    id: 'yellow-cross-l', stage: 'yellow-cross', title: 'L shape to yellow cross',
    instruction: 'Hold the L at the back-left and repeat the cross pattern.',
    algorithm: "F R U R' U' F' F R U R' U' F'", focusedTargets: ['0,1,1', '1,1,0', '0,1,-1', '-1,1,0'], camera: defaultCamera,
    checkpoint: checkpoints.yellowCross,
  }),
  defineCase({
    id: 'yellow-cross-dot', stage: 'yellow-cross', title: 'Dot to yellow cross',
    instruction: 'Repeat the same pattern, reorienting the top pattern between passes.',
    algorithm: "F R U R' U' F' F R U R' U' F' U F R U R' U' F'", focusedTargets: ['0,1,1', '1,1,0', '0,1,-1', '-1,1,0'], camera: defaultCamera,
    checkpoint: checkpoints.yellowCross,
  }),
  defineCase({
    id: 'yellow-face-one', stage: 'yellow-face', title: 'Orient yellow corners',
    instruction: 'Keep the oriented corner at front-left and repeat the corner pattern.',
    algorithm: "R U R' U R U2 R'", focusedTargets: ['1,1,1', '1,1,-1', '-1,1,-1', '-1,1,1'], camera: defaultCamera,
    checkpoint: checkpoints.yellowFace,
  }),
  defineCase({
    id: 'yellow-face-repeat', stage: 'yellow-face', title: 'Repeat to finish yellow',
    instruction: 'Turn only the top to normalize the case, then repeat the same pattern.',
    algorithm: "R U R' U R U2 R' R U R' U R U2 R'", focusedTargets: ['1,1,1', '1,1,-1', '-1,1,-1', '-1,1,1'], camera: defaultCamera,
    checkpoint: checkpoints.yellowFace,
  }),
  defineCase({
    id: 'position-yellow-corners', stage: 'yellow-corners', title: 'Position yellow corners',
    instruction: 'Keep a correct corner at front-right and repeat until all corners belong.',
    algorithm: "R' F R' B2 R F' R' B2 R2", focusedTargets: ['1,1,1', '1,1,-1', '-1,1,-1', '-1,1,1'], camera: defaultCamera,
    checkpoint: checkpoints.yellowCornersPositioned,
  }),
  defineCase({
    id: 'position-yellow-edges', stage: 'yellow-edges', title: 'Cycle the final edges',
    instruction: 'Keep the solved side at the back and repeat the edge cycle as needed.',
    algorithm: "F2 U L R' F2 L' R U F2", focusedTargets: ['0,1,1', '1,1,0', '0,1,-1', '-1,1,0'], camera: defaultCamera,
    checkpoint: checkpoints.solved,
  }),
]

export function getTutorialCase(index: number): TutorialCase {
  return tutorialCases[Math.min(Math.max(index, 0), tutorialCases.length - 1)]
}

export function moveToNotation(move: Move): string {
  return `${move.face}${move.turns === -1 ? "'" : move.turns === 2 ? '2' : ''}`
}
