import { Edges, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { Euler, Vector3, type Group } from 'three'
import type { CubeHighlight, CubiePosition, FaceName, TutorialStep } from './tutorial'

type CubeSceneProps = {
  step: TutorialStep
}

type FaceConfig = {
  position: readonly [number, number, number]
  rotation: readonly [number, number, number]
  color: string
}

const CUBIE_POSITIONS = [-1, 0, 1] as const
const CUBIE_GAP = 1.06

const faceConfigs: Record<FaceName, FaceConfig> = {
  front: {
    position: [0, 0, 0.511],
    rotation: [0, 0, 0],
    color: '#e74c3c',
  },
  back: {
    position: [0, 0, -0.511],
    rotation: [0, Math.PI, 0],
    color: '#f28c28',
  },
  left: {
    position: [-0.511, 0, 0],
    rotation: [0, -Math.PI / 2, 0],
    color: '#2364aa',
  },
  right: {
    position: [0.511, 0, 0],
    rotation: [0, Math.PI / 2, 0],
    color: '#2ca58d',
  },
  top: {
    position: [0, 0.511, 0],
    rotation: [-Math.PI / 2, 0, 0],
    color: '#f3d34a',
  },
  bottom: {
    position: [0, -0.511, 0],
    rotation: [Math.PI / 2, 0, 0],
    color: '#f7f7f2',
  },
}

function positionKey(position: CubiePosition) {
  return position.join(',')
}

function isFaceVisible(face: FaceName, [x, y, z]: CubiePosition) {
  return (
    (face === 'front' && z === 1) ||
    (face === 'back' && z === -1) ||
    (face === 'left' && x === -1) ||
    (face === 'right' && x === 1) ||
    (face === 'top' && y === 1) ||
    (face === 'bottom' && y === -1)
  )
}

function highlightMap(highlights: readonly CubeHighlight[]) {
  return new Map(highlights.map((highlight) => [positionKey(highlight.position), highlight]))
}

function CameraRig({ step }: CubeSceneProps) {
  const { camera } = useThree()
  const target = useMemo(() => new Vector3(...step.cameraPosition), [step.cameraPosition])

  useFrame(() => {
    camera.position.lerp(target, 0.05)
    camera.lookAt(0, 0, 0)
  })

  return null
}

function Facelet({
  face,
  highlighted,
}: {
  face: FaceName
  highlighted: boolean
}) {
  const config = faceConfigs[face]

  return (
    <mesh position={config.position} rotation={config.rotation}>
      <planeGeometry args={[0.82, 0.82]} />
      <meshStandardMaterial
        color={config.color}
        emissive={highlighted ? '#f7d154' : '#000000'}
        emissiveIntensity={highlighted ? 0.24 : 0}
        roughness={0.44}
        metalness={0.02}
      />
    </mesh>
  )
}

function Cubie({
  position,
  highlight,
}: {
  position: CubiePosition
  highlight?: CubeHighlight
}) {
  const visibleFaces = (Object.keys(faceConfigs) as FaceName[]).filter((face) =>
    isFaceVisible(face, position),
  )
  const highlightedFaces = new Set(highlight?.faces ?? visibleFaces)
  const isHighlighted = Boolean(highlight)

  return (
    <group position={position.map((value) => value * CUBIE_GAP) as [number, number, number]}>
      <mesh>
        <boxGeometry args={[0.98, 0.98, 0.98]} />
        <meshStandardMaterial color={isHighlighted ? '#252936' : '#151821'} roughness={0.62} />
        <Edges color={isHighlighted ? '#f7d154' : '#454a57'} linewidth={isHighlighted ? 2.2 : 1} />
      </mesh>
      {visibleFaces.map((face) => (
        <Facelet key={face} face={face} highlighted={highlightedFaces.has(face)} />
      ))}
    </group>
  )
}

function RubikMock({ step }: CubeSceneProps) {
  const groupRef = useRef<Group>(null)
  const highlights = useMemo(() => highlightMap(step.highlights), [step.highlights])
  const positions = useMemo(
    () =>
      CUBIE_POSITIONS.flatMap((x) =>
        CUBIE_POSITIONS.flatMap((y) =>
          CUBIE_POSITIONS.map((z) => [x, y, z] as const satisfies CubiePosition),
        ),
      ),
    [],
  )
  const targetRotation = useMemo(() => new Euler(...step.cubeState.rotation), [step.cubeState.rotation])

  useFrame(() => {
    if (!groupRef.current) return

    groupRef.current.rotation.x += (targetRotation.x - groupRef.current.rotation.x) * 0.08
    groupRef.current.rotation.y += (targetRotation.y - groupRef.current.rotation.y) * 0.08
    groupRef.current.rotation.z += (targetRotation.z - groupRef.current.rotation.z) * 0.08
  })

  return (
    <group ref={groupRef} scale={0.72}>
      {positions.map((position) => (
        <Cubie
          key={positionKey(position)}
          position={position}
          highlight={highlights.get(positionKey(position))}
        />
      ))}
    </group>
  )
}

export function CubeScene({ step }: CubeSceneProps) {
  return (
    <Canvas
      camera={{ position: step.cameraPosition, fov: 38 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={['#eef2f3']} />
      <ambientLight intensity={1.3} />
      <directionalLight position={[3, 5, 4]} intensity={2.1} />
      <directionalLight position={[-4, 2, -3]} intensity={0.9} />
      <CameraRig step={step} />
      <RubikMock step={step} />
      <OrbitControls enablePan={false} minDistance={4.8} maxDistance={10} />
    </Canvas>
  )
}
