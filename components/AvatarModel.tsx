"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function AvatarModel() {
  const { scene } = useGLTF("/claipousse.glb");
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const vel = useRef({ x: 0, y: 0.5, z: 0 });
  const impulse = useRef({ x: 0, y: 0, z: 0 });
  const scaleVec = useRef(new THREE.Vector3());

  function handleClick() {
    // boost in the direction already spinning to avoid cancellation
    const dir = vel.current.y + impulse.current.y >= 0 ? 1 : -1;
    impulse.current.y += dir * (9 + Math.random() * 3);
    impulse.current.x += (Math.random() - 0.5) * 8;
    impulse.current.z += (Math.random() - 0.5) * 3;
  }

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const rot = groupRef.current.rotation;

    // frame-rate independent exponential decay (~2.5s)
    const impFriction = Math.pow(0.15, delta);
    impulse.current.x *= impFriction;
    impulse.current.y *= impFriction;
    impulse.current.z *= impFriction;

    // 0 = chaotic (impulse active), 1 = calm (idle)
    const impulseMag = Math.abs(impulse.current.x) + Math.abs(impulse.current.y) + Math.abs(impulse.current.z);
    const calm = 1 - Math.min(1, impulseMag / 5);

    // organic idle perturbations via out-of-phase sine waves
    vel.current.y += 0.2 * Math.sin(t * 0.31) * delta;
    vel.current.x += 0.5 * Math.sin(t * 0.47 + 1.2) * delta;
    vel.current.z += 0.25 * Math.sin(t * 0.39 + 0.7) * delta;

    // pendulum restoring force: stable at 0°, unstable at 180° — model never locks upside down
    vel.current.x -= 1.5 * calm * Math.sin(rot.x) * delta;
    vel.current.z -= 1.5 * calm * Math.sin(rot.z) * delta;

    const tiltDamp = Math.pow(0.4, delta * calm);
    vel.current.x *= tiltDamp;
    vel.current.z *= tiltDamp;

    const targetY = 0.4 + 0.15 * Math.sin(t * 0.2);
    vel.current.y += (targetY - vel.current.y) * 2.0 * calm * delta;
    vel.current.y *= Math.pow(0.85, delta);

    rot.y += (vel.current.y + impulse.current.y) * delta;
    rot.x += (vel.current.x + impulse.current.x) * delta;
    rot.z += (vel.current.z + impulse.current.z) * delta;

    const s = hovered ? 1.18 : 1;
    groupRef.current.scale.lerp(scaleVec.current.set(s, s, s), 0.08);
  });

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/claipousse.glb");
