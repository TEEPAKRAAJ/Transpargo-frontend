import React, { useState } from "react";
import PowerbankViewer from "../components/PowerbankViewer";
import BloodSampleViewer from "../components/BloodSampleViewer";
import DrillBottleViewer from "../components/DrillBatteryViewer";
import EthanolBottleViewer from "../components/EthanolBottleViewer";
import FlammableLiquidViewer from "../components/FlammableLiquidViewer";
import LighterViewer from "../components/LighterViewer";
import OxygenViewer from "../components/OxygenViewer";
import PaintViewer from "../components/PaintViewer";
import PetroleumDrumViewer from "../components/PetroleumDrumViewer";
import SulphuricAcidViewer from "../components/SulphuricAcidViewer";
import jsPDF from "jspdf";
import "../styles.css";


import { DG_PRODUCTS } from "../data/dg_products";
import { DG_RULES } from "../data/dg_rules";


/* ------------------------------------------------------------------ */
/* RULE LOOKUP                                                         */
/* ------------------------------------------------------------------ */
function getDGRule(product) {
  const desc = product.description.toLowerCase();
  for (const key in DG_RULES) {
    const rule = DG_RULES[key];
    if (rule.match.some((m) => desc.includes(m))) {
      return rule;
    }
  }
  return null;
}


/* ------------------------------------------------------------------ */
/* HAZARD LABELS                                                       */
/* ------------------------------------------------------------------ */
const HAZARD_LABEL_MAP = [
  { keywords: ["lithium", "battery", "ion", "power bank"], image: "lithium_warning.png" },
  { keywords: ["flammable", "petroleum", "petrol", "ethanol"], image: "flammable_liquid.png" },
  { keywords: ["oxygen"], image: "non_flammable.png" },
  { keywords: ["paint", "sulphuric", "acid"], image: "corrosive.png" },
  { keywords: ["lighter", "butane", "gas"], image: "flammable_gas.png" },
  { keywords: ["biological", "blood", "un3373"], image: "infectious_substance.png" },
];


const GENERIC_LABEL = "generic_dg.png";


function getHazardLabel(product) {
  const desc = product.description.toLowerCase();
  for (const entry of HAZARD_LABEL_MAP) {
    if (entry.keywords.some((k) => desc.includes(k))) {
      return `/labels/${entry.image}`;
    }
  }
  return `/labels/${GENERIC_LABEL}`;
}


/* ------------------------------------------------------------------ */
/* HANDLING LABELS                                                     */
/* ------------------------------------------------------------------ */
const HANDLING_LABEL_MAP = [
  {
    keywords: ["lithium", "battery", "ion"],
    images: ["lithium_handling.png", "cargo_only.png"],
  },
  {
    keywords: ["flammable", "ethanol", "petroleum"],
    images: ["keep_away_from_heat.png", "orientation_up.png", "cargo_only.png"],
  },
  {
    keywords: ["paint"],
    images: ["cargo_only.png"],
  },
  {
    keywords: ["sulphuric"],
    images: ["keep_away_from_heat.png", "orientation_up.png"],
  },
];


function getHandlingLabels(product) {
  const desc = product.description.toLowerCase();
  let matches = [];
  HANDLING_LABEL_MAP.forEach((entry) => {
    if (entry.keywords.some((k) => desc.includes(k))) {
      matches.push(...entry.images.map((img) => `/labels/${img}`));
    }
  });
  return [...new Set(matches)];
}


/* ------------------------------------------------------------------ */
/* VIEWER MAP                                                          */
/* ------------------------------------------------------------------ */
const VIEWER_MAP = [
  { keywords: ["powerbank", "lithium"], Component: PowerbankViewer },
  { keywords: ["blood", "biological"], Component: BloodSampleViewer },
  { keywords: ["drill"], Component: DrillBottleViewer },
  { keywords: ["ethanol", "sanitizer"], Component: EthanolBottleViewer },
  { keywords: ["flammable liquid"], Component: FlammableLiquidViewer },
  { keywords: ["lighter"], Component: LighterViewer },
  { keywords: ["oxygen"], Component: OxygenViewer },
  { keywords: ["paint"], Component: PaintViewer },
  { keywords: ["petroleum"], Component: PetroleumDrumViewer },
  { keywords: ["sulphuric"], Component: SulphuricAcidViewer },
];


function getViewerComponent(product) {
  const desc = product.description.toLowerCase();
  for (const entry of VIEWER_MAP) {
    if (entry.keywords.some((k) => desc.includes(k))) {
      return entry.Component;
    }
  }
  return null;
}


/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                      */
/* ------------------------------------------------------------------ */
export default function DangerousGoodsVisualizer() {
  const [selectedProduct, setSelectedProduct] = useState(DG_PRODUCTS[0]);


  const rule = getDGRule(selectedProduct);
  const Viewer = getViewerComponent(selectedProduct);
  const handlingLabels = getHandlingLabels(selectedProduct);
  const hasHandlingLabels = handlingLabels.length > 0;




  /* ---------------- PDF: Hazard ---------------- */
  const handleGenerateHazardLabel = () => {
    const imgPath = getHazardLabel(selectedProduct);
    const doc = new jsPDF();
    const img = new Image();
    img.src = imgPath;


    img.onload = () => {
      const maxW = 80;
      const maxH = 80;


      const ratio = img.width / img.height;


      let w = maxW;
      let h = maxW / ratio;


      if (h > maxH) {
        h = maxH;
        w = maxH * ratio;
      }


      const y = 20; // ✅ FIX: define y


      doc.addImage(img, "PNG", 20, y, w, h);
      doc.text(
      `${selectedProduct.hs_code} — ${selectedProduct.description}`,
      20,
      y + h + 20
    );


      doc.save("Hazard_Label.pdf");
    };
  };




  /* ---------------- PDF: Handling ---------------- */
  const handleGenerateHandlingLabel = () => {
    const labels = getHandlingLabels(selectedProduct);


    const doc = new jsPDF();
    let y = 20;


    labels.forEach((path, i) => {
      const img = new Image();
      img.src = path;
      img.onload = () => {
        const maxW = 80;
        const maxH = 80;


        const ratio = img.width / img.height;


        let w = maxW;
        let h = maxW / ratio;


        if (h > maxH) {
          h = maxH;
          w = maxH * ratio;
        }


        doc.addImage(img, "PNG", 20, y, w, h);
        y += 80;
        if (i === labels.length - 1) {
          doc.save("Handling_Labels.pdf");
        }
      };
    });
  };




  return (
    <div className="dg-page">
      <div className="dg-page-inner">
        <header className="dg-header">
          <h1>Dangerous Goods Visualizer</h1>
        </header>


        {/* -------- SELECT -------- */}
        <section className="dg-card dg-form-section">
          <select
            value={selectedProduct.id}
            onChange={(e) =>
              setSelectedProduct(
                DG_PRODUCTS.find((p) => p.id === Number(e.target.value))
              )
            }
            style={{
              width: "100%",
              height: "56px",              
              padding: "0 16px",          
              fontSize: "17px",
              lineHeight: "56px",          
              borderRadius: "12px",
              border: "2px solid #000",
              backgroundColor: "#fff",
              boxSizing: "border-box",
            }}
          >
            {DG_PRODUCTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.hs_code} — {p.description}
              </option>
            ))}
          </select>
        </section>


        {/* -------- 3D -------- */}
        <section className="dg-card dg-3d-section">
          <h2>Packing Visualizer</h2>
          {Viewer && <Viewer product={selectedProduct} />}
        </section>


        {/* -------- RULES -------- */}
        {rule && (
          <section className="dg-card">
            <h2>Packing Requirements (IATA)</h2>
            <p><strong>{rule.title}</strong></p>
            <p><strong>Packing Instruction:</strong> {rule.packing_instruction}</p>
            <p style={{ whiteSpace: "pre-line" }}>{rule.clarification}</p>
            <ul>
              {rule.layers.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </section>
        )}


        {/* -------- BUTTONS -------- */}
        <section className="dg-card" style={{ textAlign: "center" }}>
        <h2>Generate Labels</h2>
        <div
          style={{
            display: "flex",
            justifyContent: "center",   // ✅ always center
            gap: hasHandlingLabels ? "24px" : "0px",
            marginTop: "20px",
          }}
        >
          {/* Hazard Button */}
          <button
            onClick={handleGenerateHazardLabel}
            style={{
              padding: "14px 26px",
              minWidth: "240px",
              fontSize: "16px",
              borderRadius: "10px",
              fontWeight: "600",
              background: "#b71c1c",   // dim red
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Download Hazard Label
          </button>


          {/* Handling Button (only if exists) */}
          {hasHandlingLabels && (
            <button
              onClick={handleGenerateHandlingLabel}
              style={{
                padding: "14px 26px",
                minWidth: "240px",
                fontSize: "16px",
                borderRadius: "10px",
                fontWeight: "600",
                background: "#1e3a8a", // blue
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              Download Handling Labels
            </button>
          )}
        </div>




        </section>
      </div>
    </div>
  );
}
