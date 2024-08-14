import './ImageCarousel.css';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { fileTypes } from '../lib/constants';
import { isMobile } from '../shared/react/device';
import { MediaItem } from './MediaItem.jsx';

export const ImageCarousel = React.memo(({ noteId, encryptedPassword, images, onDeleteLocal }) => {
  const isSwipable = images.length > 1;
  const [currentIndex, setCurrentIndex] = useState(isSwipable ? 1 : 0); // Start at the first actual image
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef(null);

  const totalSlides = isSwipable ? images.length + 2 : images.length; // Including duplicates

  const handleNextSlide = useCallback(() => {
    if (!isSwipable) {
      return;
    }

    if (isTransitioning) {
      return;
    }
    setIsTransitioning(true);
    setCurrentIndex(prevIndex => (prevIndex + 1) % totalSlides);
  }, [isSwipable, isTransitioning, totalSlides]);

  const handlePrevSlide = useCallback(() => {
    if (!isSwipable) {
      return;
    }

    if (isTransitioning) {
      return;
    }
    setIsTransitioning(true);
    setCurrentIndex(prevIndex => (prevIndex - 1 + totalSlides) % totalSlides);
  }, [isSwipable, isTransitioning, totalSlides]);

  const handleTouchStart = useCallback(
    e => {
      if (!isSwipable) {
        return;
      }

      setTouchStart(e.targetTouches[0].clientX);
    },
    [isSwipable]
  );

  const handleTouchMove = useCallback(
    e => {
      if (!isSwipable) {
        return;
      }

      setTouchEnd(e.targetTouches[0].clientX);
    },
    [isSwipable]
  );

  const handleTouchEnd = useCallback(() => {
    if (!isSwipable) {
      return;
    }

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
  }, [handleNextSlide, handlePrevSlide, isSwipable, touchEnd, touchStart]);

  const handleMouseDown = useCallback(
    e => {
      if (!isSwipable) {
        return;
      }

      setTouchStart(e.clientX);
    },
    [isSwipable]
  );

  const handleMouseMove = useCallback(
    e => {
      if (!isSwipable) {
        return;
      }

      if (!touchStart) {
        return;
      }
      setTouchEnd(e.clientX);
    },
    [isSwipable, touchStart]
  );

  const handleMouseUp = useCallback(() => {
    if (!isSwipable) {
      return;
    }

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
  }, [handleNextSlide, handlePrevSlide, isSwipable, touchEnd, touchStart]);

  const handleMouseLeave = useCallback(() => {
    if (!isSwipable) {
      return;
    }

    setTouchStart(0);
    setTouchEnd(0);
  }, [isSwipable]);

  useEffect(() => {
    if (!isSwipable) {
      return;
    }

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
  }, [handleNextSlide, handlePrevSlide, isSwipable]);

  useEffect(() => {
    if (!isSwipable) {
      return;
    }

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
  }, [currentIndex, images.length, isSwipable, totalSlides]);

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
        {images.length > 1 && (
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
        )}
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
        {images.length > 1 && (
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
        )}
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
