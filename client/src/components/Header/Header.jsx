import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { IoSearchOutline } from "react-icons/io5";
import { menulists } from "../../utils/data";
import { User1 } from "../hero/Hero";
import "./Header.css";
import { logo } from '../../assets';

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  const closeMenuOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  const handleScroll = () => {
    setIsScrolled(window.scrollY > 0);
  };

  useEffect(() => {
    document.addEventListener("mousedown", closeMenuOutside);
    window.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("mousedown", closeMenuOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleMenuClick = (path) => {
    if (path.startsWith("#")) {
      const id = path.substring(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(path);
    }
  };

  const isHomePage = location.pathname === "/";
  const role = "buyer";

  return (
    <header className={`header ${isHomePage ? "bg-primary" : "bg-white shadow-md"} ${isScrolled ? "scrolled" : ""}`}>
      <div className="header-container">
        <nav className="nav-bar">

       
          <div className="left-section">
            <div className="logo-header">
              <Link to="/">
                <img src={logo} alt="Logo" style={{ cursor: "pointer" }} />
              </Link>
            </div>
          </div>

          
          <ul className="menu-list">
            {menulists.map((list) => (
              <li key={list.id}>
                <button
                  onClick={() => handleMenuClick(list.path)}
                  className={`nav-button-link ${isScrolled || !isHomePage ? "text-black" : "text-white"}`}
                  style={{
                    background: "none",
                    border: "none",
                    font: "inherit",
                    cursor: "pointer",
                    padding: "0",
                    margin: "0"
                  }}
                >
                  {list.link}
                </button>
              </li>
            ))}
          </ul>

       
          <div className="right-section">
            <div className="desktop-icons">
              <IoSearchOutline className={`icon ${isScrolled || !isHomePage ? "text-black" : "text-white"}`} />
              <NavLink to="/login" className={isScrolled || !isHomePage ? "text-black" : "text-white"}>
                Sign in
              </NavLink>
              <NavLink to="/signup" className={`join-btn ${!isHomePage || isScrolled ? "green" : "white"}`}>
                Join
              </NavLink>
              <NavLink to="/">
                <div className="profile-pic">
                  <img src={User1} alt="User" />
                </div>
              </NavLink>
            </div>

            <div className="mobile-menu-button">
              <button onClick={toggleMenu}>
                {isOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
              </button>
            </div>
          </div>
        </nav>

       
<ul ref={menuRef} className={`mobile-menu ${isOpen ? "open" : "closed"}`}>
  {menulists.map((list) => (
    <li key={list.id}>
      <button
        onClick={() => handleMenuClick(list.path)}
        className="text-white"
        style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}
      >
        {list.link}
      </button>
    </li>
   ))}
  <li>
    <NavLink to="/login" className="text-white mobile-auth-link">Sign in</NavLink>
  </li>
  <li>
    <NavLink to="/signup" className="join-btn green ">Join</NavLink>
  </li>
</ul>
      </div>
    </header>
  );
};