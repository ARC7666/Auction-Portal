import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from '../../../firebase/firebaseConfig';
import Swal from 'sweetalert2';
import "./AdminUsers.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

useEffect(() => {
  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched users:", userList);  // ✅ Check if this logs anything
      setUsers(userList);
    } catch (err) {
      console.error("Error fetching users:", err); // ❌ Log errors
    } finally {
      setLoading(false);
    }
  };

  fetchUsers();
}, []);

const handleToggleVerify = async (userId, current) => {
  try {
    // 1. Update the user's verification status
    await updateDoc(doc(db, "users", userId), {
      isVerified: !current
    });

    // 2. Log the action into `adminLogs`
    await addDoc(collection(db, "adminLogs"), {
      userId,
      type: "verify-toggle",
      verified: !current,
      performedBy: auth.currentUser.email, // the admin's email
      timestamp: serverTimestamp()
    });

    // 3. Update UI
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isVerified: !current } : u))
    );
  } catch (err) {
    console.error("Failed to toggle verification or log:", err);
  }
};

  const filteredUsers = users.filter((user) => {
    if (filter === "all") return true;
    return user.role === filter;
  }).filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-users-page">
      <div className="admin-users-header">
        <h2>Manage Users</h2>
        <div className="admin-users-controls">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="buyer">Buyers</option>
            <option value="seller">Sellers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Verified</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.name || "N/A"}</td>
                <td>{user.email || "N/A"}</td>
                <td>{user.role}</td>
                <td>{user.isVerified ? "✅" : "❌"}</td>
                <td>
                  {user.role === "seller" && (
                    <button
                      onClick={() => handleToggleVerify(user.id, user.isVerified)}
                      className={`verify-btn ${user.isVerified ? "unverify" : "verify"}`}
                    >
                      {user.isVerified ? "Unverify" : "Verify"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminUsers;