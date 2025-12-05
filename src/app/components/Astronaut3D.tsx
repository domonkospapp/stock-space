"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

function AstronautMesh() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/astronaut.glb");

  // Clone the scene and calculate scale
  const { clonedScene, scale } = useMemo(() => {
    const cloned = scene.clone();

    // Calculate bounding box to auto-scale
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const calculatedScale = 3.5 / maxDim; // Scale to fit approximately 3.5 units

    return { clonedScene: cloned, scale: calculatedScale };
  }, [scene]);

  // Smooth rotation and floating animation - space-like tumbling
  useFrame((state, delta) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;

      // Main Y-axis rotation (continuous)
      groupRef.current.rotation.y += delta * 0.3;

      // Random X-axis rotation (tumbling)
      groupRef.current.rotation.x =
        Math.sin(time * 0.4) * 0.2 + Math.cos(time * 0.7) * 0.1;

      // Random Z-axis rotation (spinning)
      groupRef.current.rotation.z =
        Math.sin(time * 0.6) * 0.15 + Math.cos(time * 0.5) * 0.08;

      // Floating up and down
      groupRef.current.position.y = Math.sin(time * 0.8) * 0.15;

      // Slight horizontal drift
      groupRef.current.position.x = Math.cos(time * 0.6) * 0.1;
    }
  });

  // Traverse and update materials for better lighting
  clonedScene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material instanceof THREE.MeshStandardMaterial) {
        child.material.roughness = 0.4;
        child.material.metalness = 0.2;
      }
    }
  });

  return (
    <primitive
      ref={groupRef}
      object={clonedScene}
      scale={[scale, scale, scale]}
      position={[0, 0, 0]}
    />
  );
}

export default function Astronaut3D() {
  return (
    <div className="w-full h-[600px] max-w-xs overflow-visible">
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0, 6], fov: 65 }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <directionalLight
          position={[-5, -3, -5]}
          intensity={0.4}
          color="#ffffff"
        />
        <pointLight position={[0, 0, 8]} intensity={0.3} color="#ffffff" />

        <AstronautMesh />
      </Canvas>
    </div>
  );
}
