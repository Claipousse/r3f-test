"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import AvatarModel from "./AvatarModel";

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4], fov: 45 }}
      style={{ background: "#0f0f0f" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 3]} intensity={1.2} />
      <Suspense fallback={null}>
        <AvatarModel />
      </Suspense>
    </Canvas>
  );
}
