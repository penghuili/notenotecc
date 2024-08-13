import './ImageCarousel.css';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { fileTypes } from '../lib/constants';
import { isMobile } from '../shared-private/react/device';
import { MediaItem } from './MediaItem.jsx';

export const ImageCarousel = React.memo(({ noteId, encryptedPassword, images, onDeleteLocal }) => {
  const [currentIndex, setCurrentIndex] = useState(1); // Start at the first actual image
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);

  const totalSlides = images.length + 2; // Including duplicates

  const handleNextSlide = useCallback(() => {
    if (isTransitioning) {
      return;
    }
    setIsTransitioning(true);
    setCurrentIndex(prevIndex => (prevIndex + 1) % totalSlides);
  }, [totalSlides, isTransitioning]);

  const handlePrevSlide = useCallback(() => {
    if (isTransitioning) {
      return;
    }
    setIsTransitioning(true);
    setCurrentIndex(prevIndex => (prevIndex - 1 + totalSlides) % totalSlides);
  }, [totalSlides, isTransitioning]);

  const handleTouchStart = useCallback(e => {
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback(e => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) {
      return;
    }

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      handleNextSlide();
    } else if (distance < -minSwipeDistance) {
      handlePrevSlide();
    }
    setTouchStart(0);
    setTouchEnd(0);
  }, [handleNextSlide, handlePrevSlide, touchEnd, touchStart]);

  const handleMouseDown = useCallback(e => {
    setTouchStart(e.clientX);
  }, []);

  const handleMouseMove = useCallback(
    e => {
      if (!touchStart) return;
      setTouchEnd(e.clientX);
    },
    [touchStart]
  );

  const handleMouseUp = useCallback(() => {
    if (!touchStart || !touchEnd) {
      return;
    }

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    if (distance > minSwipeDistance) {
      handleNextSlide();
    } else if (distance < -minSwipeDistance) {
      handlePrevSlide();
    }
    setTouchStart(0);
    setTouchEnd(0);
  }, [handleNextSlide, handlePrevSlide, touchEnd, touchStart]);

  const handleMouseLeave = useCallback(() => {
    setTouchStart(0);
    setTouchEnd(0);
  }, []);

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key === 'ArrowLeft') {
        handlePrevSlide();
      } else if (event.key === 'ArrowRight') {
        handleNextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNextSlide, handlePrevSlide]);

  useEffect(() => {
    if (currentIndex === 0) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(images.length);
      }, 200);
    } else if (currentIndex === totalSlides - 1) {
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(1);
      }, 200);
    }
  }, [currentIndex, images.length, totalSlides]);

  if (!images?.length) {
    return null;
  }

  function getMediaType(item) {
    if (item.type) {
      return item.type;
    }

    if (item.path.endsWith('.weba')) {
      return fileTypes.weba;
    }

    if (item.path.endsWith('.webm')) {
      return fileTypes.webm;
    }

    if (item.path.endsWith('.mp4')) {
      return fileTypes.mp4;
    }

    if (item.path.endsWith('.jpeg')) {
      return fileTypes.jpeg;
    }

    return fileTypes.webp;
  }

  // Calculate the display index for the indicator
  const displayIndex =
    currentIndex === 0 ? images.length : currentIndex === totalSlides - 1 ? 1 : currentIndex;

  return (
    <div className="carousel-container" ref={containerRef}>
      <div
        className="carousel-track"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? 'transform 0.2s ease-in-out' : 'none',
        }}
        onTransitionEnd={() => setIsTransitioning(false)}
      >
        <div
          className="carousel-slide"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <MediaItem
            noteId={noteId}
            encryptedPassword={encryptedPassword}
            url={images[images.length - 1].url}
            path={images[images.length - 1].path}
            size={images[images.length - 1].size}
            encryptedSize={images[images.length - 1].encryptedSize}
            type={getMediaType(images[images.length - 1])}
            onDeleteLocal={onDeleteLocal}
          />
        </div>
        {images.map(image => (
          <div
            key={image.url || image.path}
            className="carousel-slide"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <MediaItem
              noteId={noteId}
              encryptedPassword={encryptedPassword}
              url={image.url}
              path={image.path}
              size={image.size}
              encryptedSize={image.encryptedSize}
              type={getMediaType(image)}
              onDeleteLocal={onDeleteLocal}
            />
          </div>
        ))}
        <div
          className="carousel-slide"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <MediaItem
            noteId={noteId}
            encryptedPassword={encryptedPassword}
            url={images[0].url}
            path={images[0].path}
            size={images[0].size}
            encryptedSize={images[0].encryptedSize}
            type={getMediaType(images[0])}
            onDeleteLocal={onDeleteLocal}
          />
        </div>
      </div>
      {images.length > 1 && (
        <>
          {!isMobile() && (
            <>
              <button className="carousel-button prev" onClick={handlePrevSlide}>
                &#10094;
              </button>
              <button className="carousel-button next" onClick={handleNextSlide}>
                &#10095;
              </button>
            </>
          )}
          <div className="carousel-indicator">
            {displayIndex}/{images.length}
          </div>
        </>
      )}
    </div>
  );
});
