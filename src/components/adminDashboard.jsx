import { useEffect, useState } from "react";
import {
  getPendingUsers,
  approveUser,
  rejectUser,
  getAllUsers,
  deleteUser,
} from "../api/adminApi";

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [users, setUsers] = useState([]);

  // ---- Filters for Active Users ----
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  useEffect(() => {
    loadPending();
    loadUsers();
  }, []);

  const loadPending = async () => {
    try {
      const res = await getPendingUsers();
      console.log(res.data);
      setPending(res.data);
    } catch (err) {
      console.error("Error loading pending:", err);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await getAllUsers();
      //console.log(res.data);
      setUsers(res.data);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await approveUser(id);

      if (res.status === 200 || res.status === 201) {
        setPending((prev) => prev.filter((u) => u.id !== id));
        await loadUsers();
      }
    } catch (err) {
      console.error("Approve error:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectUser(id);
      setPending((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  const handleDeleteUser = async (email) => {
    try {
      await deleteUser(email);
      setUsers((prev) => prev.filter((u) => u.email !== email));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // --------------------------------------------
  // FILTERED ACTIVE USERS (Search + Role Filter)
  // --------------------------------------------
  const filteredUsers = users
    .filter((u) => {
      const term = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    })
    .filter((u) => (roleFilter === "All" ? true : u.role === roleFilter));

  return (
    <div
      className="min-h-screen px-6 py-10"
      style={{
        background: `linear-gradient(135deg, #FFFFFF, #EDE8F5, #ADBBD4, #8697C4, #7091E6)`
      }}
    >
      <div className="max-w-6xl mx-auto bg-white/60 backdrop-blur-xl p-8 rounded-2xl shadow-xl border border-[#ADBBD4] space-y-12">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-[#3D52A0]">Admin Dashboard</h1>
        </div>

        {/* ---------------- PENDING USERS ---------------- */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#3D52A0]">Pending Approval</h2>

          <div className="overflow-x-auto rounded-xl border border-[#ADBBD4] bg-white/70 shadow-md">
            <table className="min-w-full table-fixed">
              <thead className="bg-[#8697C4]/40 text-[#3D52A0] whitespace-nowrap">
                <tr>
                  <th className="p-4 w-[22%] text-left">Name</th>
                  <th className="p-4 w-[28%] text-left">Email</th>
                  <th className="p-4 w-[15%] text-left">Phone</th>
                  <th className="p-4 w-[15%] text-left">Role</th>
                  <th className="p-4 w-[20%] text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {pending.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center p-4 text-gray-500">
                      No pending users
                    </td>
                  </tr>
                )}

                {pending.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-[#EDE8F5] transition whitespace-nowrap">
                    <td className="p-4">{p.name}</td>
                    <td className="p-4">{p.email}</td>
                    <td className="p-4">{p.phone_no}</td>
                    <td className="p-4">{p.requested_role}</td>

                    <td className="p-4 flex gap-3 justify-center">
                      <button
                        className="bg-[#3D52A0] text-white py-1 px-4 rounded-lg hover:bg-[#2B3C80]"
                        onClick={() => handleApprove(p.id)}
                      >
                        Approve
                      </button>

                      <button
                        className="bg-red-500 text-white py-1 px-4 rounded-lg hover:bg-red-600"
                        onClick={() => handleReject(p.id)}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---------------- ACTIVE USERS ---------------- */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-[#3D52A0]">Active Users</h2>

          {/* FILTERS ROW */}
          <div className="flex flex-col md:flex-row gap-4 items-center bg-[#EDE8F5] p-4 rounded-xl border border-[#ADBBD4]">
            <input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-3 border border-[#ADBBD4] rounded-lg w-full md:w-1/2"
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="p-3 border border-[#ADBBD4] rounded-lg w-full md:w-1/3"
            >
              <option value="All">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="Shipping_agency">Shipping Agency</option>
            </select>
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#ADBBD4] bg-white/70 shadow-md">
            <table className="min-w-full table-fixed">
              <thead className="bg-[#3D52A0]/80 text-white whitespace-nowrap">
                <tr>
                  <th className="p-4 w-[22%] text-left">Name</th>
                  <th className="p-4 w-[28%] text-left">Email</th>
                  <th className="p-4 w-[15%] text-left">Phone</th>
                  <th className="p-4 w-[15%] text-left">Role</th>
                  <th className="p-4 w-[20%] text-center">Delete</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center p-4 text-gray-500">
                      No matching users
                    </td>
                  </tr>
                )}

                {filteredUsers.map((u) => (
                  <tr key={u.email} className="border-b hover:bg-[#EDE8F5] transition whitespace-nowrap">
                    <td className="p-4">{u.name}</td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">{u.phone_no}</td>
                    <td className="p-4">{u.role}</td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteUser(u.email)}
                        className="bg-red-500 text-white py-1 px-4 rounded-lg hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
