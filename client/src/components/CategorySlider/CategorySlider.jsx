import React, { useRef, useEffect } from "react";
import "./CategorySlider.css";
import { categorylists } from "../../utils/data";
import iphoneFrame from "../../assets/iphone-frame.png";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const CategorySlider = () => {
  const scrollRef = useRef(null);


const isPaused = useRef(false);

useEffect(() => {
  const container = scrollRef.current;

  const handleMouseEnter = () => (isPaused.current = true);
  const handleMouseLeave = () => (isPaused.current = false);

  container.addEventListener('mouseenter', handleMouseEnter);
  container.addEventListener('mouseleave', handleMouseLeave);

  let animationFrameId;
  const speed = 1.2;

  const smoothScroll = () => {
    if (container && !isPaused.current) {
      container.scrollLeft += speed;
      if (container.scrollLeft >= container.scrollWidth / 2) {
        setTimeout(() => {
          container.scrollLeft = 0;
        }, 0);
      }
    }

    animationFrameId = requestAnimationFrame(smoothScroll);
  };

  animationFrameId = requestAnimationFrame(smoothScroll);

  return () => {
    cancelAnimationFrame(animationFrameId);
    container.removeEventListener('mouseenter', handleMouseEnter);
    container.removeEventListener('mouseleave', handleMouseLeave);
  };
}, []);

return (
  <>
    <div className="iphone-wrapper">
      <div className="iphone-frame">
        <div className="iphone-shell">
        <img src={iphoneFrame} className="iphone-frame-img" alt="iPhone Frame" />

        <div className="iphone-supporter">
          <div className="iphone-screen-content">
            <div className="screen-heading">
              <h3>Bid across top categories</h3>
            </div>

            <div className="category-scroll-container" ref={scrollRef}>
              {[...categorylists, ...categorylists].map((item, index) => (
                <div key={index} className="category-card scroll-card">
                  <img src={item.image} alt={item.title} />
                  <div className="category-card-title">{item.title}</div>
                </div>
              ))}
            </div>
            </div>

            <div className="black-overlay-mask"></div>
          </div>
        </div>
      </div>
    </div>
  </>
);
};