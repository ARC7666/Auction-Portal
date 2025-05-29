// src/pages/Landing.js
import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, provider, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './login.css';

function Login() {
  const navigate = useNavigate();

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  /* example to understand the working of .then and .catch (as u r forgetting it more often)
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
        if (role === "buyer") navigate("/buyer-dashboard");
        else if (role === "seller") navigate("/seller-dashboard");
        else if (role === "admin") navigate("/admin-dashboard");
        else navigate("/login"); 
      } else {
        // Sign out the user since they're not registered in our database
        await signOut(auth);
        alert("No account found for this Google account. Please sign up first.");
        navigate("/"); // or navigate('/signup') depending on your path 
        // if u making landing page then ye change karna hoga from app.js and here 
        //WARNING WARNING WARNING 
      }
    })
    .catch((error) => {
      console.log("Google login error:", error);
      alert("Google login failed. Please try again.");
    });
}


  function loginWithEmail() {
    signInWithEmailAndPassword(auth, emailInput, passwordInput)
      .then(async (result) => {
        const user = result.user;
        const userDoc = doc(db, "users", user.uid);
        const userData = await getDoc(userDoc);

        if (!userData.exists()) {
          await setDoc(userDoc, {
            name: user.email,
            email: user.email,
            role: "buyer",
            createdAt: new Date(),
          });
          navigate("/buyer-dashboard");
        } else {
          const role = userData.data().role;
          if (role === "buyer") navigate("/buyer-dashboard");
          else if (role === "seller") navigate("/seller-dashboard");
          else if (role === "admin") navigate("/admin-dashboard");
          else navigate("/login"); // it will fallback to the login if role is invalid
        }
      })
      .catch((error) => {
        console.log("Email login error:", error);
        setErrorMessage("Invalid email or password.");
      });
  }

  return (
    
      
    <div className="backTheme1">
      <div className="loginBox1">
        <div className="signInContent1">
          <div className="titleText1">
            <h1>Welcome Back to Auctania</h1>
            <p>Buy, Sell, and Bid in real-time</p>
          </div>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
          <input
            type="email"
            placeholder="Email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            className="input1"
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="input1"
          />

          <button onClick={loginWithEmail} className="button1">
            Login
          </button>

          <div className="divider1">
            <hr />
            <span>Or Login with</span>
            <hr />
          </div>

          <button onClick={loginWithGoogle} className="googleButton1">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Google_Favicon_2025.svg"
              alt="google-logo"
              className="googleLogo1"
            />
            Google
          </button>

          <p className="loginLink1">
            New User?{' '}
            <span className="link1" onClick={() => navigate('/')}>SignUp here</span>
          </p>
        </div>

        <div className="imageIllustration1">
          <img src="/image2.jpg" alt="login" className="image1" />
        </div>
      </div>
    </div>
    
  );
}

export default Login;