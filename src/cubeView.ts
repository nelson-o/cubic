import { createSolvedCube, type CubeState, type Move, type Sticker, type Vec3 } from './cube'

export type ViewCubie = {
  readonly key: string
  readonly position: Vec3
  readonly stickers: readonly Sticker[]
}

const FACE_AXIS = {
  R: { axis: 0 as const, sign: 1 },
  L: { axis: 0 as const, sign: -1 },
  U: { axis: 1 as const, sign: 1 },
  D: { axis: 1 as const, sign: -1 },
  F: { axis: 2 as const, sign: 1 },
  B: { axis: 2 as const, sign: -1 },
}

const AXIS_NAMES = ['x', 'y', 'z'] as const
const BODY_COLOR = '#11151d'
const DEFAULT_EDGE_COLOR = '#11151d'
const HIGHLIGHT_EDGE_COLOR = '#ffd166'

export function physicalCubieId(stickers: readonly Sticker[]): string {
  return stickers.map((sticker) => sticker.id).sort().join('|')
}

export function cubieAppearance(highlighted: boolean) {
  return {
    bodyColor: BODY_COLOR,
    edgeColor: highlighted ? HIGHLIGHT_EDGE_COLOR : DEFAULT_EDGE_COLOR,
  } as const
}

export function sceneLayout(width: number, height: number) {
  if (width <= 900 && height < 500) return { scale: 0.56, targetY: -0.28, distance: 1.08 } as const
  if (width <= 900 && height < 650) return { scale: 0.58, targetY: -0.42, distance: 1.1 } as const
  if (width <= 900) return { scale: 0.68, targetY: -0.36, distance: 1.06 } as const
  return { scale: 0.74, targetY: 0, distance: 1 } as const
}

export function cubiesFromState(state: CubeState): ViewCubie[] {
  const groups = new Map<string, Sticker[]>()
  for (const sticker of state.stickers) {
    const key = sticker.position.join(',')
    const group = groups.get(key) ?? []
    group.push(sticker)
    groups.set(key, group)
  }

  return [...groups.entries()]
    .map(([, stickers]) => ({ key: physicalCubieId(stickers), position: stickers[0].position, stickers }))
    .sort((left, right) => left.key.localeCompare(right.key))
}

const SOLVED_PIECE_IDS = new Map(
  cubiesFromState(createSolvedCube()).map((cubie) => [cubie.position.join(','), cubie.key]),
)

export function resolveFocusedPieceIds(targets: readonly string[]): string[] {
  return targets.map((target) => {
    const id = SOLVED_PIECE_IDS.get(target)
    if (!id) throw new Error(`Invalid focused target: ${target}`)
    return id
  })
}

export function moveAffectsPosition(move: Move, position: Vec3): boolean {
  if (move.face === 'x' || move.face === 'y' || move.face === 'z') return true
  const { axis, sign } = FACE_AXIS[move.face]
  return position[axis] === sign
}

export function moveRotation(move: Move): { axis: 'x' | 'y' | 'z'; angle: number } {
  if (move.face === 'x' || move.face === 'y' || move.face === 'z') {
    return { axis: move.face, angle: -move.turns * Math.PI / 2 }
  }

  const { axis, sign } = FACE_AXIS[move.face]
  return { axis: AXIS_NAMES[axis], angle: -sign * move.turns * Math.PI / 2 }
}
