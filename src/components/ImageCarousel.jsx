import './ImageCarousel.css';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { isMobile } from '../shared-private/react/device';
import { Image } from './Image.jsx';

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

  const nextSlide = useCallback(() => {
    if (isTransitioning) {
      return;
    }
    setIsTransitioning(true);
    setCurrentIndex(prevIndex => (prevIndex + 1) % images.length);
  }, [images.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) {
      return;
    }
    setIsTransitioning(true);
    setCurrentIndex(prevIndex => (prevIndex - 1 + images.length) % images.length);
  }, [images.length, isTransitioning]);

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
  }, [nextSlide, prevSlide]);

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
        {images.map(image => (
          <div
            key={image.url}
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
              size={image.size}
              isVideo={image.blob || image?.path?.endsWith('.webm')}
              onDeleteLocal={onDeleteLocal}
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <>
          {!isMobile() && (
            <>
              <button className="carousel-button prev" onClick={prevSlide}>
                &#10094;
              </button>
              <button className="carousel-button next" onClick={nextSlide}>
                &#10095;
              </button>
            </>
          )}
          <div className="carousel-indicator">
            {innerIndex + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
}
