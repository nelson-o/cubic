export type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B'
export type MoveFace = Face | 'x' | 'y' | 'z'
export type TurnAmount = -1 | 1 | 2
export type Vec3 = readonly [x: number, y: number, z: number]

export type Move = {
  readonly face: MoveFace
  readonly turns: TurnAmount
}

export type Sticker = {
  readonly id: string
  readonly color: Face
  readonly position: Vec3
  readonly normal: Vec3
}

export type CubeState = {
  readonly stickers: readonly Sticker[]
}

const FACE_NORMALS: Record<Face, Vec3> = {
  U: [0, 1, 0],
  D: [0, -1, 0],
  L: [-1, 0, 0],
  R: [1, 0, 0],
  F: [0, 0, 1],
  B: [0, 0, -1],
}

const FACE_AXES: Record<Face, { axis: 0 | 1 | 2; sign: -1 | 1 }> = {
  R: { axis: 0, sign: 1 },
  L: { axis: 0, sign: -1 },
  U: { axis: 1, sign: 1 },
  D: { axis: 1, sign: -1 },
  F: { axis: 2, sign: 1 },
  B: { axis: 2, sign: -1 },
}

const ROTATION_AXES: Record<'x' | 'y' | 'z', 0 | 1 | 2> = { x: 0, y: 1, z: 2 }

function rotateQuarter([x, y, z]: Vec3, axis: 0 | 1 | 2, turns: number): Vec3 {
  const normalized = ((turns % 4) + 4) % 4
  if (normalized === 0) return [x, y, z]
  if (normalized > 1) return rotateQuarter(rotateQuarter([x, y, z], axis, 1), axis, normalized - 1)

  if (axis === 0) return [x, -z, y]
  if (axis === 1) return [z, y, -x]
  return [-y, x, z]
}

function turnSticker(sticker: Sticker, axis: 0 | 1 | 2, quarterTurns: number): Sticker {
  return {
    ...sticker,
    position: rotateQuarter(sticker.position, axis, quarterTurns),
    normal: rotateQuarter(sticker.normal, axis, quarterTurns),
  }
}

export function createSolvedCube(): CubeState {
  const stickers: Sticker[] = []

  for (const [face, normal] of Object.entries(FACE_NORMALS) as [Face, Vec3][]) {
    for (let a = -1; a <= 1; a += 1) {
      for (let b = -1; b <= 1; b += 1) {
        const position: Vec3 = normal[0]
          ? [normal[0], a, b]
          : normal[1]
            ? [a, normal[1], b]
            : [a, b, normal[2]]
        stickers.push({ id: `${face}:${position.join(',')}`, color: face, position, normal })
      }
    }
  }

  return { stickers }
}

export function parseAlgorithm(algorithm: string): Move[] {
  if (!algorithm.trim()) return []

  return algorithm.trim().split(/\s+/).map((token) => {
    const match = /^([UDLRFBxyz])(2|')?$/.exec(token)
    if (!match) throw new Error(`Invalid move: ${token}`)

    return {
      face: match[1] as MoveFace,
      turns: match[2] === "'" ? -1 : match[2] === '2' ? 2 : 1,
    }
  })
}

export function applyMove(state: CubeState, move: Move): CubeState {
  if (move.face === 'x' || move.face === 'y' || move.face === 'z') {
    const axis = ROTATION_AXES[move.face]
    return { stickers: state.stickers.map((sticker) => turnSticker(sticker, axis, -move.turns)) }
  }

  const { axis, sign } = FACE_AXES[move.face]
  const quarterTurns = -sign * move.turns

  return {
    stickers: state.stickers.map((sticker) =>
      sticker.position[axis] === sign ? turnSticker(sticker, axis, quarterTurns) : sticker,
    ),
  }
}

export function applyAlgorithm(state: CubeState, algorithm: readonly Move[]): CubeState {
  return algorithm.reduce(applyMove, state)
}

export function serializeCube(state: CubeState): string {
  return [...state.stickers]
    .sort((left, right) => left.id.localeCompare(right.id))
    .map(({ id, position, normal }) => `${id}:${position.join(',')}:${normal.join(',')}`)
    .join('|')
}

export function faceFromNormal(normal: Vec3): Face {
  const found = (Object.entries(FACE_NORMALS) as [Face, Vec3][]).find(
    ([, candidate]) => candidate.every((value, index) => value === normal[index]),
  )
  if (!found) throw new Error(`Invalid sticker normal: ${normal.join(',')}`)
  return found[0]
}

export function isCubeSolved(state: CubeState): boolean {
  return state.stickers.every((sticker) => sticker.color === faceFromNormal(sticker.normal))
}
