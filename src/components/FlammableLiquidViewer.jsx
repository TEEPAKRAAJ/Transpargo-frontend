// src/components/FlammableLiquidViewer.jsx
import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";

// ---------------- LAYER 1: ALCOHOL BOTTLE ----------------
function FlammableLiquidBottle({ model }) {
  return (
    <primitive
      object={model.scene.clone()}
      scale={.006}
      position={[0, -0.6, 0]}
    />
  );
}

// ---------------- LAYER 2: STYROFOAM BOX (Cushioning / Absorbent) ----------------
function StyrofoamLayer({ visible, model }) {
  if (!visible) return null;

  const foam = model.scene.clone();
  foam.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = 0.6; // slightly transparent to show bottle
    }
  });

  return (
    <primitive
      object={foam}
      scale={[4, 19,6]}
      position={[0, -0.6, 0]}
    />
  );
}

// ---------------- LAYER 3: RIGID PLASTIC CONTAINER ----------------
function PlasticContainerLayer({ visible, model }) {
  if (!visible) return null;

  const container = model.scene.clone();
  container.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = 0.25;
    }
  });

  return (
    <primitive
      object={container}
      scale={[4.5, 10,3]}
      position={[0, -0.6, 0]}
    />
  );
}

// ---------------- LAYER 4: OUTER STEEL DRUM ----------------
function SteelDrumLayer({ visible, model }) {
  if (!visible) return null;

  const drum = model.scene.clone();
  drum.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = 0.2; // mostly transparent for visualization
    }
  });

  return (
    <primitive
      object={drum}
      scale={[5.2, 4.4, 5.2]}
      position={[0, -0.7, 0]}
      rotation={[0, Math.PI / 2, 0]} // rotate 90 degrees
    />
  );
}

// ---------------- MAIN VIEWER ----------------
export default function FlammableLiquidViewer() {
  const [showFoam, setShowFoam] = useState(true);
  const [showContainer, setShowContainer] = useState(true);
  const [showDrum, setShowDrum] = useState(true);

  const bottleModel = useGLTF("/models/alcohol_bottle.glb");
  const foamModel = useGLTF("/models/styrofoam_box_close.glb");
  const plasticContainerModel = useGLTF("/models/plastic_storage_container.glb");
  const steelDrumModel = useGLTF("/models/steel_drum_v1.glb");

  return (
    <div style={{ display: "flex", gap: "30px" }}>
      {/* -------- 3D VIEWER -------- */}
      <div
        style={{
          width: "500px",
          height: "350px",
          border: "3px solid #ddd",
          borderRadius: "12px",
          background: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <Canvas camera={{ position: [4, 3, 5], fov: 50 }}>
          <ambientLight intensity={1.1} />
          <directionalLight position={[5, 5, 5]} intensity={1.4} />
          <Environment preset="warehouse" />
          <OrbitControls enableZoom enableRotate enablePan={false} />

          <Suspense fallback={null}>
            <FlammableLiquidBottle model={bottleModel} />
            <StyrofoamLayer visible={showFoam} model={foamModel} />
            <PlasticContainerLayer visible={showContainer} model={plasticContainerModel} />
            <SteelDrumLayer visible={showDrum} model={steelDrumModel} />
          </Suspense>
        </Canvas>
      </div>

      {/* -------- LEGEND / TOGGLE PANEL -------- */}
      <div className="dg-layer-legend" >
        <Legend label="Layer 1: FlammableLiquid Bottle" color="#D32F2F" />

        <ToggleLegend
          label="Layer 2: Styrofoam Cushion"
          active={showFoam}
          onClick={() => setShowFoam(!showFoam)}
          color="#4CAF50"
        />

        <ToggleLegend
          label="Layer 3: Plastic Container"
          active={showContainer}
          onClick={() => setShowContainer(!showContainer)}
          color="#2196F3"
        />

        <ToggleLegend
          label="Layer 4: Steel Drum"
          active={showDrum}
          onClick={() => setShowDrum(!showDrum)}
          color="#8D6E63"
        />
      </div>
    </div>
  );
}

// ---------------- UI HELPERS ----------------
function Legend({ label, color }) {
  return (
    <div
      style={{
        background: color,
        padding: "14px",
        color: "white",
        borderRadius: "10px",
        fontWeight: "600",
        textAlign: "center",
        pointerEvents: "none",
      }}
    >
      {label}
    </div>
  );
}

function ToggleLegend({ label, active, onClick, color }) {
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
      {label}
    </div>
  );
}
