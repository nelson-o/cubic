import { Edges, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Component, useEffect, useMemo, useRef, useState, type ErrorInfo, type ReactNode } from 'react'
import { Vector3, type Group } from 'three'
import type { CubeState, Face, Move, Sticker, Vec3 } from './cube'
import { cubiesFromState, moveAffectsPosition, moveRotation, sceneLayout, type ViewCubie } from './cubeView'

type CubeSceneProps = {
  cube: CubeState
  activeMove?: Move
  animationKey: string
  focusedPieces: readonly string[]
  cameraPosition: readonly [number, number, number]
  playing: boolean
  reducedMotion: boolean
  speed: number
  onMoveComplete: () => void
}

const CUBIE_GAP = 1.045
const STICKER_COLORS: Record<Face, string> = {
  U: '#ffd500',
  D: '#f8fafc',
  F: '#169b62',
  B: '#2563eb',
  R: '#dc2626',
  L: '#f97316',
}

function normalRotation([x, y, z]: Vec3): [number, number, number] {
  if (x === 1) return [0, Math.PI / 2, 0]
  if (x === -1) return [0, -Math.PI / 2, 0]
  if (y === 1) return [-Math.PI / 2, 0, 0]
  if (y === -1) return [Math.PI / 2, 0, 0]
  if (z === -1) return [0, Math.PI, 0]
  return [0, 0, 0]
}

function Facelet({ sticker, highlighted }: { sticker: Sticker; highlighted: boolean }) {
  const position = sticker.normal.map((value) => value * 0.511) as [number, number, number]
  return (
    <mesh position={position} rotation={normalRotation(sticker.normal)}>
      <planeGeometry args={[0.82, 0.82]} />
      <meshStandardMaterial
        color={STICKER_COLORS[sticker.color]}
        emissive={highlighted ? '#ffd166' : '#000000'}
        emissiveIntensity={highlighted ? 0.22 : 0}
        roughness={0.4}
      />
    </mesh>
  )
}

function Cubie({ cubie, highlighted }: { cubie: ViewCubie; highlighted: boolean }) {
  const position = cubie.position.map((value) => value * CUBIE_GAP) as [number, number, number]
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.98, 0.98, 0.98]} />
        <meshStandardMaterial color={highlighted ? '#242a35' : '#11151d'} roughness={0.7} />
        <Edges color={highlighted ? '#ffd166' : '#3f4652'} linewidth={highlighted ? 2 : 1} />
      </mesh>
      {cubie.stickers.map((sticker) => (
        <Facelet key={sticker.id} sticker={sticker} highlighted={highlighted} />
      ))}
    </group>
  )
}

function CubieSet({ cubies, focused }: { cubies: readonly ViewCubie[]; focused: ReadonlySet<string> }) {
  return cubies.map((cubie) => (
    <Cubie key={cubie.key} cubie={cubie} highlighted={focused.has(cubie.key)} />
  ))
}

function AnimatedCube({
  cube,
  activeMove,
  animationKey,
  focusedPieces,
  playing,
  reducedMotion,
  speed,
  onMoveComplete,
}: Omit<CubeSceneProps, 'cameraPosition'>) {
  const movingRef = useRef<Group>(null)
  const progress = useRef(0)
  const completed = useRef(false)
  const { size } = useThree()
  const layout = sceneLayout(size.width, size.height)
  const focused = useMemo(() => new Set(focusedPieces), [focusedPieces])
  const cubies = useMemo(() => cubiesFromState(cube), [cube])
  const moving = activeMove ? cubies.filter((cubie) => moveAffectsPosition(activeMove, cubie.position)) : []
  const still = activeMove ? cubies.filter((cubie) => !moveAffectsPosition(activeMove, cubie.position)) : cubies

  useEffect(() => {
    progress.current = 0
    completed.current = false
    movingRef.current?.rotation.set(0, 0, 0)
  }, [animationKey])

  useFrame((_, delta) => {
    if (!activeMove || !playing || completed.current || !movingRef.current) return
    const duration = reducedMotion ? 0 : 0.48 / speed
    progress.current = duration === 0 ? 1 : Math.min(1, progress.current + delta / duration)
    const eased = 1 - (1 - progress.current) ** 3
    const { axis, angle } = moveRotation(activeMove)
    movingRef.current.rotation[axis] = angle * eased

    if (progress.current === 1) {
      completed.current = true
      onMoveComplete()
    }
  })

  return (
    <group scale={layout.scale}>
      <CubieSet cubies={still} focused={focused} />
      <group ref={movingRef}>
        <CubieSet cubies={moving} focused={focused} />
      </group>
    </group>
  )
}

function CameraRig({ position }: { position: readonly [number, number, number] }) {
  const { camera, size } = useThree()
  const layout = sceneLayout(size.width, size.height)
  const target = useMemo(
    () => new Vector3(...position).multiplyScalar(layout.distance),
    [layout.distance, position],
  )

  useFrame(() => {
    camera.position.lerp(target, 0.08)
    camera.lookAt(0, layout.targetY, 0)
  })
  return null
}

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Cube scene failed', error, info) }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function SceneFallback() {
  return (
    <div className="scene-fallback" role="alert">
      <strong>3D preview unavailable</strong>
      <span>Your browser could not start WebGL. The move guide remains available.</span>
    </div>
  )
}

export function CubeScene(props: CubeSceneProps) {
  const [contextLost, setContextLost] = useState(false)
  if (contextLost) return <SceneFallback />

  return (
    <SceneBoundary fallback={<SceneFallback />}>
      <Canvas
        camera={{ position: props.cameraPosition, fov: 38 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault()
            setContextLost(true)
          }, { once: true })
        }}
      >
        <color attach="background" args={['#e9edf2']} />
        <ambientLight intensity={1.45} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} />
        <directionalLight position={[-4, 2, -3]} intensity={0.8} />
        <CameraRig position={props.cameraPosition} />
        <AnimatedCube {...props} />
        <OrbitControls
          enabled={!props.playing}
          enablePan={false}
          minDistance={5}
          maxDistance={10}
        />
      </Canvas>
    </SceneBoundary>
  )
}
