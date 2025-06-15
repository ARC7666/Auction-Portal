import React from "react";
import "./Hero.css";
import { IoIosSearch } from "react-icons/io";
import { AiOutlinePropertySafety } from "react-icons/ai";
import { CiCirclePlus } from "react-icons/ci";

export const User1 = "https://cdn-icons-png.flaticon.com/128/6997/6997662.png";
export const User2 = "https://cdn-icons-png.flaticon.com/128/236/236832.png";
export const User3 = "https://cdn-icons-png.flaticon.com/128/236/236831.png";
export const User4 = "https://cdn-icons-png.flaticon.com/128/1154/1154448.png";

const Hero = () => {
  return (
    <>
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-left">
            <h1 className="hero-title-hero">Build, sell & collect digital items.</h1>
            <p className="hero-desc">
              Nulla facilisi. Maecenas ac tellus ut ligula interdum convallis. Nullam dapibus on erat in dolor posuere, none hendrerit lectus ornare. Suspendisse sit amet turpina sagittis, ultrices
              dui et, aliquam urna.
            </p>
            <SearchBox />
            <div className="hero-stats">
              <div>
                <h2>842M</h2>
                <p>Total Product</p>
              </div>
              <div>
                <h2>842M</h2>
                <p>Total Auction</p>
              </div>
              <div>
                <h2>54</h2>
                <p>Total Category</p>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <img src="../images/home/hero.webp" alt="Hero Visual" className="hero-img" />

            <div className="floating-box box-top-left">
              <Box title="Proof of quality" desc="Lorem Ipsum Dolar Amet" />
            </div>

            <div className="floating-box box-bottom-right">
              <Box title="Safe and secure" desc="Lorem Ipsum Dolar Amet" />
            </div>

            <div className="client-box vert-move">
              <h4>58M Happy Client</h4>
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
      
 
    
  
    </>
  );
};

const SearchBox = () => {
  return (
    <form className="search-form">
      <div className="search-wrapper">
        <div className="search-icon">
          <IoIosSearch color="black" size={25} />
        </div>
        <input type="search" placeholder="Search product..." className="search-input" />
        <button className="search-btn">Search</button>
      </div>
    </form>
  );
};

const Box = ({ title, desc }) => {
  return (
    <div className="info-box">
      <div className="info-icon">
        <AiOutlinePropertySafety size={27} />
      </div>
      <div>
        <h4>{title}</h4>
        <p>{desc}</p>
      </div>
    </div>

  ); 

};

export default Hero;