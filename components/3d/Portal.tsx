'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function PortalScene() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001
      meshRef.current.rotation.y += 0.002
      meshRef.current.position.z = Math.sin(clock.getElapsedTime() * 0.5) * 0.3
    }
  })

  return (
    <group ref={meshRef}>
      <Sphere args={[1, 64, 64]} scale={1.5}>
        <MeshDistortMaterial
          color="#0f0f0f"
          emissive="#ff00ff"
          emissiveIntensity={0.2}
          distort={0.5}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
      
      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Particle key={i} index={i} />
      ))}
    </group>
  )
}

function Particle({ index }: { index: number }) {
  const ref = useRef<THREE.Mesh>(null)
  const angle = (index / 20) * Math.PI * 2
  const distance = 3
  const initialPosition: [number, number, number] = [
    Math.cos(angle) * distance,
    Math.sin(angle) * distance - 1,
    Math.cos(angle * 2) * distance,
  ]

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.x =
        initialPosition[0] +
        Math.sin(clock.getElapsedTime() * 0.3 + index) * 0.5
      ref.current.position.y =
        initialPosition[1] +
        Math.cos(clock.getElapsedTime() * 0.2 + index * 0.5) * 0.5
      ref.current.position.z =
        initialPosition[2] +
        Math.sin(clock.getElapsedTime() * 0.25 + index * 0.3) * 0.5
    }
  })

  return (
    <mesh ref={ref} position={initialPosition} scale={0.05}>
      <sphereGeometry />
      <meshBasicMaterial color="#ff00ff" toneMapped={false} />
    </mesh>
  )
}

export function Portal() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <color attach="background" args={['#0a0a0a']} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ff00ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />
        <PortalScene />
      </Canvas>
    </div>
  )
}
