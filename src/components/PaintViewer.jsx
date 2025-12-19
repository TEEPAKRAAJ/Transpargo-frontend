import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";

// ---------------- LAYER 1: PAINT BUCKET ----------------
function PaintBucket({ model }) {
  return (
    <primitive
      object={model.scene.clone()}
      scale={1.2}
      position={[0, -0.3, 0]}
    />
  );
}

// ---------------- LAYER 2: ABSORBENT CYLINDER ----------------
function AbsorbentLayer({ visible, model }) {
  if (!visible) return null;

  const absorbent = model.scene.clone();
  absorbent.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = 0.6;
    }
  });

  return (
    <primitive
      object={absorbent}
      scale={[0.65, 0.7, 0.6]}
      position={[0, -0.8, 0]}
    />
  );
}

// ---------------- LAYER 3: PLASTIC STORAGE CONTAINER ----------------
function PlasticContainerLayer({ visible, model }) {
  if (!visible) return null;

  const container = model.scene.clone();
  container.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = 0.35;
    }
  });

  return (
    <primitive
      object={container}
      scale={[3.5, 5.2, 2.5]}
      position={[0, -1.6, 0]}
    />
  );
}

// ---------------- LAYER 4: CARDBOARD BOX ----------------
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
      scale={[3.5, 5.2, 2.8]}
      position={[0, -0.65, 0]}
      rotation={[0, Math.PI / 2, 0]} 
    />
  );
}

// ---------------- MAIN PAINT VIEWER ----------------
export default function PaintViewer() {
  const [showLayer2, setShowLayer2] = useState(true);
  const [showLayer3, setShowLayer3] = useState(true);
  const [showLayer4, setShowLayer4] = useState(true);

  const paintBucketModel = useGLTF("/models/paint_bucket.glb");
  const absorbentModel = useGLTF(
    "/models/cylinder_transparent_artistic_reference.glb"
  );
  const plasticContainerModel = useGLTF(
    "/models/plastic_storage_container.glb"
  );
  const cardboardModel = useGLTF("/models/cardboard_box.glb");

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "30px",
        width: "100%",
      }}
    >
      {/* -------- VIEWER BOX -------- */}
      <div
        style={{
          width: "500px",
          height: "300px",
          border: "3px solid #e0e0e0",
          borderRadius: "10px",
          padding: "10px",
          background: "white",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        }}
      >
        <Canvas camera={{ position: [3, 2, 4], fov: 50 }}>
          <ambientLight intensity={1.1} />
          <directionalLight position={[5, 5, 5]} intensity={1.3} />
          <Environment preset="warehouse" />
          <OrbitControls enableZoom enableRotate enablePan={false} />

          <Suspense fallback={null}>
            <PaintBucket model={paintBucketModel} />
            <AbsorbentLayer visible={showLayer2} model={absorbentModel} />
            <PlasticContainerLayer
              visible={showLayer3}
              model={plasticContainerModel}
            />
            <CardboardBoxLayer
              visible={showLayer4}
              model={cardboardModel}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* -------- LEGEND PANEL -------- */}
      <div className="dg-layer-legend">
        <Legend label="Layer 1: Paint Bucket" color="#D32F2F" />

        <ToggleLegend
          label="Layer 2: Absorbent Cushion"
          active={showLayer2}
          onClick={() => setShowLayer2(!showLayer2)}
          color="#4CAF50"
        />

        <ToggleLegend
          label="Layer 3: Plastic Leakproof Container"
          active={showLayer3}
          onClick={() => setShowLayer3(!showLayer3)}
          color="#1976D2"
        />

        <ToggleLegend
          label="Layer 4: Cardboard Box"
          active={showLayer4}
          onClick={() => setShowLayer4(!showLayer4)}
          color="#FF9800"
        />
      </div>
    </div>
  );
}

// ---------------- LEGEND COMPONENTS ----------------
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
