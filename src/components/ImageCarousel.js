import './ImageCarousel.css';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { Image } from './Image';

export function ImageCarousel({ noteId, images, onDeleteLocal }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);

  const innerIndex = useMemo(
    () => (currentIndex > images?.length - 1 ? 0 : currentIndex),
    [currentIndex, images.length]
  );

  const nextSlide = () => {
    if (isTransitioning) {
      return;
    }
    setIsTransitioning(true);
    setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    if (isTransitioning) {
      return;
    }
    setIsTransitioning(true);
    setCurrentIndex(prevIndex => (prevIndex - 1 + images.length) % images.length);
  };

  const handleTouchStart = e => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = e => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleMouseDown = e => {
    setTouchStart(e.clientX);
  };

  const handleMouseMove = e => {
    if (!touchStart) return;
    setTouchEnd(e.clientX);
  };

  const handleMouseUp = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleMouseLeave = () => {
    setTouchStart(0);
    setTouchEnd(0);
  };

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'ArrowLeft') {
        prevSlide();
      } else if (event.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!images?.length) {
    return null;
  }

  return (
    <div className="carousel-container" ref={containerRef}>
      <div
        className="carousel-track"
        style={{
          transform: `translateX(-${innerIndex * 100}%)`,
          transition: isTransitioning ? 'transform 0.2s ease-in-out' : 'none',
        }}
        onTransitionEnd={() => setIsTransitioning(false)}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="carousel-slide"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <Image
              noteId={noteId}
              imageUrl={image.url}
              imagePath={image.path}
              onDeleteLocal={onDeleteLocal}
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          <button className="carousel-button prev" onClick={prevSlide}>
            &#10094;
          </button>
          <button className="carousel-button next" onClick={nextSlide}>
            &#10095;
          </button>
          <div className="carousel-dots">
            {images.map((_, index) => (
              <span
                key={index}
                className={`dot ${index === innerIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
              ></span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
