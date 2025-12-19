// src/components/PetroleumDrumViewer.jsx
import React, { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";

// -------- LAYER 1: STEEL DRUM (PETROLEUM) --------
function SteelDrum({ model }) {
  return (
    <primitive
      object={model.scene.clone()}
      scale={2.2}
      position={[0, -0.6, 0]}
    />
  );
}

// -------- LAYER 2: PLASTIC CAP / BUNG --------
function DrumCap({ visible, model }) {
  if (!visible) return null;

  return (
    <primitive
      object={model.scene.clone()}
      scale={[0.308,0.2,0.308]}
      position={[0, 1, 0]} // placed on top of drum
    />
  );
}

// -------- MAIN VIEWER --------
export default function PetroleumDrumViewer() {
  const [showCap, setShowCap] = useState(true);

  const drumModel = useGLTF("/models/steel_drum_v1.glb");
  const capModel = useGLTF("/models/plastic_cap.glb");

  return (
    <div style={{ display: "flex", gap: "30px" }}>
      {/* 3D VIEW */}
      <div
        style={{
          width: "500px",
          height: "350px",
          border: "3px solid #ddd",
          borderRadius: "12px",
          background: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <Canvas camera={{ position: [4, 3, 5], fov: 50 }}>
          <ambientLight intensity={1.1} />
          <directionalLight position={[5, 5, 5]} intensity={1.4} />
          <Environment preset="warehouse" />
          <OrbitControls enableZoom enableRotate enablePan={false} />

          <Suspense fallback={null}>
            <SteelDrum model={drumModel} />
            <DrumCap visible={showCap} model={capModel} />
          </Suspense>
        </Canvas>
      </div>

      {/* LEGEND */}
      <div className="dg-layer-legend">
        <div style={legendStyle("#8D6E63")}>
          Layer 1: Steel Drum (Petroleum)
        </div>

        <div
          style={toggleStyle(showCap ? "#2196F3" : "#9e9e9e")}
          onClick={() => setShowCap(!showCap)}
        >
          Layer 2: Leak-Proof Drum Cap
        </div>
      </div>
    </div>
  );
}

// -------- STYLES --------
const legendStyle = (bg) => ({
  background: bg,
  padding: "14px",
  color: "white",
  borderRadius: "10px",
  fontWeight: "600",
  textAlign: "center",
  pointerEvents: "none",
});

const toggleStyle = (bg) => ({
  background: bg,
  padding: "14px",
  color: "white",
  borderRadius: "10px",
  fontWeight: "600",
  textAlign: "center",
  cursor: "pointer",
  transition: "0.3s",
});
