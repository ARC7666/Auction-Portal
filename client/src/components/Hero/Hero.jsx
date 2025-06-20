import React from "react";
import "./Hero.css";
import { AiOutlineSafetyCertificate } from "react-icons/ai";
import { CiCirclePlus } from "react-icons/ci";

export const User1 = "https://cdn-icons-png.flaticon.com/128/6997/6997662.png";
export const User2 = "https://cdn-icons-png.flaticon.com/128/236/236832.png";
export const User3 = "https://cdn-icons-png.flaticon.com/128/236/236831.png";
export const User4 = "https://cdn-icons-png.flaticon.com/128/1154/1154448.png";

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-container">
        <div className="hero-left">
          <h1 className="hero-title-hero gradient-text">
            Empower Your Auctions. <br /> Sell Smart, Win Big.
          </h1>
          <p className="hero-desc">
            The trusted digital bazaar where your listings sparkle and your bids hustle. Auctions—now with better vibes.
          </p>

          <div className="hero-stats">
            <div>
              <h2>842M+</h2>
              <p>Total Products</p>
            </div>
            <div>
              <h2>842M+</h2>
              <p>Total Auctions</p>
            </div>
            <div>
              <h2>54</h2>
              <p>Categories</p>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-circle-glow"></div>
          <img src="../images/home/hero.webp" alt="Hero Visual" className="hero-img drop-in" />

          <div className="floating-box box-top-left">
            <Box title="Quality Assured" desc="Secured Listings" />
          </div>

          <div className="floating-box box-bottom-right">
            <Box title="Safe and Secure" desc="Trusted by 58M users" />
          </div>

          <div className="client-box vert-move">
            <h4>58M+ Happy Clients</h4>
            <div className="client-profiles">
              {[User1, User2, User3, User4].map((user, i) => (
                <div key={i} className="profile-img" style={{ zIndex: 10 - i }}>
                  <img src={user} alt={`User${i + 1}`} />
                </div>
              ))}
              <div className="profile-img add-profile">
                <CiCirclePlus size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hero-bottom-curve"></div>
    </section>
  );
};

const Box = ({ title, desc }) => {
  return (
    <div className="info-box">
      <div className="info-icon">
        <AiOutlineSafetyCertificate size={27} />
      </div>
      <div>
        <h4>{title}</h4>
        <p>{desc}</p>
      </div>
    </div>
  );
};

export default Hero;
