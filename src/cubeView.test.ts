import { describe, expect, test } from 'bun:test'
import { applyAlgorithm, applyMove, createSolvedCube, parseAlgorithm } from './cube'
import {
  cubieAppearance,
  cubiesFromState,
  moveAffectsPosition,
  moveRotation,
  resolveFocusedPieceIds,
  sceneLayout,
} from './cubeView'

describe('cube view adapter', () => {
  test('groups 54 stickers into 26 visible cubies', () => {
    const cubies = cubiesFromState(createSolvedCube())

    expect(cubies).toHaveLength(26)
    expect(cubies.find((cubie) => cubie.position.join(',') === '1,1,1')?.stickers).toHaveLength(3)
    expect(cubies.find((cubie) => cubie.position.join(',') === '0,1,0')?.stickers).toHaveLength(1)
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

  test('keeps stable physical cubie identities and sticker colors across a move', () => {
    const startingState = applyAlgorithm(createSolvedCube(), parseAlgorithm("R U F2 L' D B"))
    const before = cubiesFromState(startingState)
    const signatures = (cubies: typeof before) => Object.fromEntries(
      cubies.map((cubie) => [
        cubie.key,
        cubie.stickers.map((sticker) => `${sticker.id}:${sticker.color}`).sort(),
      ]),
    )

    for (const move of parseAlgorithm("R R' R2 L U D F B x y z")) {
      const after = cubiesFromState(applyMove(startingState, move))
      expect(signatures(after)).toEqual(signatures(before))
    }
  })

  test('resolves a target to the same physical piece after it moves', () => {
    const target = '1,-1,1'
    const [focusedId] = resolveFocusedPieceIds([target])
    const movedCubies = cubiesFromState(applyMove(createSolvedCube(), { face: 'R', turns: 1 }))
    const focusedCubie = movedCubies.find((cubie) => cubie.key === focusedId)

    expect(focusedCubie).toBeDefined()
    expect(focusedCubie?.position.join(',')).not.toBe(target)
  })

  test('highlighting changes only the cubie outline', () => {
    const ordinary = cubieAppearance(false)
    const highlighted = cubieAppearance(true)

    expect(highlighted.bodyColor).toBe(ordinary.bodyColor)
    expect(highlighted.edgeColor).not.toBe(ordinary.edgeColor)
  })
})
