import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation  , Link} from "react-router-dom";
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

  const isHomePage = location.pathname === "/";
  const role = "buyer";

  return (
<header
  className={`header ${isHomePage ? "bg-primary" : "bg-white shadow-md"} ${isScrolled ? "scrolled" : ""}`}
>
  <div className="header-container">
    <nav className="nav-bar">
      
      {/* LEFT SECTION (LOGO) */}
      <div className="left-section">
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="Logo" style={{ cursor: "pointer" }} />
          </Link>
        </div>
      </div>

      {/* CENTER SECTION (MENU) */}
      <ul className="menu-list">
        {menulists.map((list) => (
          <li key={list.id}>
            <NavLink
              to={list.path}
              className={({ isActive }) =>
                `${isActive ? "active" : ""} ${isScrolled || !isHomePage ? "text-black" : "text-white"}`
              }
            >
              {list.link}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* RIGHT SECTION (BUTTONS) */}
      <div className="right-section">
        <div className="desktop-icons">
          <IoSearchOutline
            className={`icon ${isScrolled || !isHomePage ? "text-black" : "text-white"}`}
          />
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

    {/* MOBILE MENU */}
    <ul ref={menuRef} className={`mobile-menu ${isOpen ? "open" : "closed"}`}>
      {menulists.map((list) => (
        <li key={list.id}>
          <NavLink to={list.path} className="text-white">
            {list.link}
          </NavLink>
        </li>
      ))}
    </ul>
  </div>
</header>
  );
};