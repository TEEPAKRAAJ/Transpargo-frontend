import { NavLink, useLocation, useNavigate } from "react-router-dom";

export default function Sidebar({ links = [], title = "Transpargo" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role") ?? "guest";
  const name = localStorage.getItem("name");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("ID");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    navigate("/login", { replace: true });
  };

  const profileRouteMap = {
    admin: "/admin/profile",
    user: "user/profile",
    Shipping_agency: "/Shipping_agency/profile",
  };
  
  const profilePath = profileRouteMap[role];
  


  return (
    <aside className="w-64 shrink-0 bg-gradient-to-t 
      from-cloudyBlue 
      via-lightBlue 
      to-deepBlue text-white flex flex-col justify-between p-6 shadow-2xl">
      <div>
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
            {title}
          </p>
          <h1 className="text-2xl font-semibold text-white">Transpargo</h1>
        </div>

        <div onClick={() => profilePath && navigate(profilePath)} className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-300">Signed in as</p>
          <p className="text-lg font-semibold text-white truncate">
            {name || "Guest User"}
          </p>
          <span className="mt-2 inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            {role}
          </span>
        </div>

        <nav className="space-y-2">
          {links.length === 0 && (
            <p className="text-sm text-slate-400">
              No navigation available for this role.
            </p>
          )}

          {links.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-[#101828]"
                    : "text-slate-200 hover:bg-white/10"
                }`}
              >
                {item.icon && <span className="text-lg">{item.icon}</span>}
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <button
        onClick={logout}
        className="rounded-xl bg-rose-500 py-3 font-semibold text-white transition hover:bg-rose-600"
      >
        Logout
      </button>
    </aside>
  );
}
