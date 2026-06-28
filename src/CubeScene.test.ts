import { expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

test('camera framing does not continuously overwrite orbit inspection', () => {
  const source = readFileSync(new URL('./CubeScene.tsx', import.meta.url), 'utf8')
  const cameraStart = source.indexOf('function CameraRig')
  const cameraEnd = source.indexOf('\nclass SceneBoundary', cameraStart)
  const cameraRig = source.slice(cameraStart, cameraEnd)

  expect(cameraRig).toContain('useEffect')
  expect(cameraRig).not.toContain('useFrame')
})

test('highlighting cannot modify facelet color or emissive light', () => {
  const source = readFileSync(new URL('./CubeScene.tsx', import.meta.url), 'utf8')
  const faceletStart = source.indexOf('function Facelet')
  const faceletEnd = source.indexOf('\nfunction Cubie', faceletStart)
  const facelet = source.slice(faceletStart, faceletEnd)

  expect(facelet).not.toContain('highlighted')
  expect(facelet).not.toContain('emissive')
})

test('move commits reset the temporary pivot before paint', () => {
  const source = readFileSync(new URL('./CubeScene.tsx', import.meta.url), 'utf8')
  const cubeStart = source.indexOf('function AnimatedCube')
  const cubeEnd = source.indexOf('\nfunction CameraRig', cubeStart)
  const animatedCube = source.slice(cubeStart, cubeEnd)

  expect(animatedCube).toContain('useLayoutEffect')
})
