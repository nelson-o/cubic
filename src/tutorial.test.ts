import { describe, expect, test } from 'bun:test'
import { applyAlgorithm, createSolvedCube, faceFromNormal } from './cube'
import {
  checkpoints,
  getTutorialCase,
  tutorialCases,
  tutorialStages,
  type TutorialStage,
} from './tutorial'

const previousCheckpoints: Partial<Record<TutorialStage, readonly (keyof typeof checkpoints)[]>> = {
  'white-corners': ['whiteCross'],
  'middle-edges': ['firstLayer'],
  'yellow-cross': ['middleLayer'],
  'yellow-face': ['middleLayer', 'yellowCross'],
  'yellow-corners': ['middleLayer', 'yellowFace'],
  'yellow-edges': ['middleLayer', 'yellowFace', 'yellowCornersPositioned'],
}

describe('tutorial cases', () => {
  test('defines the approved seven-stage beginner progression', () => {
    expect(tutorialStages.map((stage) => stage.id)).toEqual([
      'white-cross',
      'white-corners',
      'middle-edges',
      'yellow-cross',
      'yellow-face',
      'yellow-corners',
      'yellow-edges',
    ])
    expect(tutorialCases.length).toBeGreaterThanOrEqual(12)
  })

  test('every setup preserves the previous checkpoint and every replay reaches its target', () => {
    const solved = createSolvedCube()

    for (const tutorialCase of tutorialCases) {
      const setupState = applyAlgorithm(solved, tutorialCase.setup)
      const prior = previousCheckpoints[tutorialCase.stage] ?? []
      for (const checkpoint of prior) expect(checkpoints[checkpoint](setupState)).toBe(true)

      const completed = applyAlgorithm(setupState, tutorialCase.algorithm)
      expect(tutorialCase.checkpoint(completed)).toBe(true)
    }
  })

  test('the final stage completes the entire cube', () => {
    const solved = createSolvedCube()
    const finalCases = tutorialCases.filter((item) => item.stage === 'yellow-edges')

    expect(finalCases.length).toBeGreaterThan(0)
    for (const tutorialCase of finalCases) {
      const completed = applyAlgorithm(applyAlgorithm(solved, tutorialCase.setup), tutorialCase.algorithm)
      expect(checkpoints.solved(completed)).toBe(true)
    }
  })

  test('yellow cross cases begin as the named line, L, and dot patterns', () => {
    const solved = createSolvedCube()
    const orientedEdgeCount = (id: string) => {
      const item = tutorialCases.find((candidate) => candidate.id === id)
      if (!item) throw new Error(`Missing case: ${id}`)
      const setup = applyAlgorithm(solved, item.setup)
      return setup.stickers.filter((sticker) =>
        sticker.color === 'U' &&
        faceFromNormal(sticker.normal) === 'U' &&
        Math.abs(sticker.position[0]) + Math.abs(sticker.position[2]) === 1,
      ).length
    }

    expect(orientedEdgeCount('yellow-cross-line')).toBe(2)
    expect(orientedEdgeCount('yellow-cross-l')).toBe(2)
    expect(orientedEdgeCount('yellow-cross-dot')).toBe(0)
  })

  test('case lookup clamps to the available range', () => {
    expect(getTutorialCase(-4).id).toBe(tutorialCases[0].id)
    expect(getTutorialCase(999).id).toBe(tutorialCases[tutorialCases.length - 1].id)
  })
})
