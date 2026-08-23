import React, { useEffect, useState } from 'react';
import { auth, provider, db } from '../../firebase/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './signup.css';
import { onAuthStateChanged } from 'firebase/auth';
import image1 from '../../assets/images/image1.webp';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from "framer-motion";

function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleUser, setGoogleUser] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Preload the illustration image immediately
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = image1;
    document.head.appendChild(link);
    
    const img = new Image();
    img.src = image1;
    img.onload = () => setImgLoaded(true);
    
    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const role = userDoc.exists() ? userDoc.data().role : null;

        if (role === "buyer") navigate("/buyer-dashboard", { replace: true });
        else if (role === "seller") navigate("/buyer-dashboard", { replace: true });
        else if (role === "admin") navigate("/admin-dashboard", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  function redirectToDashboard(userRole) {
    if (userRole === 'admin') {
      navigate('/admin-dashboard', { replace: true });
    } else {
      navigate('/buyer-dashboard', { replace: true });
    }
  }

  function handleSignup(event) {
    event.preventDefault();

    createUserWithEmailAndPassword(auth, email, password)
      .then((result) => {
        const user = result.user;
        let fullName = firstName;

        if (lastName !== '') {
          fullName = firstName + ' ' + lastName;
        }

        updateProfile(user, {
          displayName: fullName,
        }).then(() => {
          setDoc(doc(db, 'users', user.uid), {
            name: fullName,
            email: email,
            role: 'buyer',
            createdAt: new Date()
          }).then(() => {
            redirectToDashboard('buyer');
          });
        });
      })
      .catch((error) => {
        alert("Signup failed: " + error.message);
      });
  }

  function handleGoogleClick() {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        setGoogleUser(user);
        handleGoogleContinue(user);
      })
      .catch((error) => {
        alert("Google Sign in failed: " + error.message);
      });
  }

  function handleGoogleContinue(user) {
    if (user === null) return;

    const userDoc = doc(db, 'users', user.uid);

    getDoc(userDoc).then((snapshot) => {
      if (!snapshot.exists()) {
        let nameToSave = firstName || user.displayName || user.email.split('@')[0];
        if (firstName && lastName) nameToSave = `${firstName} ${lastName}`;

        setDoc(userDoc, {
          name: nameToSave,
          email: user.email,
          role: 'buyer',
          createdAt: new Date()
        }).then(() => {
          redirectToDashboard('buyer');
        });
      } else {
        const userRole = snapshot.data().role || 'buyer';
        redirectToDashboard(userRole);
      }
    });
  }

  return (
    <div className="backTheme">
      <div className="loginBox">
        <motion.div
          className={`imageIllustration ${imgLoaded ? '' : 'loading'}`}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: imgLoaded ? 1 : 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <img 
            src={image1} 
            alt="login" 
            className={`image ${imgLoaded ? 'loaded' : ''}`} 
            onLoad={() => setImgLoaded(true)}
            loading="eager"
            decoding="sync"
            fetchPriority="high"
          />
        </motion.div>

        <motion.div className="signupContent"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >

          <div className="titleText-signup">
            <h1>Create your Auctania account</h1>
            <p>Buy, Sell, and Bid in real-time</p>
          </div>

          <form className="form" onSubmit={handleSignup}>
            <div className="name-fields">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input"
            />

            <div className="password-container">
              <input
                type={passwordVisible ? 'text' : 'password'}
                placeholder="Create your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input password-input"
              />
              <span
                className="eye-toggle"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                <span className="tooltip-text">
                  {passwordVisible ? 'Hide Password' : 'Show Password'}
                </span>
              </span>
            </div>



            <button type="submit" className="button">Create account</button>
          </form>

          <div className="divider">
            <hr /><span>Or register with</span><hr />
          </div>

          <button className="googleButton" onClick={handleGoogleClick}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Google_Favicon_2025.svg"
              alt="google-logo"
              className="googleLogo"
            />
            Google
          </button>

          <p className="loginLink">
            Already a customer?{' '}
            <span className="link" onClick={() => navigate('/login')}>Login here</span>
          </p>


        </motion.div>
      </div>
    </div>
  );
}

export default Signup;