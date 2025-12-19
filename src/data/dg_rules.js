export const DG_RULES = {
  // ---------------------------------------------------------
  // 1. LITHIUM BATTERIES
  // ---------------------------------------------------------
  lithium_powerbank: {
    match: ["lithium","powerbank", "un3481", "un3171"],




    title: "Lithium Batteries Packed with Equipment (UN3481/UN3171)",
    packing_instruction: "PI 966 / PI 952",




    clarification: `
• Batteries must be isolated to prevent short circuit.
• Use insulated padding or non-conductive material around the battery.
• Secure equipment using foam brackets or molded cradle.
• Inner fibreboard box must show the lithium handling label.
• Outer box must be reinforced; Cargo Aircraft Only may apply.
    `,




    layers: [
      "Inner layer: Battery isolated using insulated padding",
      "Immobilization: Molded foam cradle holding device/battery",
      "Inner box: Strong fibreboard with lithium markings (UN3481)",
      "Outer box: Reinforced corrugated box (Cargo Aircraft Only if required)",
      "Required labels: Class 9, Cargo Aircraft Only, UN3481, Lithium handling label"
    ]
  },




  // ---------------------------------------------------------
  // 2. FLAMMABLE LIQUIDS (Petroleum, Ethanol, Paint, Thinner)
  // ---------------------------------------------------------
  flammable_liquid: {
    match: ["flammable", "petroleum", "ethanol", "paint", "thinner", "un1170", "un1993"],




    title: "Flammable Liquids – Packing Group II (UN1170/UN1993 etc.)",
    packing_instruction: "PI 364",




    clarification: `
• Must meet General Packing Requirements of 5.0.2.
• Use compatible inner packaging (glass, metal or plastic).
• Absorbent/cushioning must be added to prevent leakage.
• Total quantity per package must not exceed 60 L.
• Cargo Aircraft Only transport normally applies.
    `,




    layers: [
      "Inner Container: Glass (≤2.5 L), metal (≤10 L), or plastic (≤5 L)",
      "Absorbent Layer: Material around inner packaging to contain leaks",
      "Leakproof Receptacle: Rigid container preventing movement",
      "Outer Packaging: UN-certified drum/jerrican/box (PG II standard)",
      "Required labels: Class 3 – Flammable Liquid, Cargo Aircraft Only"
    ]
  },




  // ---------------------------------------------------------
// BATTERY-POWERED EQUIPMENT
// ---------------------------------------------------------
// ---------------------------------------------------------
// BATTERY-POWERED EQUIPMENT
// ---------------------------------------------------------
      battery_powered_equipment: {
        match: [
          "battery-powered",
          "battery powered",
          "equipment",
          "powerbank",
          "drilling",
          "device",
          "un3481",
          "un3171"
        ],


        title: "Battery-Powered Equipment (UN3481 / UN3171)",
        packing_instruction: "PI 966 / PI 952",


        clarification: `
      • Battery must be installed in the equipment or securely packed with it.
      • Battery terminals must be protected to prevent short circuit.
      • Non-conductive cushioning or insulated padding must surround the battery.
      • Equipment must be immobilized using foam brackets or a molded foam cradle.
      • Inner packaging must be strong and capable of preventing movement.
      • Outer packaging must be rigid and reinforced.
      • Cargo Aircraft Only restrictions may apply depending on battery type and quantity.
        `,


        layers: [
          "Inner layer: Battery installed in equipment and isolated using insulated padding",
          "Immobilization: Molded foam cradle or foam brackets securing the equipment",
          "Inner box: Strong fibreboard box with lithium battery handling marking",
          "Outer box: Reinforced corrugated box (Cargo Aircraft Only if applicable)",
          "Required labels: Class 9 label, Lithium battery handling label, UN3481/UN3171, Cargo Aircraft Only (if required)"
        ]
      },




  // ---------------------------------------------------------
  // 3. LIGHTERS / LIGHTER REFILLS
  // ---------------------------------------------------------
  lighters: {
    match: ["lighter", "lighters", "butane", "refill", "un1057"],




    title: "Lighters or Lighter Refills (UN1057)",
    packing_instruction: "PI 201",




    clarification: `
• Must comply with General Packing Requirements of 5.0.2.
• Lighters must be tightly packed to prevent activation.
• Must contain ≤10 g LPG per lighter or ≤65 g LPG per refill.
• Total LPG content per package ≤15 kg for cargo aircraft.
• Ignition & valve mechanisms must be protected against accidental discharge.
    `,




    layers: [
      "Device Securing: Prevent accidental ignition or valve activation",
      "Leakage Protection: Shield or tape ignition/valve system",
      "Inner Arrangement: Prevent movement inside the box",
      "Outer Packaging: UN-approved wood, fibreboard, plastic or plywood box",
    ]
  },




  // ---------------------------------------------------------
  // 4. CORROSIVE LIQUIDS (Paint remover, sulphuric acid, corrosive chemicals)
  // ---------------------------------------------------------
  corrosive_liquid: {
    match: ["corrosive", "acid", "sulphuric", "un2796"],




    title: "Corrosive Liquids (PG II/III such as Sulphuric Acid)",
    packing_instruction: "PI 855 / PI 856",




    clarification: `
• Must meet general requirements of 5.0.2 including compatibility with packaging.
• Use corrosion-resistant inner containers (glass, metal, plastic).
• Provide cushioning to prevent breakage and leakage.
• Total net quantity typically limited to ≤30–60 L depending on substance.
• Apply Class 8 + Cargo Aircraft Only labels.
    `,




    layers: [
      "Inner Packaging: Corrosion-resistant containers (≤2.5–5 L each)",
      "Closure Protection: Leak-proof closures preventing spillage",
      "Cushioning: Absorbent padding resisting corrosive exposure",
      "Outer Packaging: Certified drum/jerrican/box per PG II standard",
      "Required labels: Class 8 – Corrosive, Cargo Aircraft Only"
    ]
  },




  // ---------------------------------------------------------
  // 5. OXYGEN, COMPRESSED (UN1072)
  // ---------------------------------------------------------
  oxygen_compressed: {
    match: ["oxygen", "compressed", "un1072"],




    title: "Oxygen, Compressed (UN1072)",
    packing_instruction: "PI 200",




    clarification: `
• Cylinders must comply with ISO standards (e.g., ISO 9809/11120).
• Valves must be protected; cylinder must be secured against movement.
• Pressure relief devices must meet regulatory requirements.
• Outer packaging required only for cylinders ≤1 L.
• Apply Class 2.2 + oxidizer (5.1) + Cargo Aircraft Only labels.
    `,




    layers: [
      "Cylinder: High-pressure approved metal cylinder",
      "Valve Protection: Cap/guard fitted to prevent damage",
      "Securing Mechanism: Prevent cylinder movement during transport",
      "Outer Packaging: Only required for cylinders ≤1 L",
    ]
  },




  // ---------------------------------------------------------
  // 6. SULPHURIC ACID (UN2796) – more specific corrosive case
  // ---------------------------------------------------------
  sulphuric_acid: {
    match: ["sulphuric acid", "un2796"],




    title: "Sulphuric Acid (UN2796 – Class 8)",
    packing_instruction: "PI 855",




    clarification: `
• Must meet general requirements of 5.0.2.
• Inner packagings (glass/metal/plastic) max 2.5 L each.
• Metal containers must be corrosion-resistant or protected.
• Both single and combination packaging permitted.
• Apply Class 8 + Cargo Aircraft Only label.
    `,




    layers: [
      "Inner Packaging: Glass/metal/plastic (≤2.5 L each)",
      "Cushioning: Adequate shock & chemical-resistant protection",
      "Outer Packaging: UN-approved drums, jerricans, or boxes",
      "Marking & Labeling: Class 8 Corrosive + Cargo Aircraft Only",
    ]
  },




  // ---------------------------------------------------------
  // 7. BIOLOGICAL SUBSTANCE, CATEGORY B (UN3373)
  // ---------------------------------------------------------
  biological_substance: {
    match: ["biological", "infectious", "un3373"],




    title: "Biological Substance, Category B (UN3373)",
    packing_instruction: "PI 650",




    clarification: `
• Requires triple packaging system.
• Primary receptacle must be leakproof (≤1 L per container).
• Absorbent must surround primary container.
• Secondary packaging must be leakproof and protective.
• Rigid outer packaging must withstand 1.2 m drop test.
    `,




    layers: [
      "Primary Receptacle: Leakproof; individually wrapped if multiple",
      "Secondary Packaging: Leakproof with absorbent between layers",
      "Outer Packaging: Rigid, impact-resistant, must pass 1.2 m drop test",
      "Required Markings: UN3373 diamond + shipper/consignee info"
    ]
  }
};
