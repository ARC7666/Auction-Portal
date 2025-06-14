import React, { useEffect, useState } from 'react';
import './admin-dashboard.css';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from "firebase/auth";
import { Users, FileText, BarChart3, ShieldCheck, AlertTriangle, LogOut } from 'lucide-react';

function AdminDashboard() {
  const [adminUser, setAdminUser] = useState({ name: "Admin", role: "superadmin" });
  const navigate = useNavigate();
 const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().role === "admin") {
        const userData = docSnap.data();
        setUser({ ...user, name: userData.name, role: userData.role });
        setLoading(false);
      } else {
        navigate("/unauthorized", { replace: true });
      }
    } else {
      navigate("/", { replace: true });
    }
  });

  return () => unsubscribe();
}, []);


  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("Admin logged out successfully.");
        navigate('/');
      })
      .catch((error) => {
        console.error("Logout error:", error);
        alert("Logout failed. Try again.");
      });
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="welcome-msg">Welcome back, {adminUser.name} 👋</p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <div className="admin-kpis">
        <div className="kpi-card">
          <Users size={24} />
          <div>
            <h4>Total Users</h4>
            <p>1,245</p>
          </div>
        </div>
        <div className="kpi-card">
          <BarChart3 size={24} />
          <div>
            <h4>Active Auctions</h4>
            <p>128</p>
          </div>
        </div>
        <div className="kpi-card">
          <ShieldCheck size={24} />
          <div>
            <h4>Verified Sellers</h4>
            <p>435</p>
          </div>
        </div>
        <div className="kpi-card">
          <AlertTriangle size={24} />
          <div>
            <h4>Reports</h4>
            <p>12 New</p>
          </div>
        </div>
      </div>

      <div className="admin-sections">
        <section className="admin-section">
          <h3>User Management</h3>
          <p>Manage sellers, buyers, and permissions.</p>
          <button className="admin-btn">View All Users</button>
        </section>

        <section className="admin-section">
          <h3>Reports & System Logs</h3>
          <p>Review complaints, suspicious activity, or logs.</p>
          <button className="admin-btn">View Logs</button>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;