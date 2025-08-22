import React, { useEffect, useState } from 'react';
import './admin-dashboard.css';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { db } from '../../firebase/firebaseConfig';
import { Users, FileText, BarChart3, ShieldCheck, AlertTriangle, LogOut } from 'lucide-react';
import { logo } from "../../assets";
import { Link } from 'react-router-dom';
import AdminUsers from './users/AdminUsers';
import LoaderScreen from '../../components/LoaderScreen';

function AdminDashboard() {
  const [adminUser, setAdminUser] = useState({ name: "Admin", role: "superadmin" });
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAuctions, setTotalAuctions] = useState(0);
  const [verifiedSellerCount, setVerifiedSellerCount] = useState(0);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists() && docSnap.data().role === "admin") {
            const userData = docSnap.data();
            setUser({ ...user, name: userData.name, role: userData.role });
            setLoading(false);
          } else {
            console.warn("Not an admin user");
            navigate("/unauthorized", { replace: true });
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching user doc:", error);
          navigate("/unauthorized", { replace: true });
          setLoading(false);
        }
      } else {

        console.warn("No user is logged in.");
        navigate("/unauthorized", { replace: true });
        setLoading(false);
      }
    });

    document.body.style.overflowY = 'auto';
    return () => unsubscribe();
  }, []);

  //for total users
  useEffect(() => {
    const fetchUserStats = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      setTotalUsers(snapshot.size);
    };

    fetchUserStats();
  }, []);

  //for total auctions
  useEffect(() => {
    const fetchUserStats = async () => {
      const snapshot = await getDocs(collection(db, "auctions"));
      setTotalAuctions(snapshot.size);
    };

    fetchUserStats();
  }, []);

  //for total verified seller
  useEffect(() => {
    const fetchVerifiedSellers = async () => {
      const snapshot = await getDocs(collection(db, "users"));
      const verifiedSellers = snapshot.docs.filter(
        doc => doc.data().role === "seller" && doc.data().isVerified === true
      );
      setVerifiedSellerCount(verifiedSellers.length);
    };

    fetchVerifiedSellers();
  }, []);

  if (loading) {
    return <LoaderScreen />;
  }


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

    <>
      <header className="header-bar-admin" >
        <div className="logo-section">
          <button
            onClick={() => navigate(user ? "/admin-dashboard" : "/")}
            className="unstyled-logo-button"
          >
            <img src={logo} alt="Logo" />
          </button>

        </div>
        <div>
          <h1>Admin Dashboard</h1>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <div className="admin-dashboard">

        <div className="admin-kpis">
          <div className="kpi-card">
            <Users size={24} />
            <div>
              <h4>Total Users</h4>
              <p>{totalUsers}</p>
            </div>
          </div>
          <div className="kpi-card">
            <BarChart3 size={24} />
            <div>
              <h4>Active Auctions</h4>
              <p>{totalAuctions}</p>
            </div>
          </div>
          <div className="kpi-card">
            <ShieldCheck size={24} />
            <div>
              <h4>Verified Sellers</h4>
              <p>{verifiedSellerCount}</p>
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
            <button className="admin-btn" onClick={() => navigate('/admin/users')}>View All Users</button>
          </section>

       
          <section className="admin-section">
            <h3>Auctions</h3>
            <p>View and manage all auction listings.</p>
            <button className="admin-btn" onClick={() => navigate('/admin/auctions')}>
              View All Auctions
            </button>
          </section>

          <section className="admin-section">
            <h3>Admin Tools</h3>
            <p>View actions taken by all admins in real-time.</p>
            <button className="admin-btn" onClick={() => navigate('/admin-dashboard/logs')}>View Logs</button>
          </section>

        </div>
      </div>
    </>
  );

}

export default AdminDashboard;