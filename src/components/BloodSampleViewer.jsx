import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";

// ---------------- LAYER 1: BLOOD BOTTLE ----------------
function BloodBottle({ model }) {
  return (
    <primitive
      object={model.scene.clone()}
      scale={10}
      rotation={[270,0,270]}
      position={[0, -0.6, 0]}
    />
  );
}

// ---------------- LAYER 2: ABSORBENT COTTON ----------------
function AbsorbentLayer({ visible, model }) {
  if (!visible) return null;

  const cotton = model.scene.clone();
  cotton.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = 0.4;
    }
  });

  return (
    <primitive
      object={cotton}
      scale={[10, 13, 10.3]}
      position={[-0.065, -0.6, 0.45]}
    />
  );
}

// ---------------- LAYER 3: SECONDARY CONTAINER ----------------
function SecondaryContainerLayer({ visible, model }) {
  if (!visible) return null;

  const container = model.scene.clone();
  container.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = 0.5;
    }
  });

  return (
    <primitive
      object={container}
      scale={[1, 1.4, .65]}
      position={[-0.06, -0.65, -0.03]}
    />
  );
}

// ---------------- LAYER 4: BIOHAZARD BOX ----------------
function BiohazardBoxLayer({ visible, model }) {
  if (!visible) return null;

  const box = model.scene.clone();
  box.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = 0.5;
    }
  });

  return (
    <primitive
      object={box}
      scale={[1.5, 1.65, 1.85]}
      position={[0, -0.7, 0]}
      rotation={[0, Math.PI / 2, 0]}
    />
  );
}

// ---------------- MAIN VIEWER ----------------
export default function BloodSampleViewer() {
  const [showAbsorbent, setShowAbsorbent] = useState(true);
  const [showSecondary, setShowSecondary] = useState(true);
  const [showOuter, setShowOuter] = useState(true);

  const bottleModel = useGLTF("/models/blood_bottle.glb");
  const cottonModel = useGLTF("/models/cotton_ball.glb");
  const secondaryModel = useGLTF("/models/plastic_storage_container.glb");
  const outerBoxModel = useGLTF("/models/v2_laboratory_biohazard_box.glb");

  return (
    <div style={{ display: "flex", gap: "30px" }}>
      {/* -------- VIEWER -------- */}
      <div
        style={{
          width: "500px",
          height: "320px",
          border: "3px solid #e0e0e0",
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
            <BloodBottle model={bottleModel} />
            <AbsorbentLayer visible={showAbsorbent} model={cottonModel} />
            <SecondaryContainerLayer
              visible={showSecondary}
              model={secondaryModel}
            />
            <BiohazardBoxLayer
              visible={showOuter}
              model={outerBoxModel}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* -------- LEGEND -------- */}
      
        <div className="dg-layer-legend">

        <Legend label="Layer 1: Blood Sample Bottle" color="#C62828" />

        <ToggleLegend
          label="Layer 2: Absorbent Material"
          active={showAbsorbent}
          onClick={() => setShowAbsorbent(!showAbsorbent)}
          color="#6D4C41"
        />

        <ToggleLegend
          label="Layer 3: Leakproof Secondary Container"
          active={showSecondary}
          onClick={() => setShowSecondary(!showSecondary)}
          color="#1976D2"
        />

        <ToggleLegend
          label="Layer 4: UN 3373 Biohazard Box"
          active={showOuter}
          onClick={() => setShowOuter(!showOuter)}
          color="#7B1FA2"
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
