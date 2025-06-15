import React from "react";
import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import Heading from "../Heading/Heading";
// Replace this with actual fetched data from Firestore later
import { productlists } from "../../utils/data";
import "./ProductList.css";


export const ProductList = () => {
  const [liveProducts, setLiveProducts] = useState([]);

  useEffect(() => {
    const now = new Date();

    const filtered = productlists.filter((product) => {
      const start = new Date(product.startTime);
      const end = new Date(product.endTime);
      return now >= start && now <= end;
    });

    setLiveProducts(filtered);
  }, []);

  return (
    <section className="product-home">
      <Container>
        <Heading
          title="Live Auction"
          subtitle="Explore on the world's best & largest Bidding marketplace with our beautiful Bidding products. We want to be a part of your smile, success and future growth."
        />

        {liveProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 my-8">
            {liveProducts.map((item, index) => (
              <ProductCard item={item} key={index} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-8">No live auctions at the moment.</p>
        )}
      </Container>
    </section>
  );
};