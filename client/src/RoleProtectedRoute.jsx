// RoleProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

const RoleProtectedRoute = ({ allowedRole, children }) => {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const userDoc = await getDoc(doc(db, 'users', u.uid));
        const role = userDoc.exists() ? userDoc.data().role : null;

        if (role === allowedRole) {
          setAuthorized(true);
        }
      }
      setChecking(false);
    });

    return () => unsubscribe();
  }, [allowedRole]);

  if (checking) return <p>Checking access...</p>;

  if (!user || !authorized) return <Navigate to="/login" replace />;

  return children;
};

export default RoleProtectedRoute;