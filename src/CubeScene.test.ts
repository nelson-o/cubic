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
