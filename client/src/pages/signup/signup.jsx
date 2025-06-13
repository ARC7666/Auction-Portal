import React, { useEffect , useState } from 'react'; 
import { auth, provider, db } from '../../firebase/firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile , signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './signup.css';
import { onAuthStateChanged } from 'firebase/auth';
import image1 from '../../assets/images/image1.jpg';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import { motion } from "framer-motion";




function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  
  const [showRolePopup, setShowRolePopup] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  

  const navigate = useNavigate();


useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const role = userDoc.exists() ? userDoc.data().role : null;

      if (role === "buyer") navigate("/buyer-dashboard", { replace: true });
      else if (role === "seller") navigate("/seller-dashboard", { replace: true });
      else if (role === "admin") navigate("/admin-dashboard", { replace: true });
      else navigate("/", { replace: true }); 
    }
  });

  return () => unsubscribe();
}, []);

  function redirectToDashboard(userRole) {
    switch (userRole) {
      case 'admin':
        navigate('/admin-dashboard',{ replace: true });
        break;
      case 'seller':
        navigate('/seller-dashboard',{ replace: true });
        break;
      default:
        navigate('/buyer-dashboard',{ replace: true });
        break;
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
          role: role,
          createdAt: new Date()
        }).then(() => {
          redirectToDashboard(role);
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
        setShowRolePopup(true);
      })
      .catch((error) => {
        alert("Google Sign in failed: " + error.message);
      });
  }

/* function to be called when user uses google to signup and then select there role
     i.e. buyer , seller and admin . */

  function handleGoogleContinue() {
    if (googleUser === null) return; 
     const userDoc = doc(db, 'users', googleUser.uid);

    getDoc(userDoc).then((snapshot) => {
      if (!snapshot.exists()) {
        let nameToSave = firstName || googleUser.displayName || googleUser.email.split('@')[0];
        if (firstName && lastName) nameToSave = `${firstName} ${lastName}`;

        setDoc(userDoc, {
          name: nameToSave,
          email: googleUser.email,
          role: role,
          createdAt: new Date()
        }).then(() => {
          redirectToDashboard(role);
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
           className="imageIllustration"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
         >
           <img src={image1} alt="login" className="image" />
          </motion.div>

        <motion.div className="signupContent"
         initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
         >

          <div className="titleText">
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

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>

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

          {showRolePopup && (
            <div className="popup">
              <h4>Select your role</h4>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input">
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
              <button className="button" onClick={handleGoogleContinue}>Continue</button>
            </div>
          )}
        </motion.div>
        
      </div>
    </div>
  );
}

export default Signup;