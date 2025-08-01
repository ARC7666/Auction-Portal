import "./process.css"; 
import React from "react";
import { processList } from "../../utils/data";
import { Container } from 'react-bootstrap';
import Heading from "../Heading/Heading";

export const Process = () => {
  return (
    <>
      <section className="process">
        <div className="top-wave"></div>

        <Container >
          <Heading
               title={<span style={{ color: "white" }}>How It Works</span>}
               subtitle={<span style={{ color: "#d1d5db" }}>Easy 4 steps to win</span>}
        />

          <div className="content-home">
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