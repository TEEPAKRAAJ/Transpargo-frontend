import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import heroImage from "../assets/hero-aircargo.png";
import uldBg from "../assets/hero-uld-bg.png";
import logo from "../assets/logo.png";
import dgImg from "../assets/features/dg-packaging.png";
import riskImg from "../assets/features/risk-prediction.png";
import tariffImg from "../assets/features/tariff-estimation.png";
import docImg from "../assets/features/document-identification.png";
import trackImg from "../assets/features/tracking-timeline.png";
import botImg from "../assets/features/ai-chatbot.png";




const featureData = [
  {
    title: "Dangerous Goods Packaging Visualization",
    desc: "3D IATA-style guidance for compliant packaging layers.",
    img: dgImg,
  },
  {
    title: "AI-powered Risk Prediction",
    desc: "Proactive compliance and customs delay prediction.",
    img: riskImg,
  },
  {
    title: "Smart Tariff & Duty Estimation",
    desc: "Estimates based on destination and product category.",
    img: tariffImg,
  },
  {
    title: "Automated Document Identification",
    desc: "Instant requirements for export documents.",
    img: docImg,
  },
  {
    title: "Clear Tracking Timeline",
    desc: "Actionable status updates and explanations.",
    img: trackImg,
  },
  {
    title: "AI Chatbot Assistance",
    desc: "Guidance always available, everywhere.",
    img: botImg,
  },
];


export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const timelineRef = useRef(null);


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  return (
    <div className="w-full min-h-screen bg-[#EDE8F5] overflow-x-hidden">


      {/* ================= NAVBAR ================= */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "backdrop-blur bg-white/70 shadow-md" : "bg-transparent"
        }`}
      >
        <div className="w-full flex items-center justify-between px-10 py-4">


          {/* LOGO (LEFT) */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Transpargo Logo"
              className="h-9 w-auto object-contain"
            />
          </div>


          {/* ACTIONS (RIGHT) */}
          <div className="flex items-center gap-8 font-semibold text-[#2E3A6F]">
            <a href="/login" className="hover:text-[#7091E6] transition">
              Login
            </a>
            <a
              href="/signup"
              className="
                inline-flex items-center justify-center
                h-10 px-6
                rounded-md
                bg-[#3D52A0]
                hover:bg-[#2E3A6F]
                text-white
                shadow-md
                transition
              "
            >
              Sign Up
            </a>
          </div>
        </div>
      </nav>


      {/* ================= HERO ================= */}
      <section className="relative min-h-screen w-full overflow-hidden">
        <img
          src={heroImage}
          alt="Air cargo aircraft"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />


        {/* Hero fade */}
        <div
          className="absolute bottom-0 left-0 w-full h-[160px] pointer-events-none"
          style={{
            background: `
              linear-gradient(
                to bottom,
                rgba(0,0,0,0) 0%,
                rgba(237,232,245,0.3) 45%,
                rgba(237,232,245,0.8) 80%,
                #EDE8F5 100%
              )
            `,
          }}
        />


        <div className="relative z-10 px-12 pt-40 max-w-[760px]">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="font-black tracking-tight"
            style={{
              fontSize: "clamp(3.5rem,10vw,8rem)",
              color: "#2E3A6F",
              lineHeight: 1.05,
            }}
          >
            Transpargo
          </motion.h1>


          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 520 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="h-[7px] my-6 rounded-full bg-gradient-to-r from-[#3D52A0] via-[#7091E6] to-[#ADBBD4]"
          />


          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="text-3xl md:text-4xl font-semibold"
            style={{ color: "#4A5FA0" }}
          >
            Understand Customs. Ship with Confidence.
          </motion.p>
        </div>


        <motion.div
          className="absolute left-12 bottom-[6%] z-10 font-semibold tracking-widest text-[#2E3A6F] text-3xl"
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Scroll to explore ↓
        </motion.div>
      </section>


      {/* ================= FEATURES ================= */}
      <section ref={timelineRef} className="relative py-48 overflow-hidden">
        <img
          src={uldBg}
          alt="ULD cargo background"
          className="
            absolute inset-0 w-full h-full
            object-cover object-center
            [mask-image:linear-gradient(to_bottom,transparent_0%,black_22%,black_100%)]
            [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_22%,black_100%)]
          "
        />


        <div className="absolute left-1/2 top-0 h-full w-[3px] bg-[#8697C4]/60 -translate-x-1/2 z-20" />


        <div className="relative z-30 max-w-6xl mx-auto space-y-36 px-6">
          {featureData.map((f, i) => {
            const isLeft = i % 2 === 0;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-120px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`relative flex ${isLeft ? "justify-start" : "justify-end"}`}
              >
                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 w-6 h-6 bg-[#3D52A0] rounded-full ring-4 ring-white z-30" />


                              <div
                className={`
                  w-[560px]
                  rounded-[32px]
                  bg-white/95
                  shadow-2xl
                  border border-[#ADBBD4]/60
                  p-10
                  flex items-center gap-8
                  ${isLeft ? "mr-auto flex-row" : "ml-auto flex-row-reverse"}
                `}
              >
                {/* IMAGE */}
                <img
                  src={f.img}
                  alt={f.title}
                  className="
                    w-28 h-28
                    object-contain
                    flex-shrink-0
                  "
                />


                {/* TEXT */}
                <div>
                  <h3 className="text-2xl font-extrabold text-[#3D52A0] mb-4">
                    {f.title}
                  </h3>
                  <p className="text-lg text-[#3D52A0]/85 font-medium leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>


              </motion.div>
            );
          })}
        </div>
      </section>


      {/* ================= FOOTER ================= */}
      <footer className="relative py-16 text-center">
        {/* White haze instead of line */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 40%, #FFFFFF 100%)",
          }}
        />


        <div className="relative z-10 text-[#2E3A6F]/70 font-medium">
          © 2025 Transpargo. All rights reserved.
        </div>
      </footer>
    </div>
  );
}


