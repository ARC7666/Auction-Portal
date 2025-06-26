import React, {useState} from "react";
import { FiPhoneOutgoing } from "react-icons/fi";
import { MdOutlineAttachEmail } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";
import { FaInstagram } from "react-icons/fa";
import { CiLinkedin, CiTwitter } from "react-icons/ci";
import { AiOutlineYoutube } from "react-icons/ai";
import { useLocation , Link } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import Swal from "sweetalert2";
import { logoblack } from '../../assets';
import "./Footer.css";


const Footer = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const [email, setEmail] = useState("");

  const handleSubscribe = async () => {
  if (!email) {
    return Swal.fire({
      icon: "warning",
      title: "Email Required",
      text: "Please enter a valid email address.",
    });
  }

  try {
    await addDoc(collection(db, "newsletterSubscribers"), {
      email: email.trim(),
      timestamp: serverTimestamp()
    });

    Swal.fire({
      icon: "success",
      title: "Subscribed!",
      text: "Thank you for subscribing to Auctania.",
      timer: 2500,
      showConfirmButton: false,
    });

    setEmail(""); 
  } catch (err) {
    console.error("Subscription failed:", err);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Could not subscribe. Try again later.",
    });
  }
};

  return (
    <footer className="footer">
      {isHomePage && <div className="footer-curve"></div>}

      <div className={`footer-container ${isHomePage ? "footer-home-margin" : ""}`}>
        <div className="footer-left">
          <div className="logo-footer">
              <Link to="/">
                <img src={logoblack} alt="Logo" style={{ cursor: "pointer" }} />
              </Link>
            </div>
          <p className="footer-description">
            Empowering next-gen auctions with trust, speed, and transparency.
          </p>

          <div className="footer-divider"></div>

          <h4 className="footer-subscribe-title">Subscribe to Auctania</h4>
          <div className="footer-subscribe-form">
           <input
                 type="email"
                 placeholder="Enter your email"
                 className="footer-input"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
          />

           <button className="footer-submit" onClick={handleSubscribe}>Submit</button>
          </div>
          <p className="footer-privacy">We respect your privacy. No spam, ever.</p>
        </div>

        <div className="footer-links">
        

          <div className="footer-column">
            <h5 className="footer-heading">Company</h5>
            <ul>
              <li>About Us</li>
              <li>Terms of Service</li>
              <li>Privacy Policy</li>
              <li>Connect</li>
              <li>Blog</li>
            </ul>
          </div>

          <div className="footer-column">
            <h5 className="footer-heading">Support</h5>
            <ul>
              <li>Help Center</li>
              <li>FAQs</li>
              <li>Shipping Info</li>
              <li>Contact Us</li>
            </ul>
          </div>

          <div className="footer-column">
            <h5 className="footer-heading">Connect</h5>
            <ul className="footer-contact">
              <li><FiPhoneOutgoing size={18} /> +91 6969696969</li>
              <li><MdOutlineAttachEmail size={20} />team.auctania@gmail.com</li>
              <li><IoLocationOutline size={20} /> Siliguri, India</li>
            </ul>
            <div className="footer-socials">
              <a href="#"><AiOutlineYoutube size={20} /></a>
              <a href="#"><FaInstagram size={20} /></a>
              <a href="#"><CiTwitter size={20} /></a>
              <a href="#"><CiLinkedin size={20} /></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;