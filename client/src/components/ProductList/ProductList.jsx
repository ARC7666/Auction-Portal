import React, { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import Heading from "../Heading/Heading";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { RiAuctionFill } from "react-icons/ri";
import { GiTakeMyMoney } from "react-icons/gi";
import { MdOutlineFavorite } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { Caption, PrimaryButton, ProfileCard, Title } from "../common/Design";

import "./ProductList.css";


const formatIndianPrice = (num) => {
  if (num >= 1e7) return `₹${(num / 1e7).toFixed(1)}Cr`;
  if (num >= 1e5) return `₹${(num / 1e5).toFixed(1)}L`;
  if (num >= 1e3) return `₹${(num / 1e3).toFixed(1)}k`;
  return `₹${num}`;
};

const ProductCard = ({ item }) => {
  return (
    <div className="product-card">
      <div className="product-card-img-container">
        <NavLink to={`/details/${item?._id}`}>
          <img
                 src={item?.media?.[0]}
                 alt={item?.title}
                 className="product-card-img"
                 loading="lazy"
           />
        </NavLink>

     

        <div className="product-card-top">
          <div className="product-badge-row">
            <Caption className={`product-badge ${item?.isSoldout ? "badge-red" : "badge-green"}`}>
              {item?.isSoldout ? "Sold Out" : "On Stock"}
            </Caption>
          </div>
        </div>
      </div>

      <div className="product-card-bottom">
        <Title className="product-title">{item.title}</Title>
        <hr className="product-divider" />

       <div className="product-card-footer">
         <div className="product-price-row">
          <div className="product-price-column-current">
           {/* <RiAuctionFill size={30} className="text-green" />*/}
            <div>
              <Caption className="product-text-rate">Current Bid</Caption>
              <Title className="title-small-green">{formatIndianPrice(item?.currentBid)}</Title>
            </div>
          </div>

        {/*  <div className="product-divider-vertical" />*/}

          <div className="product-price-column-start">
           {/* <GiTakeMyMoney size={30} className="text-red-500" /> */}
            <div>
              <Caption className="product-text-rate">Start Price</Caption>
              <Title className="title-small-red">{formatIndianPrice(item?.startPrice)}</Title>
            </div>
          </div>
        </div>

        <hr className="product-divider" />

        <div className="product-card-actions">
          <button className="product-btn">Place Bid</button>
          <button className="product-btn-icon">
            <MdOutlineFavorite className="favorite-icon" size={20} />
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export const ProductList = () => {
  const [latestAuctions, setLatestAuctions] = useState([]);

  useEffect(() => {
    const fetchLatestAuctions = async () => {
      try {
        const q = query(collection(db, "auctions"));
        const snapshot = await getDocs(q);

        let allAuctions = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          allAuctions.push({ ...data, _id: doc.id });
        });

        allAuctions.sort((a, b) => {
          const timeA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const timeB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return timeB - timeA;
        });

        setLatestAuctions(allAuctions.slice(0, 4));
      } catch (err) {
        console.error("Error fetching latest auctions:", err);
      }
    };

    fetchLatestAuctions();
  }, []);

  return (
    <section className="product-section">
      <Container>
        <Heading
          title="Latest Auctions"
          subtitle="Explore on the world's best & largest Bidding marketplace with our beautiful Bidding products. We want to be a part of your smile, success and future growth."
        />

        {latestAuctions.length > 0 ? (
          <div className="product-grid">
            {latestAuctions.map((item, index) => (
              <ProductCard item={item} key={index} />
            ))}
          </div>
        ) : (
          <p className="product-empty-text">No auctions available.</p>
        )}
      </Container>
    </section>
  );
};