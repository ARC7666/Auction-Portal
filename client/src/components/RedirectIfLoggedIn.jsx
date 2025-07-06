import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const RedirectIfLoggedIn = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          const role = docSnap.data().role;
          if (role === 'buyer') setRedirectTo('/buyer-dashboard');
          else if (role === 'seller') setRedirectTo('/seller-dashboard');
          else if (role === 'admin') setRedirectTo('/admin-dashboard');
          else setRedirectTo('/unauthorized');
        }
      } else {
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (redirectTo) return <Navigate to={redirectTo} replace />;
  if (checking) return null;
  return children;
};

export default RedirectIfLoggedIn;