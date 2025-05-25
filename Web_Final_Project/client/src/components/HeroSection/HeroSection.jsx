import React, { useState, useEffect, useRef } from 'react';
import './HeroSection.css';
import offer1 from '../../assets/images/offer1.jpeg';

const slides = [
  {
    image: offer1,
    heading: 'Active Summer With Juice Milk 300ml',
    subtext: 'New arrivals with nature fruits, juice milk, essential for summer',
  },
  {
    image: offer1,
    heading: '20% SALE OFF',
    subtext: 'Synthetic seeds - Net 2.0 OZ',
  },
];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideRef = useRef(null);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-slider">
      <div
        className="hero-slider-wrapper"
        ref={slideRef}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div className="hero-slide" key={index}>
            <img src={slide.image} alt={`Slide ${index}`} />
            <div className="hero-text">
              <h2>{slide.heading}</h2>
              <p>{slide.subtext}</p>
              <button className="hero-btn">Shop Now</button>
            </div>
          </div>
        ))}
      </div>

      <div className="hero-nav">
        <button onClick={prevSlide} className="hero-arrow">&#10094;</button>
        <button onClick={nextSlide} className="hero-arrow">&#10095;</button>
      </div>
    </div>
  );
};

export default HeroSection;
