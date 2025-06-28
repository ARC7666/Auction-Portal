import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
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
    document.body.style.overflowY = "scroll";
    fetchUsers();
  }, []);

  const handleToggleVerify = async (userId, current) => {
    const action = current ? "Unverify" : "Verify";

    const result = await Swal.fire({
      title: `${action} User?`,
      text: `Are you sure you want to ${action.toLowerCase()} this user?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#6c63ff",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${action}`,
    });

    if (result.isConfirmed) {
      try {
        // Update Firestore user doc
        await updateDoc(doc(db, "users", userId), {
          isVerified: !current
        });

        // Log to adminLogs
        await addDoc(collection(db, "adminLogs"), {
          userId,
          type: "verify-toggle",
          verified: !current,
          performedBy: auth.currentUser.email,
          timestamp: serverTimestamp()
        });

        // Update UI state
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isVerified: !current } : u))
        );

        await Swal.fire({
          icon: "success",
          title: `User ${!current ? "verified" : "unverified"} successfully!`,
          showConfirmButton: false,
          timer: 1400
        });

      } catch (err) {
        console.error("Failed to toggle verification or log:", err);
        Swal.fire({
          icon: "error",
          title: "Action Failed",
          text: "Could not update verification status.",
        });
      }
    }
  };

  const handleBanUser = async (userId, userName) => {
    const result = await Swal.fire({
      title: `Ban ${userName}?`,
      text: "This will permanently remove the user account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c63ff",
      confirmButtonText: "Yes, Ban User",
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "users", userId));

        await addDoc(collection(db, "adminLogs"), {
          userId,
          type: "ban-user",
          performedBy: auth.currentUser.email,
          timestamp: serverTimestamp()
        });

        setUsers((prev) => prev.filter((u) => u.id !== userId));

        await Swal.fire({
          icon: "success",
          title: `User ${userName} has been banned.`,
          showConfirmButton: false,
          timer: 1500
        });
      } catch (err) {
        console.error("Failed to ban user:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Could not delete user.",
        });
      }
    }
  };


  const filteredUsers = users.filter((user) => {
    if (filter === "all") return true;
    return user.role === filter;
  }).filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-users-page-admin">
      <div className="admin-users-header-admin">
        <h2>Manage Users</h2>
        <ul>
          <div className="admin-users-controls-admin">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="admin-user-filter-controls">
              <select className="admin-user-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="buyer">Buyers</option>
                <option value="seller">Sellers</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </ul>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="admin-users-table-admin">
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
                  {user.role && (
                    <div className="admin-action-btns">
                      {user.role === "seller" && (
                        <button
                          onClick={() => handleToggleVerify(user.id, user.isVerified)}
                          className={`verify-btn-admin ${user.isVerified ? "unverify" : "verify"}`}
                        >
                          {user.isVerified ? "Unverify" : "Verify"}
                        </button>
                      )}
                      <button
                        onClick={() => handleBanUser(user.id, user.name)}
                        className="ban-btn-admin"
                      >
                        ban user
                      </button>
                    </div>
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