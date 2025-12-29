import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMapPin, FiMail, FiPhone } from "react-icons/fi";
import { useState } from "react";


export default function ContactUs() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);


  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);


    const form = e.target;


    const payload = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
    };


    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });


      if (!res.ok) throw new Error("Failed");


      alert("Message sent successfully!");
      form.reset();
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6 py-28"
      style={{
        background:
          "linear-gradient(180deg, #FFFFFF 0%, #EDE8F5 25%, #ADBBD4 55%, #8697C4 75%, #7091E6 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="
          relative max-w-5xl w-full
          bg-white/90 backdrop-blur
          rounded-3xl shadow-2xl
          grid grid-cols-1 md:grid-cols-2
          overflow-hidden
        "
      >
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center gap-2
                     text-[#3D52A0] font-semibold hover:text-[#7091E6]"
        >
          <FiArrowLeft size={18} />
          Back
        </button>


        {/* LEFT INFO */}
        <div className="p-10 md:p-14 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#3D52A0] mb-6">
            Contact Us
          </h1>


          <p className="text-[#3D52A0]/80 text-lg leading-relaxed mb-8">
            Have a question about customs compliance, documentation, or shipment
            risks? Reach out — we’ll help you move forward with clarity.
          </p>


          <div className="space-y-5 text-[#3D52A0] font-medium">
            <div className="flex items-center gap-3">
              <FiMapPin size={18} />
              <span>Chennai, India</span>
            </div>
            <div className="flex items-center gap-3">
              <FiMail size={18} />
              <span>shippingagencyspartan@gmail.com</span>
            </div>
            <div className="flex items-center gap-3">
              <FiPhone size={18} />
              <span>+91 8610704325</span>
            </div>
          </div>
        </div>


        {/* RIGHT FORM */}
        <div className="p-10 md:p-14 bg-white">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <input name="name" required placeholder="Full Name"
              className="w-full px-4 py-3 rounded-lg border border-[#ADBBD4]" />


            <input name="email" type="email" required placeholder="Email"
              className="w-full px-4 py-3 rounded-lg border border-[#ADBBD4]" />


            <textarea name="message" rows="4" required placeholder="Message"
              className="w-full px-4 py-3 rounded-lg border border-[#ADBBD4] resize-none" />


            <button
              disabled={loading}
              className="
                w-full py-3 rounded-lg
                bg-[#3D52A0] hover:bg-[#2E3A6F]
                text-white font-semibold
                transition shadow-md
                disabled:opacity-60
              "
            >
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
