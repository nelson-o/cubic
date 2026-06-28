import { describe, expect, test } from 'bun:test'
import {
  applyAlgorithm,
  applyMove,
  createSolvedCube,
  isCubeSolved,
  parseAlgorithm,
  serializeCube,
} from './cube'

describe('cube engine', () => {
  test('parses standard face-turn and cube-rotation notation', () => {
    expect(parseAlgorithm("R U R' U2 x y' z2")).toEqual([
      { face: 'R', turns: 1 },
      { face: 'U', turns: 1 },
      { face: 'R', turns: -1 },
      { face: 'U', turns: 2 },
      { face: 'x', turns: 1 },
      { face: 'y', turns: -1 },
      { face: 'z', turns: 2 },
    ])
  })

  test('rejects invalid notation instead of silently corrupting state', () => {
    expect(() => parseAlgorithm('R Q')).toThrow('Invalid move: Q')
  })

  test('a move followed by its inverse restores the cube', () => {
    const solved = createSolvedCube()
    const moved = applyAlgorithm(solved, parseAlgorithm("R U F2 L D B'"))
    const restored = applyAlgorithm(moved, parseAlgorithm("B D' L' F2 U' R'"))

    expect(serializeCube(restored)).toBe(serializeCube(solved))
    expect(isCubeSolved(restored)).toBe(true)
  })

  test('four quarter turns restore state and preserve all 54 stickers', () => {
    const solved = createSolvedCube()
    const restored = [1, 2, 3, 4].reduce((state) => applyMove(state, { face: 'F', turns: 1 }), solved)

    expect(restored.stickers).toHaveLength(54)
    expect(serializeCube(restored)).toBe(serializeCube(solved))
  })
})
