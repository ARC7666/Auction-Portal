import React from "react";
import { Header } from "../components/Header/Header";
import Hero from "../components/Hero/Hero";
import { CategorySlider } from "../components/CategorySlider/CategorySlider";
import {ProductList} from "../components/ProductList/ProductList";

import {Process} from "../components/Process/Process";


const Home = () => {
  return (
    <div style={{ overflowY: "auto", height: "100%", maxHeight: "100vh" }}>
        <Header />
      <Hero />
      <CategorySlider />
      <ProductList />
      <Process />
    </div>
  );
};

export default Home;