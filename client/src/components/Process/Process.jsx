import "./process.css"; // import your css
import React from "react";
import { processList } from "../../utils/data";
import { Container } from 'react-bootstrap';
import Heading from "../Heading/Heading";

export const Process = () => {
  return (
    <>
      <section className="process">
        <div className="top-wave"></div>

        <Container className="py-16 pt-24 text-white">
          <Heading title="How It Works" subtitle="Easy 4 steps to win" />

          <div className="content">
            {processList.map((item, index) => (
              <div key={index} className="card">
                <img src={item.cover} alt="" />
                <h3 className="card-title">{item.title}</h3>
                <p className="card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </Container>

        <div className="bottom-wave"></div>
      </section>
    </>
  );
};