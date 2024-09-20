import './ReorderItems.css';

import { RiDraggable } from '@remixicon/react';
import React, { useMemo, useRef, useState } from 'react';
import fastMemo from 'react-fast-memo';

import { calculateItemPosition } from '../shared/js/position';
import { isMobileWidth } from '../shared/react/device';

const ELEMENT_WIDTH = 150; // Fixed width for elements
const ELEMENT_HEIGHT = 48; // Fixed height for elements
const SPACING = 20; // Spacing between elements
const ITEMS_PER_ROW = isMobileWidth() ? 2 : 3; // Number of items per row
const ANIMATION_DURATION = 300;

const calculateStandardPositions = elArray => {
  return elArray.map((item, index) => {
    const row = Math.floor(index / ITEMS_PER_ROW);
    const col = index % ITEMS_PER_ROW;
    const x = col * (ELEMENT_WIDTH + SPACING);
    const y = row * (ELEMENT_HEIGHT + SPACING);
    return { ...item, x, y };
  });
};

export const ReorderItems = fastMemo(({ items, renderItem, onReorder, reverse }) => {
  const boundaryRef = useRef(null);

  const [elements, setElements] = useState(calculateStandardPositions(items));
  const [dragging, setDragging] = useState(null); // Stores the index of the element being dragged
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const containerSize = useMemo(() => {
    const rows = Math.ceil(items.length / ITEMS_PER_ROW);
    const height = rows * (ELEMENT_HEIGHT + SPACING);
    return { height, width: ELEMENT_WIDTH * ITEMS_PER_ROW + SPACING * (ITEMS_PER_ROW - 1) };
  }, [items]);

  // Handling drag start (for both mouse and touch events)
  const handleDragStart = (e, index) => {
    e.preventDefault(); // Prevent default touch behavior
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragging(index);

    const element = e.target.closest('.draggable').getBoundingClientRect();
    const boundary = boundaryRef.current.getBoundingClientRect();
    setOffset({ x: clientX - element.left, y: clientY - element.top });

    setElements(prev => {
      const updatedElements = [...elements];
      updatedElements[index] = {
        ...prev[index],
        x: element.left - boundary.left,
        y: element.top - boundary.top,
      };
      return updatedElements;
    });
  };

  // Handling dragging (for both mouse and touch events)
  const handleDragMove = e => {
    if (dragging !== null) {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const boundary = boundaryRef.current.getBoundingClientRect();

      let newX = clientX - boundary.left - offset.x;
      let newY = clientY - boundary.top - offset.y;

      setElements(prev => {
        const updatedElements = [...elements];
        updatedElements[dragging] = {
          ...prev[dragging],
          x: newX,
          y: newY,
        };
        return updatedElements;
      });
    }
  };

  // Handling drag end (for both mouse and touch events)
  const handleDragEnd = () => {
    if (dragging !== null) {
      reorderElements(dragging); // Reorder and calculate new positions
      setDragging(null);
    }
  };

  const reorderElements = draggedIndex => {
    const closestIndex = findClosestIndex(elements[draggedIndex].x, elements[draggedIndex].y);

    // Reorder the elements based on the closest index by placing the dragged element in the new position
    const updatedElements = [...elements];
    const [draggedElement] = updatedElements.splice(draggedIndex, 1); // Remove the dragged element
    updatedElements.splice(closestIndex, 0, draggedElement); // Insert it at the new closest position

    const elementsWithPosition = calculateStandardPositions(updatedElements);
    const obj = {};
    elementsWithPosition.forEach(item => {
      obj[item.sortKey] = item;
    });
    // Update the elements array and recalculate positions
    setElements(elements.map(e => ({ ...e, x: obj[e.sortKey].x, y: obj[e.sortKey].y })));

    setTimeout(() => {
      setElements(elementsWithPosition);
      const newPosition = calculateItemPosition(
        elementsWithPosition,
        closestIndex - 1,
        closestIndex + 1,
        reverse
      );
      onReorder({
        item: { ...elementsWithPosition[closestIndex], position: newPosition },
        newItems: elementsWithPosition,
      });
    }, ANIMATION_DURATION);
  };

  const findClosestIndex = (x, y) => {
    let minDistance = Infinity;
    let closestIndex = 0;

    elements.forEach((_, index) => {
      const row = Math.floor(index / ITEMS_PER_ROW);
      const col = index % ITEMS_PER_ROW;
      const gridX = col * (ELEMENT_WIDTH + SPACING);
      const gridY = row * (ELEMENT_HEIGHT + SPACING);

      const distance = Math.sqrt((x - gridX) ** 2 + (y - gridY) ** 2);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  return (
    <div
      ref={boundaryRef}
      className="boundary"
      style={{
        width: containerSize.width,
        height: containerSize.height,
      }}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
    >
      {elements.map((element, index) => (
        <div
          key={element.sortKey}
          className="draggable"
          style={{
            left: `${element.x}px`,
            top: `${element.y}px`,
            width: `${ELEMENT_WIDTH}px`,
            height: `${ELEMENT_HEIGHT}px`,
            zIndex: dragging === index ? 2 : 1,
            transition:
              dragging === index
                ? 'none'
                : `left ${ANIMATION_DURATION}ms ease-in-out, top ${ANIMATION_DURATION}ms ease-in-out`,
          }}
        >
          <span
            className="drag-handle"
            onMouseDown={e => handleDragStart(e, index)}
            onTouchStart={e => handleDragStart(e, index)}
          >
            <RiDraggable />
          </span>
          <span className="drag-content">{renderItem(element)}</span>
        </div>
      ))}
    </div>
  );
});
