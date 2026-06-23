import { describe, expect, test } from 'bun:test'
import { getTutorialStep, tutorialSteps } from './tutorial'

describe('tutorial steps', () => {
  test('defines a five-step resolving path with stable ids', () => {
    expect(tutorialSteps).toHaveLength(5)
    expect(tutorialSteps.map((step) => step.id)).toEqual([
      'inspect',
      'first-face',
      'edge-ring',
      'middle-layer',
      'final-orient',
    ])
  })

  test('clamps requested steps to the available tutorial range', () => {
    expect(getTutorialStep(-2).id).toBe('inspect')
    expect(getTutorialStep(99).id).toBe('final-orient')
  })
})
