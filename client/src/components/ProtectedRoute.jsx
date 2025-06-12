// ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig'; // Adjust path as necessary
import { doc, getDoc } from 'firebase/firestore';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const role = docSnap.data().role;
          if (role !== requiredRole) {
            navigate("/unauthorized", { replace: true });
          } else {
            setUser(user);
          }
        } else {
          navigate("/unauthorized", { replace: true });
        }
      } else {
        navigate("/", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate, requiredRole]);

  // While we're fetching user data, we can show a loading state (or nothing).
  if (user === null) return <div>Loading...</div>;

  return children;
};

export default ProtectedRoute;