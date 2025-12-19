import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";

export default function DashboardLayout({ navLinks = [], title }) {

  useEffect(() => {
    // prevent duplicate script injection
    if (!document.getElementById("chtl-script")) {
      const config = document.createElement("script");
      config.innerHTML = `window.chtlConfig = { chatbotId: "1245693387" }`;
      document.body.appendChild(config);

      const script = document.createElement("script");
      script.id = "chtl-script";
      script.src = "https://chatling.ai/js/embed.js";
      script.async = true;
      script.setAttribute("data-id", "1245693387");
      document.body.appendChild(script);
    }
  }, []);

  return (
    // Exact viewport height so sidebar and content align
    <div className="flex h-screen bg-slate-50">
      <Sidebar links={navLinks} title={title} />

      {/* Make content scroll independently */}
      <main className="flex-1 overflow-y-auto bg-white shadow-inner">
        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

