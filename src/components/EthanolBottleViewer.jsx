// src/components/EthanolBottleViewer.jsx
import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";

// -------- Layer 1: Ethanol Bottle --------
function EthanolBottle({ model }) {
  return (
    <primitive
      object={model.scene.clone()}
      scale={.006}
      position={[0, -0.7, 0]}
    />
  );
}

// -------- Layer 2: Plastic Cap (Leak-proof closure) --------
function PlasticCap({ visible, model }) {
  if (!visible) return null;

  return (
    <primitive
      object={model.scene.clone()}
      scale={[.12,0.3,0.12]}
      position={[0, 1.7, 0]}
    />
  );
}

// -------- Layer 3: Styrofoam Cushion --------
function StyrofoamLayer({ visible, model }) {
  if (!visible) return null;

  const foam = model.scene.clone();
  foam.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = 0.6;
    }
  });

  return (
    <primitive
      object={foam}
      scale={[4, 19,6]}
      position={[0, -0.65, 0]}
    />
  );
}

// -------- Layer 4: Steel Drum (Outer Packaging) --------
function SteelDrum({ visible, model }) {
  if (!visible) return null;

  const drum = model.scene.clone();
  drum.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = 0.25;
    }
  });

  return (
    <primitive
      object={drum}
      scale={[5.2, 4.4, 5.2]}
      position={[0, -0.8, 0]} 
      rotation={[0, Math.PI / 2, 0]}
    />
  );
}

// -------- Main Viewer --------
export default function EthanolBottleViewer() {
  const [showCap, setShowCap] = useState(true);
  const [showFoam, setShowFoam] = useState(true);
  const [showDrum, setShowDrum] = useState(true);

  const bottle = useGLTF("/models/alcohol_bottle.glb");
  const cap = useGLTF("/models/plastic_cap.glb");
  const foam = useGLTF("/models/styrofoam_box_close.glb");
  const drum = useGLTF("/models/steel_drum_v1.glb");

  return (
    <div style={{ display: "flex", gap: "30px" }}>
      {/* 3D View */}
      <div
        style={{
          width: "520px",
          height: "360px",
          border: "3px solid #ddd",
          borderRadius: "12px",
          background: "#fff",
        }}
      >
        <Canvas camera={{ position: [4, 3, 5], fov: 50 }}>
          <ambientLight intensity={1.1} />
          <directionalLight position={[5, 5, 5]} intensity={1.4} />
          <Environment preset="warehouse" />
          <OrbitControls enableZoom enableRotate enablePan={false} />

          <Suspense fallback={null}>
            <EthanolBottle model={bottle} />
            <PlasticCap visible={showCap} model={cap} />
            <StyrofoamLayer visible={showFoam} model={foam} />
            <SteelDrum visible={showDrum} model={drum} />
          </Suspense>
        </Canvas>
      </div>

      {/* Controls */}
      <div className="dg-layer-legend">
        <StaticLabel text="Layer 1: Ethanol Bottle" color="#C62828" />

        <Toggle text="Layer 2: Leak-proof Cap" active={showCap} onClick={() => setShowCap(!showCap)} color="#1565C0" />
        <Toggle text="Layer 3: Styrofoam Cushion" active={showFoam} onClick={() => setShowFoam(!showFoam)} color="#2E7D32" />
        <Toggle text="Layer 4: Steel Drum" active={showDrum} onClick={() => setShowDrum(!showDrum)} color="#6D4C41" />
      </div>
    </div>
  );
}

// -------- UI Components --------
function StaticLabel({ text, color }) {
  return (
    <div style={{
      background: color,
      padding: "14px",
      borderRadius: "10px",
      color: "white",
      fontWeight: "600",
      textAlign: "center",
    }}>
      {text}
    </div>
  );
}

function Toggle({ text, active, onClick, color }) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        background: active ? color : "#9e9e9e",
        padding: "14px",
        borderRadius: "10px",
        color: "white",
        fontWeight: "600",
        textAlign: "center",
        transition: "0.3s",
      }}
    >
      {text}
    </div>
  );
}
