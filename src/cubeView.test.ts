import { describe, expect, test } from 'bun:test'
import { createSolvedCube, parseAlgorithm } from './cube'
import { cubiesFromState, moveAffectsPosition, moveRotation, sceneLayout } from './cubeView'

describe('cube view adapter', () => {
  test('groups 54 stickers into 26 visible cubies', () => {
    const cubies = cubiesFromState(createSolvedCube())

    expect(cubies).toHaveLength(26)
    expect(cubies.find((cubie) => cubie.key === '1,1,1')?.stickers).toHaveLength(3)
    expect(cubies.find((cubie) => cubie.key === '0,1,0')?.stickers).toHaveLength(1)
  })

  test('selects only the moved layer and returns its world rotation', () => {
    const [right, leftPrime, rotateY] = parseAlgorithm("R L' y")

    expect(moveAffectsPosition(right, [1, -1, 0])).toBe(true)
    expect(moveAffectsPosition(right, [-1, -1, 0])).toBe(false)
    expect(moveRotation(right)).toEqual({ axis: 'x', angle: -Math.PI / 2 })
    expect(moveRotation(leftPrime)).toEqual({ axis: 'x', angle: -Math.PI / 2 })
    expect(moveAffectsPosition(rotateY, [-1, -1, -1])).toBe(true)
  })

  test('keeps the cube clear of overlays across target viewport classes', () => {
    expect(sceneLayout(320, 568)).toEqual({ scale: 0.58, targetY: -0.42, distance: 1.1 })
    expect(sceneLayout(390, 844)).toEqual({ scale: 0.68, targetY: -0.36, distance: 1.06 })
    expect(sceneLayout(844, 390)).toEqual({ scale: 0.56, targetY: -0.28, distance: 1.08 })
    expect(sceneLayout(1440, 900)).toEqual({ scale: 0.74, targetY: 0, distance: 1 })
  })
})
