// src/pages/Landing.js
import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, provider, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './login.css';

function Login() {
  const navigate = useNavigate();

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

// user login using google 
function loginWithGoogle() {
 signInWithPopup(auth, provider)
  .then((result) => {
    const user = result.user;
    const userDoc = doc(db, "users", user.uid);
     return getDoc(userDoc).then((userData) => {
       if (!userData.exists()) {
        return setDoc(userDoc, {
         name: user.displayName,
         email: user.email,
         role: "buyer",
         createdAt: new Date()
        });
      }
    }).then(() => {
     navigate("/dashboard");
  });
 })
  .catch((error) => {
    console.log("Google login error:", error);
    setErrorMessage("Google login failed");
 });
}

// fucntion to login using email and entering password
function loginWithEmail() {
 signInWithEmailAndPassword(auth, emailInput, passwordInput)
    .then((result) => {
    const user = result.user;
    const userDoc = doc(db, "users", user.uid);
    return getDoc(userDoc).then((userData) => {
     if (!userData.exists()) {
      return setDoc(userDoc, {
        name: user.email,
        email: user.email,
        role: "buyer",
        createdAt: new Date()
        });
       }
     }).then(() => {
    navigate("/dashboard");
  });
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
    className="input1"/>

<input
    type="password"
    placeholder="Enter your password"
    value={passwordInput}
    onChange={(e) => setPasswordInput(e.target.value)}
    className="input1"/>

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
     className="googleLogo1"/>
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