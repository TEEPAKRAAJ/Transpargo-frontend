import { useState } from "react";
import { signupUser } from "../api/authApi";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    role: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const validate = () => {
    let temp = {};

    if (!form.name.trim()) temp.name = "Full name is required";
    if (!form.email.trim()) temp.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) temp.email = "Invalid email";

    if (!form.mobile.trim()) temp.mobile = "Mobile required";
    else if (!/^[0-9]{10}$/.test(form.mobile)) temp.mobile = "10 digit mobile required";

    if (!form.role.trim()) temp.role = "Select a role";

    if (!form.password.trim()) temp.password = "Password required";
    else if (form.password.length < 8) temp.password = "Minimum 8 characters";

    if (!form.confirmPassword.trim()) temp.confirmPassword = "Confirm password";
    else if (form.password !== form.confirmPassword) temp.confirmPassword = "Passwords don't match";

    if (!form.agree) temp.agree = "Accept terms";

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validate()) return;
  
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      phone_no: form.mobile
    };
    console.log(payload);
    try {
      const res = await signupUser(payload);
      
      alert("Signup request submitted successfully!");
  
      console.log("Response:", res.data);
  
      // Reset form
      setForm({
        name: "",
        email: "",
        mobile: "",
        role: "",
        password: "",
        confirmPassword: "",
        agree: false,
      });
  
    } catch (err) {
      console.error("Signup error:", err.response?.data || err);
      alert("Signup failed!");
    }
  };
  

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br
                 from-[#EDE8F5] via-[#ADBBDA] to-[#7091E6]"
    >
      <div className="hidden md:flex flex-col justify-center items-start w-1/2 px-16 text-[#101828]">
        <p className="text-sm uppercase tracking-[0.4em] text-[#3D52A0]">
          Transpargo
        </p>
        <h1 className="text-4xl font-bold mb-3 text-[#1E1B4B]">
          Shipment Platform
        </h1>
        <p className="text-lg leading-relaxed text-[#1E1B4B]/80">
          Your smart shipment guide — track, manage, and secure your logistics
          with ease. Account requests go through admin approval before access is
          granted.
        </p>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center px-6 py-6">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl p-6">

          <h2 className="text-2xl font-semibold text-center mb-2">
            Create Your Account
          </h2>
          <p className="text-gray-500 text-center mb-6">
            Sign up to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
              {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
              {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
            </div>

            {/* Mobile */}
            <div>
              <input
                name="mobile"
                type="text"
                placeholder="Mobile Number"
                value={form.mobile}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
              {errors.mobile && <p className="text-red-600 text-sm">{errors.mobile}</p>}
            </div>

            {/* Role */}
            <div>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              >
                <option value="">Select Role</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="Shipping_agency">Shipping Agency</option>
              </select>
              {errors.role && <p className="text-red-600 text-sm">{errors.role}</p>}
            </div>

            {/* Password */}
            <div>
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
              {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              />
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Agreement */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
                className="mt-1 w-4 h-4"
              />
              <label className="text-sm text-gray-700">
                I agree to the <a
                href="/termsandconditions"
                className="text-[#3D52A0] hover:text-[#7091E6] transition-colors underline"
                target="_blank">
                Terms & Conditions
                  </a>
              </label>
            </div>
            {errors.agree && <p className="text-red-600 text-sm">{errors.agree}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3D52A0] text-white p-3 rounded-lg font-medium hover:bg-[#2c3a78] transition disabled:bg-gray-400"
            >
              {loading ? "Submitting..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => (window.location.href = "/login")}
              className="font-semibold text-[#3D52A0] hover:underline"
            >
              Go to login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
