// src/pages/Landing.js
import React, { useEffect, useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth, provider, db } from '../../firebase/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import './login.css';
import { onAuthStateChanged } from 'firebase/auth';
import image1 from '../../assets/images/image1.webp';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { motion } from "framer-motion";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = new URLSearchParams(location.search).get("redirect");

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  /* example to understand the working of .then and .catch (as I am  forgetting it more often)
  orderPizza()
    .then((pizza) => {
      eat(pizza);  // 🍕 Yay! Pizza is here. Time to eat!
    })
    .catch((error) => {
      complain(error); // ❌ Pizza didn't arrive. Complain to the app.
    });

    basically 
    * if pizza delivered -> .then() runs
    * if pizza not delivered -> .catch() runs
  */

  // User login using Google
  function loginWithGoogle() {
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const user = result.user;
        const userDoc = doc(db, "users", user.uid);
        const userData = await getDoc(userDoc);

        if (userData.exists()) {
          const role = userData.data().role;
          if (redirectPath) {
            navigate(redirectPath, { replace: true });
          } else if (role === "buyer") {
            navigate("/buyer-dashboard", { replace: true });
          } else if (role === "seller") {
            navigate("/seller-dashboard", { replace: true });
          } else if (role === "admin") {
            navigate("/admin-dashboard", { replace: true });
          } else {
            navigate("/login");
          }
        } else {
          await signOut(auth);
          alert("No account found for this Google account. Please sign up first.");
          navigate("/"); 
   
        }
      })
      .catch((error) => {
        console.log("Google login error:", error);
        alert("Google login failed. Please try again.");
      });
  }

  useEffect(() => {
    if (new URLSearchParams(location.search).get("redirect")) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const role = userDoc.exists() ? userDoc.data().role : null;

        if (redirectPath) {
          navigate(redirectPath, { replace: true });  
        } else if (role === "buyer") {
          navigate("/buyer-dashboard", { replace: true });  
        } else if (role === "seller") {
          navigate("/seller-dashboard", { replace: true });  
        } else if (role === "admin") {
          navigate("/admin-dashboard", { replace: true });  
        } else {
          navigate("/login", { replace: true });  
        }
      }
    });

    return () => unsubscribe();
  }, []);


  function loginWithEmail() {
    signInWithEmailAndPassword(auth, emailInput, passwordInput)
      .then(async (result) => {
        const user = result.user;
        const userDoc = doc(db, "users", user.uid);
        const userData = await getDoc(userDoc);

        if (!userData.exists()) {
          alert("No account found. Please sign up first.");
          await signOut(auth);
          navigate("/");
        } else {
          const role = userData.data().role;
          if (redirectPath) {
            navigate(redirectPath, { replace: true });
          } else if (role === "buyer") {
            navigate("/buyer-dashboard", { replace: true });
          } else if (role === "seller") {
            navigate("/seller-dashboard", { replace: true });
          } else if (role === "admin") {
            navigate("/admin-dashboard", { replace: true });
          } else {
            navigate("/login");
          }
        }
      })
      .catch((error) => {
        console.log("Email login error:", error);
        setErrorMessage("Invalid email or password.");
      });
  }


  function handleForgotPassword() {
    if (!emailInput) {
      setErrorMessage("Please enter your email first.");
      return;
    }
    sendPasswordResetEmail(auth, emailInput)
      .then(() => {
        setErrorMessage("");
        Swal.fire({
          icon: 'success',
          title: 'Email Sent!',
          text: 'Password reset email has been sent.',
          timer: 1200,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        setShowForgotPassword(false);
      })
      .catch((error) => {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to send reset email. Please check the email and try again.',
          timer: 1200,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      });
  }

  return (


    <div className="backThemedn">
      <div className="loginBoxd">
        <motion.div className="signInContent1"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="titleText-login">
            <h1>Welcome Back to Auctania</h1>
            <p>Buy, Sell, and Bid in real-time</p>
          </div>

          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

          {!showForgotPassword ? (
            <>
              {/* Normal Login */}
              <input
                type="email"
                placeholder="Email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="input1"
              />

              <div className="password-container">
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Enter your password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="input1 password-input"
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

              <button onClick={loginWithEmail} className="button1">
                Login
              </button>

              <p className="loginLink2">
                Forgot your password?{" "}
                <span className="link1" onClick={() => setShowForgotPassword(true)}>
                  Reset here
                </span>
              </p>
            </>
          ) : (
            <>

              <input
                type="email"
                placeholder="Enter your email for password reset"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="input1"
              />
              <button onClick={handleForgotPassword} className="button1">
                Send Reset Email
              </button>
              <p className="loginLink23">
                Remembered your password?{" "}
                <span className="link1" onClick={() => setShowForgotPassword(false)}>
                  Go back to login
                </span>
              </p>
            </>
          )}


          <div className="divider1">
            <hr />
            <span>Or Login with</span>
            <hr />
          </div>
          <div className="googleWrapper1">
            <button onClick={loginWithGoogle} className="googleButton1">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Google_Favicon_2025.svg"
                alt="google-logo"
                className="googleLogo1"
              />
              Google
            </button>
          </div>

          <p className="loginLink1">
            New User?{" "}
            <span className="link1" onClick={() => navigate("/signup")}>
              SignUp here
            </span>
          </p>


        </motion.div>

        <motion.div
          className="imageIllustration1"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <img src={image1} alt="login" className="image1" />
        </motion.div>
      </div>
    </div>

  );
}

export default Login;