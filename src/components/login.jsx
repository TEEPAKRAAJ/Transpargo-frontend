import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { loginUser } from "../api/authApi";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  // Email regex
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Validate inputs
  useEffect(() => {
    const newErrors = {};

    if (!form.email) newErrors.email = "Email is required";
    else if (!validateEmail(form.email)) newErrors.email = "Enter a valid email";

    if (!form.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    setIsButtonEnabled(Object.keys(newErrors).length === 0);
  }, [form]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --------------------------
  // REAL JWT LOGIN LOGIC
  // --------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (!isButtonEnabled) return;
  
    try {
      const res = await loginUser({
        email: form.email,
        password: form.password,
      });
  
      console.log("REAL TOKEN:", res.data.token);
  
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("ID", res.data.id);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      localStorage.setItem("email", form.email);
  
      // ⭐ REDIRECT BASED ON ROLE
      if (res.data.role === "admin") {
        window.location.href = "/admin";
      } 
      else if (res.data.role === "Shipping_agency") {
        window.location.href = "/Shipping_agency";
      } 
      else {
        // ⭐ USER → redirect to /user/<ID>
        window.location.href = `/user`;
      }
    } catch (err) {
      console.error(err);
      alert("Invalid email or password!");
    }
  };
  

  return (
    <div
      className="
      min-h-screen
      flex items-center justify-center px-4
      bg-gradient-to-br
      from-[#EDE8F5]
      via-[#ADBBDA]
      to-[#7091E6]
    "
    >
      <div
        className="
        bg-white/60
        backdrop-blur-xl
        shadow-xl
        rounded-2xl
        p-8
        max-w-md
        w-full
        border border-white/30
      "
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <LockClosedIcon
            className="
              h-12 w-12
              text-[#3D52A0]
              drop-shadow-[0_4px_10px_rgba(61,82,160,0.4)]
            "
          />
          <h2 className="text-2xl font-bold text-gray-800 mt-2">Welcome Back</h2>
          <p className="text-sm text-gray-500">Login to continue</p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          

          <button type="button" className="text-sm text-blue-600 hover:underline" onClick={()=>{ navigate("/forgotpassword")}}>

            Forgot Password?
          </button>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={!isButtonEnabled}
            className={`
              w-full py-2 rounded-lg text-white font-medium transition
              ${
                isButtonEnabled
                  ? "bg-[#3D52A0] hover:bg-[#2c3a78]"
                  : "bg-gray-400 cursor-not-allowed"
              }
            `}
          >
            Login
          </button>
        </form>

        {/* OR separator */}
        <div className="flex items-center mt-5">
          <span className="flex-1 border-t border-gray-300"></span>
          <span className="px-3 text-gray-500 text-sm">OR</span>
          <span className="flex-1 border-t border-gray-300"></span>
        </div>

        <button
          onClick={() => (window.location.href = "/signup")}
          className="
          mt-5 w-full py-2 border border-[#3D52A0]
          text-[#3D52A0] hover:bg-[#EDE8F5]
          rounded-lg font-medium transition
        "
        >
          Create an Account
        </button>
      </div>
    </div>
  );
}
