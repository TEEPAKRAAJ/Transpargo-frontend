import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";

// ---------------- LAYER 1: OXYGEN CYLINDER ----------------
function OxygenCylinder({ model }) {
  return (
    <primitive
      object={model.scene.clone()}
      scale={1.4}
      position={[0, -0.7, 0]}
    />
  );
}

// ---------------- LAYER 2: VALVE PROTECTION CAP ----------------
function ValveCap({ visible, model }) {
  if (!visible) return null;

  return (
    <primitive
      object={model.scene.clone()}
      scale={[.125,.4,.125]}
      position={[0, -0.3, 0]} // top of cylinder
    />
  );
}

// ---------------- LAYER 3: OUTER WOODEN BOX (≤ 1 L ONLY) ----------------
function WoodenBox({ visible, model }) {
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
      scale={[0.5, 1.5, .5]}
      position={[0, -0.6, 0]}
    />
  );
}

// ---------------- MAIN VIEWER ----------------
export default function OxygenViewer() {
  // Toggle: cylinder water capacity ≤ 1 L
  const [isSmallCylinder, setIsSmallCylinder] = useState(true);
  const [showCap, setShowCap] = useState(true);

  const cylinderModel = useGLTF("/models/oxigen_cylinder.glb");
  const capModel = useGLTF("/models/plastic_cap.glb");
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
        <Canvas camera={{ position: [3, 2, 5], fov: 50 }}>
          <ambientLight intensity={1.1} />
          <directionalLight position={[5, 5, 5]} intensity={1.4} />
          <Environment preset="warehouse" />
          <OrbitControls enableZoom enableRotate enablePan={false} />

          <Suspense fallback={null}>
            <OxygenCylinder model={cylinderModel} />
            <ValveCap visible={showCap} model={capModel} />
            <WoodenBox
              visible={isSmallCylinder}
              model={woodenBoxModel}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* -------- LEGEND / CONTROLS -------- */}
      <div className="dg-layer-legend">
        <Legend label="Layer 1: Oxygen Cylinder" color="#1976D2" />

        <ToggleLegend
          label="Layer 2: Valve Protection Cap"
          active={showCap}
          onClick={() => setShowCap(!showCap)}
          color="#4CAF50"
        />

        <ToggleLegend
          label="≤ 1 L Cylinder (Outer Box Required)"
          active={isSmallCylinder}
          onClick={() => setIsSmallCylinder(!isSmallCylinder)}
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
