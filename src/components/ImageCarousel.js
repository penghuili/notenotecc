import './ImageCarousel.css';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSwipeable } from 'react-swipeable';

import { Image } from './Image';

export function ImageCarousel({ noteId, images, onDeleteLocal }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStart, setDragStart] = useState(0);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);

  const innerIndex = useMemo(
    () => (currentIndex > images?.length - 1 ? 0 : currentIndex),
    [currentIndex, images.length]
  );

  const nextSlide = () => {
    setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex(prevIndex => (prevIndex - 1 + images.length) % images.length);
  };

  const handlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const handleDragStart = e => {
    setDragStart(e.clientX);
    setDragging(true);
  };

  const handleDragMove = e => {
    if (!dragging) return;

    const dragDistance = e.clientX - dragStart;
    const containerWidth = containerRef.current.offsetWidth;

    if (Math.abs(dragDistance) > containerWidth / 3) {
      if (dragDistance > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
      setDragging(false);
    }
  };

  const handleDragEnd = () => {
    setDragging(false);
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
    <div className="carousel-container" {...handlers} ref={containerRef}>
      <div
        className="carousel-slide"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        <Image
          noteId={noteId}
          imageUrl={images[innerIndex].url}
          imagePath={images[innerIndex].path}
          onDeleteLocal={onDeleteLocal}
        />
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
