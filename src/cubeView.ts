import type { CubeState, Move, Sticker, Vec3 } from './cube'

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
    .map(([key, stickers]) => ({ key, position: stickers[0].position, stickers }))
    .sort((left, right) => left.key.localeCompare(right.key))
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
