import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { disablePullToRefresh, enablePullToRefresh } from '../lib/bodySccroll';
import { isAndroidPhone, isIOS } from './isAndroid';

// eslint-disable-next-line react/display-name
export const ImageCropper = forwardRef(({ width, pickedImage }, ref) => {
  const [image, setImage] = useState(null);
  const [cropSquare, setCropSquare] = useState({ left: 0, top: 0 });
  const [cropAreaSize, setCropAreaSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [squareSize, setSquareSize] = useState(0);
  const [scale, setScale] = useState(1);

  const cropSquareRef = useRef(null);
  const canvasRef = useRef(null);

  const BORDER_WIDTH = 2;

  useImperativeHandle(ref, () => ({
    crop: cropImage,
  }));

  useEffect(() => {
    disablePullToRefresh();
    return () => {
      enablePullToRefresh();
    };
  }, []);

  useEffect(() => {
    if (pickedImage) {
      handleImageUpload();
    } else {
      setImage(null);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedImage]);

  useEffect(() => {
    if (image) {
      setupCropArea();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', drag);
      document.addEventListener('touchmove', drag);
      document.addEventListener('mouseup', stopDragging);
      document.addEventListener('touchend', stopDragging);
    } else {
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('touchmove', drag);
      document.removeEventListener('mouseup', stopDragging);
      document.removeEventListener('touchend', stopDragging);
    }

    return () => {
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('touchmove', drag);
      document.removeEventListener('mouseup', stopDragging);
      document.removeEventListener('touchend', stopDragging);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  const handleImageUpload = () => {
    const reader = new FileReader();

    reader.onload = event => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(pickedImage);
  };

  const setupCropArea = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const newScaleWidth = Math.min(1, (width - 8) / image.width);
    const newScaleHeight = Math.min(1, (width - 8) / image.height);
    const newScale = Math.min(newScaleWidth, newScaleHeight);
    setScale(newScale);

    canvas.width = image.width * newScale;
    canvas.height = image.height * newScale;

    setCropAreaSize({
      width: canvas.width,
      height: canvas.height,
    });

    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const newSquareSize = Math.min(canvas.width, canvas.height) + BORDER_WIDTH * 2;
    setSquareSize(newSquareSize);

    const newIsLandscape = canvas.width > canvas.height;
    setIsLandscape(newIsLandscape);

    setCropSquare({
      left: newIsLandscape ? -BORDER_WIDTH : (canvas.width - newSquareSize) / 2,
      top: newIsLandscape ? (canvas.height - newSquareSize) / 2 - BORDER_WIDTH : -BORDER_WIDTH,
    });
  };

  const startDragging = e => {
    if (!isAndroidPhone() && !isIOS()) {
      e.preventDefault();
    }
    setIsDragging(true);
    const offsetX = (e.clientX || e.touches[0].clientX) - cropSquareRef.current.offsetLeft;
    const offsetY = (e.clientY || e.touches[0].clientY) - cropSquareRef.current.offsetTop;
    cropSquareRef.current.dataset.offsetX = offsetX;
    cropSquareRef.current.dataset.offsetY = offsetY;
  };

  const drag = e => {
    if (!isDragging) return;
    if (!isAndroidPhone() && !isIOS()) {
      e.preventDefault();
    }
    const cropSquare = cropSquareRef.current;
    const offsetX = parseFloat(cropSquare.dataset.offsetX);
    const offsetY = parseFloat(cropSquare.dataset.offsetY);

    let newX = (e.clientX || e.touches[0].clientX) - offsetX;
    let newY = (e.clientY || e.touches[0].clientY) - offsetY;

    if (isLandscape) {
      newX = Math.max(-BORDER_WIDTH, Math.min(newX, cropAreaSize.width - squareSize));
      setCropSquare(prev => ({ ...prev, left: newX }));
    } else {
      newY = Math.max(
        -BORDER_WIDTH,
        Math.min(newY, cropAreaSize.height - squareSize + BORDER_WIDTH)
      );
      setCropSquare(prev => ({ ...prev, top: newY }));
    }
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const cropImage = imageWidth => {
    const newCanvas = document.createElement('canvas');
    const newCtx = newCanvas.getContext('2d');
    const originalSquareSize = (squareSize - BORDER_WIDTH * 2) / scale;

    const targetWidth = Math.min(imageWidth || 900, Math.max(originalSquareSize, image.width));

    const scaleFactor = targetWidth / originalSquareSize;

    newCanvas.width = targetWidth;
    newCanvas.height = targetWidth;

    newCtx.drawImage(
      image,
      (cropSquare.left + BORDER_WIDTH) / scale,
      (cropSquare.top + BORDER_WIDTH) / scale,
      originalSquareSize,
      originalSquareSize,
      0,
      0,
      targetWidth,
      targetWidth
    );

    // If you need to sharpen the image after scaling up, you can use this:
    if (scaleFactor > 1) {
      newCtx.imageSmoothingEnabled = false;
      newCtx.mozImageSmoothingEnabled = false;
      newCtx.webkitImageSmoothingEnabled = false;
      newCtx.msImageSmoothingEnabled = false;
    }

    return newCanvas;
  };

  return (
    <div>
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          maxWidth: width,
          width: '100%',
        }}
      >
        <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />
        {!!image && (
          <div
            ref={cropSquareRef}
            style={{
              position: 'absolute',
              border: `${BORDER_WIDTH}px solid white`,
              boxShadow: '0 0 0 4px rgba(0, 0, 0, 0.5)',
              cursor: 'move',
              width: `${squareSize}px`,
              height: `${squareSize}px`,
              left: `${cropSquare.left}px`,
              top: `${cropSquare.top}px`,
              boxSizing: 'border-box',
            }}
            onMouseDown={startDragging}
            onTouchStart={startDragging}
          />
        )}
      </div>
    </div>
  );
});
