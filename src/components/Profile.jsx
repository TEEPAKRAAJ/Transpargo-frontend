import { useState, useEffect } from "react";
import api from "../api/axiosClient";

export default function Profile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("ID");

  // ------------------------------
  // Helpers
  // ------------------------------
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updatePasswordField = (field, value) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  // ------------------------------
  // Fetch profile
  // ------------------------------
  useEffect(() => {
    if (!userId) {
      alert("User ID missing");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get(`api/profile/${userId}`);
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
        });
      } catch (err) {
        console.error(err.response || err);
        alert(
          "Failed to load profile: " +
            (err.response?.data?.message || err.message)
        );
      }
    };

    fetchProfile();
  }, [userId]);

  // ------------------------------
  // Save / Edit profile
  // ------------------------------
  const handleEditSave = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    if (!userId) {
      alert("User not authenticated");
      return;
    }

    try {
      setLoading(true);
      const res = await api.put(`/api/profile/${userId}`, {
        name: form.name,
        email: form.email,
        phone: form.phone,
      });

      alert(res.data.message || "Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      console.error(err.response || err);
      alert(
        "Failed to update profile: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------
  // Change password
  // ------------------------------
  const handlePasswordUpdate = async () => {
    if (
      !passwords.current_password ||
      !passwords.new_password ||
      !passwords.confirm_password
    ) {
      alert("All password fields are required");
      return;
    }

    if (passwords.new_password !== passwords.confirm_password) {
      alert("New password and confirm password do not match");
      return;
    }

    try {
      setLoading(true);
   
      const res = await api.put(`/api/profile/change-password/${userId}`, {
        currentPassword: passwords.current_password,
        newPassword: passwords.new_password,
      });

      alert(res.data.message || "Password updated successfully");

      setPasswords({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      console.error(err.response || err);
      alert(
        err.response?.data?.message || "Failed to update password"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-[#3D52A0] p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7091E6] disabled:bg-gray-100";

  return (
    <div
      className="min-h-screen w-full px-10 py-10"
      style={{
        background:
          "linear-gradient(to bottom,#FFFFFF,#EDE8F5,#ADBBD4,#8697C4,#7091E6)",
      }}
    >
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl border border-[#3D52A0] shadow-xl p-10">
        <h1 className="text-3xl font-bold text-black mb-2 text-center">
          Profile Settings
        </h1>
        <p className="text-center text-gray-700 mb-8">
          Manage your account settings and preferences
        </p>

        {/* Profile Photo */}
        {/* <div className="bg-[#EDE8F5] border border-[#3D52A0] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-black mb-4">
            Profile Photo
          </h2>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-[#7091E6] flex items-center justify-center text-white text-2xl font-bold">
              JD
            </div>
            <button className="px-4 py-2 bg-[#3D52A0] text-white rounded-lg hover:bg-[#7091E6]">
              Upload New Picture
            </button>
          </div>
        </div> */}

        {/* Personal Information */}
        <div className="bg-[#EDE8F5] border border-[#3D52A0] rounded-xl mb-8">
          <div className="flex items-center justify-between p-6 border-b border-[#3D52A0]">
            <h2 className="text-xl font-semibold text-black">
              Personal Information
            </h2>
            <button
              onClick={handleEditSave}
              disabled={loading}
              className={`px-5 py-2 rounded-lg font-semibold ${
                isEditing
                  ? "bg-green-700 text-white hover:bg-green-800"
                  : "bg-[#3D52A0] text-white hover:bg-[#7091E6]"
              }`}
            >
              {loading ? "Saving..." : isEditing ? "Save" : "Edit"}
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <label className="font-semibold text-black">Full Name</label>
              <input
                className={inputClass}
                value={form.name}
                disabled={!isEditing}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold text-black">Email Address</label>
              <input
                type="email"
                className={inputClass}
                value={form.email}
                disabled={!isEditing}
                onChange={(e) => updateField("email", e.target.value)}
              />
            </div>

            <div>
              <label className="font-semibold text-black">Phone Number</label>
              <input
                className={inputClass}
                value={form.phone}
                disabled={!isEditing}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-[#EDE8F5] border border-[#3D52A0] rounded-xl p-6">
          <h2 className="text-xl font-semibold text-black mb-4">
            Change Password
          </h2>

          <div className="space-y-4">
            <div>
              <label className="font-semibold text-black">Current Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputClass}
                value={passwords.current_password}
                onChange={(e) =>
                  updatePasswordField("current_password", e.target.value)
                }
              />
            </div>

            <div>
              <label className="font-semibold text-black">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputClass}
                value={passwords.new_password}
                onChange={(e) =>
                  updatePasswordField("new_password", e.target.value)
                }
              />
            </div>

            <div>
              <label className="font-semibold text-black">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={inputClass}
                value={passwords.confirm_password}
                onChange={(e) =>
                  updatePasswordField("confirm_password", e.target.value)
                }
              />
            </div>

            <button
              onClick={handlePasswordUpdate}
              disabled={loading}
              className="mt-4 w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}