import './TikTokCards.css';

import React, { useRef, useState } from 'react';
import fastMemo from 'react-fast-memo';

export const TikTokCards = fastMemo(({ cards, height = '100vh' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef(null);

  const handleStart = clientY => {
    setStartY(clientY);
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleMove = clientY => {
    if (!isDragging) return;
    const diff = startY - clientY;
    setDragOffset(diff);
  };

  const handleEnd = () => {
    setIsDragging(false);
    if (Math.abs(dragOffset) > 100) {
      if (dragOffset > 0 && currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (dragOffset < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
    setDragOffset(0);
  };

  // Touch event handlers
  const handleTouchStart = e => handleStart(e.touches[0].clientY);
  const handleTouchMove = e => handleMove(e.touches[0].clientY);
  const handleTouchEnd = () => handleEnd();

  // Mouse event handlers
  const handleMouseDown = e => handleStart(e.clientY);
  const handleMouseMove = e => handleMove(e.clientY);
  const handleMouseUp = () => handleEnd();

  // Wheel event handler for scrolling
  const handleWheel = e => {
    // e.preventDefault();
    if (e.deltaY > 0 && currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const getCardStyle = index => {
    const offset = (index - currentIndex) * 100 + (isDragging ? -dragOffset / 5 : 0);

    return {
      transform: `translateY(${offset}%)`,
      transition: isDragging ? 'none' : 'transform 200ms ease-in',
    };
  };

  return (
    <div
      className="tiktok-cards-container"
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ height }}
    >
      {cards.map((card, index) => (
        <div key={index} className="tiktok-card" style={getCardStyle(index)}>
          {card}
        </div>
      ))}
    </div>
  );
});
