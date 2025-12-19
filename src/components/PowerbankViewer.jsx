// src/components/PowerbankViewer.jsx
import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";

// ---------------- POWERBANK MODEL ----------------
function PowerBank({ model }) {
  return (
    <primitive
      object={model.scene.clone()}
      scale={7}
      position={[-2, -0.2, 0]}
      rotation={[0, Math.PI / 2, 0]}
    />
  );
}

// ---------------- STYROFOAM LAYER (Layer 2) ----------------
function StyrofoamLayer({ visible, model }) {
  if (!visible) return null;

  const foam = model.scene.clone();
  foam.traverse((child) => {
    if (child.isMesh) {
      child.material = child.material.clone();
      child.material.transparent = true;
      child.material.opacity = 0.9;
      
    }
  });

  return (
    <primitive
      object={foam}
      scale={1.6}
      position={[0.2, -0.2, -0.05]}
      rotation={[0, 0, Math.PI / 2]} // rotate 90 degrees around Y-axis
    />
  );
}

// ---------------- CARDBOARD BOX (Layer 3) ----------------
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

  return <primitive object={box} scale={[.6,2,1]} position={[0, -0.2, 0]} />;
}

// ---------------- MAIN VIEWER ----------------
export default function PowerbankViewer() {
  const [showLayer2, setShowLayer2] = useState(true);
  const [showLayer3, setShowLayer3] = useState(true);

  const powerBankModel = useGLTF("/models/xiaomi_10000mah_power_bank_3.glb");
  const styrofoamModel = useGLTF("/models/styrofoam_box_close.glb");
  const cardboardModel = useGLTF("/models/cardboard_box.glb");

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "30px",
        width: "100%",
      }}
    >
      {/* -------- Outer Rectangle Container -------- */}
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
            <PowerBank model={powerBankModel} />
            <StyrofoamLayer visible={showLayer2} model={styrofoamModel} />
            <CardboardBoxLayer visible={showLayer3} model={cardboardModel} />
          </Suspense>
        </Canvas>
      </div>

      {/* -------- LEGEND PANEL OUTSIDE -------- */}
      <div className="dg-layer-legend" >
        {/* Power Bank Legend */}
        <div 
          style={{
            background: "#FF4D4D",
            padding: "14px",
            color: "white",
            borderRadius: "10px",
            fontWeight: "600",
            border: "3px solid #A30000",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          Layer 1: Power Bank
        </div>

        {/* Styrofoam Toggle Legend */}
        <div
          onClick={() => setShowLayer2(!showLayer2)}
          style={{
            cursor: "pointer",
            background: showLayer2 ? "#4CAF50" : "#9e9e9e",
            padding: "14px",
            borderRadius: "10px",
            color: "white",
            fontWeight: "600",
            border: "3px solid #0B6623",
            transition: "0.3s",
            textAlign: "center",
          }}
        >
          Layer 2: Styrofoam
        
        </div>

        {/* Cardboard Box Toggle Legend */}
        <div
          onClick={() => setShowLayer3(!showLayer3)}
          style={{
            cursor: "pointer",
            background: showLayer3 ? "#FFB74D" : "#9e9e9e",
            padding: "14px",
            borderRadius: "10px",
            color: "white",
            fontWeight: "600",
            border: "3px solid #FF8F00",
            transition: "0.3s",
            textAlign: "center",
          }}
        >
          Layer 3: Cardboard Box
          
        </div>
      </div>
    </div>
  );
}
