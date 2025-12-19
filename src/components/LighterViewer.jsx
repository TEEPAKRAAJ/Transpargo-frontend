import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";

// ---------------- LAYER 1: LIGHTER ----------------
function Lighter({ model }) {
  return (
    <primitive
      object={model.scene.clone()}
      scale={1.1}
      position={[0, -0.6, 0]}
    />
  );
}

// ---------------- LAYER 2: PLASTIC CAP ----------------
function PlasticCapLayer({ visible, model }) {
  if (!visible) return null;

  return (
    <primitive
      object={model.scene.clone()}
      scale={[.3,.3,.15]}
      position={[0, -0.4, 0]} // only around ignition area
    />
  );
}

// ---------------- LAYER 3: VALVE SEAL ----------------
function ValveSealLayer({ visible, model }) {
  if (!visible) return null;

  const seal = model.scene.clone();
  seal.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = 0.5;
    }
  });

  return (
    <primitive
      object={seal}
      scale={[0.7, 0.35, 0.4]} // thin vertical seal
      position={[0, -0.05, 0]}
    />
  );
}

// ---------------- LAYER 4: WOODEN BOX ----------------
function WoodenBoxLayer({ visible, model }) {
  if (!visible) return null;

  const box = model.scene.clone();
  box.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = 0.25;
    }
  });

  return (
    <primitive
      object={box}
      scale={[1, 1, 1]}
      position={[0, -0.4, 0]}
      rotation={[0, Math.PI / 2, 0]}
    />
  );
}

// ---------------- MAIN VIEWER ----------------
export default function LighterViewer() {
  const [showCap, setShowCap] = useState(true);
  const [showSeal, setShowSeal] = useState(true);
  const [showBox, setShowBox] = useState(true);

  const lighterModel = useGLTF("/models/vintage_lighter.glb");
  const capModel = useGLTF("/models/plastic_cap.glb");
  const sealModel = useGLTF(
    "/models/cylinder_transparent_artistic_reference.glb"
  );
  const woodenBoxModel = useGLTF("/models/psx_wooden_box.glb");

  return (
    <div style={{ display: "flex", gap: "30px" }}>
      {/* -------- VIEWER -------- */}
      <div
        style={{
          width: "500px",
          height: "320px",
          border: "3px solid #ddd",
          borderRadius: "12px",
          background: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <Canvas camera={{ position: [3, 2, 4], fov: 50 }}>
          <ambientLight intensity={1.1} />
          <directionalLight position={[5, 5, 5]} intensity={1.4} />
          <Environment preset="warehouse" />
          <OrbitControls enableZoom enableRotate enablePan={false} />

          <Suspense fallback={null}>
            <Lighter model={lighterModel} />
            <PlasticCapLayer visible={showCap} model={capModel} />
            <ValveSealLayer visible={showSeal} model={sealModel} />
            <WoodenBoxLayer visible={showBox} model={woodenBoxModel} />
          </Suspense>
        </Canvas>
      </div>

      {/* -------- LEGEND PANEL -------- */}
      <div className="dg-layer-legend" >
        <Legend label="Layer 1: Gas Lighter" color="#D32F2F" />

        <ToggleLegend
          label="Layer 2: Ignition Safety Cap"
          active={showCap}
          onClick={() => setShowCap(!showCap)}
          color="#4CAF50"
        />

        <ToggleLegend
          label="Layer 3: Valve Leak Seal"
          active={showSeal}
          onClick={() => setShowSeal(!showSeal)}
          color="#2196F3"
        />

        <ToggleLegend
          label="Layer 4: UN Wooden Box"
          active={showBox}
          onClick={() => setShowBox(!showBox)}
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
