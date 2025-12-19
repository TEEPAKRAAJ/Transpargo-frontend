import { useState } from "react";
import { LockClosedIcon } from "@heroicons/react/24/solid";


export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async(e) => {
    setLoading(true);
    e.preventDefault();
    console.log("Submitted Email:", email);
    const response = await fetch(`http://localhost:5000/auth/forgotpassword/${encodeURIComponent(email)}`,
        {
  method: "POST"}
    );
    if (response.status === 200) {
      alert("Reset email sent! Please check your inbox.");
    }
    else {
      alert("Error sending reset link. Please try again.");
    }
    setLoading(false);
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
          <h2 className="text-2xl font-bold text-gray-800 mt-2">
            Forgot Password
          </h2>
          <p className="text-sm text-gray-500 text-center px-6">
            Enter your registered email and we will send you instructions to reset your password.
          </p>
        </div>


        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">


          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>


            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              required
              className="
                w-full px-4 py-2
                border border-gray-300
                rounded-lg
                focus:outline-none
                focus:ring-2 focus:ring-[#3D52A0]
              "
            />
          </div>


          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="
              w-full py-2
              bg-[#3D52A0]
              text-white font-medium
              rounded-lg
              hover:bg-[#2c3a78]
              transition
            "
            disabled={loading}
          >
        {loading ? "Sending..." : "Send Reset Link"}
      </button>


          {/* Back to Login */}
          <button
            type="button"
            onClick={() => (window.location.href = "/login")}
            className="
              w-full text-sm text-blue-600
              hover:underline mt-2
            "
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}
