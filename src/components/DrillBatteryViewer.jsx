import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";

// ---------------- LAYER 1: DRILL MACHINE ----------------
function Drill({ model }) {
  return (
    <primitive
      object={model.scene.clone()}
      scale={1.1}
      position={[0, -0.7, 0]}
    />
  );
}

// ---------------- LAYER 2: CAPS (BIT + BATTERY) ----------------
function ProtectionCapsLayer({ visible, model }) {
  if (!visible) return null;

  const cap1 = model.scene.clone(); // drill-bit cap
  const cap2 = model.scene.clone(); // battery terminal cap

  return (
    <>
      {/* Drill Bit Cap */}
      <primitive
        object={cap1}
        scale={[0.4,0.6,.5]}
        position={[-2.1, -1, 0.2]}
        rotation={[0, 0, Math.PI ]} // 90° in radians

      />

      {/* Battery Terminal Cap */}
      <primitive
        object={cap2}
        scale={[.05,1.2,.05]}
        position={[-2.1, 0.45, -1]}
        rotation={[Math.PI/2, 0, Math.PI]}
      />
    </>
  );
}

// ---------------- LAYER 3: STYROFOAM IMMOBILIZATION ----------------
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
      scale={[5, 24, 18]}
      position={[-2, -2.6, -1]}
    />
  );
}

// ---------------- LAYER 4: OUTER CARDBOARD BOX ----------------
function CardboardBoxLayer({ visible, model }) {
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
      scale={[9, 12,5]}
      position={[-2, -0.8, -1]}
      rotation={[0, Math.PI / 2, 0]}
    />
  );
}

// ---------------- MAIN VIEWER ----------------
export default function DrillBatteryViewer() {
  const [showCaps, setShowCaps] = useState(true);
  const [showFoam, setShowFoam] = useState(true);
  const [showBox, setShowBox] = useState(true);

  const drillModel = useGLTF("/models/portable_drill_machine.glb");
  const capModel = useGLTF("/models/plastic_cap.glb");
  const foamModel = useGLTF("/models/styrofoam_box_close.glb");
  const boxModel = useGLTF("/models/cardboard_box.glb");

  return (
    <div style={{ display: "flex", gap: "30px" }}>
      {/* -------- VIEWER -------- */}
      <div
        style={{
          width: "520px",
          height: "340px",
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
            <Drill model={drillModel} />
            <ProtectionCapsLayer visible={showCaps} model={capModel} />
            <StyrofoamLayer visible={showFoam} model={foamModel} />
            <CardboardBoxLayer visible={showBox} model={boxModel} />
          </Suspense>
        </Canvas>
      </div>

      {/* -------- LEGEND PANEL -------- */}
     
      <div className="dg-layer-legend">

        <Legend label="Layer 1: Battery-powered Drill" color="#D32F2F" />

        <ToggleLegend
          label="Layer 2: Bit Cap + Battery Insulation"
          active={showCaps}
          onClick={() => setShowCaps(!showCaps)}
          color="#4CAF50"
        />

        <ToggleLegend
          label="Layer 3: Styrofoam Immobilization"
          active={showFoam}
          onClick={() => setShowFoam(!showFoam)}
          color="#1976D2"
        />

        <ToggleLegend
          label="Layer 4: Outer Cardboard Box (UN 3481)"
          active={showBox}
          onClick={() => setShowBox(!showBox)}
          color="#FF9800"
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
