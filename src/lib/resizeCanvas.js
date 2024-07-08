export function resizeCanvas(originalCanvas, newWidth, newHeight) {
  if (originalCanvas.width <= newWidth) {
    return originalCanvas;
  }

  // Create a new canvas
  const newCanvas = document.createElement('canvas');
  const newCtx = newCanvas.getContext('2d');

  // Set the new canvas dimensions
  newCanvas.width = newWidth;
  newCanvas.height = newHeight;

  // Draw the original canvas contents onto the new canvas
  newCtx.drawImage(
    originalCanvas,
    0,
    0,
    originalCanvas.width,
    originalCanvas.height, // Source rectangle
    0,
    0,
    newWidth,
    newHeight // Destination rectangle
  );

  return newCanvas;
}
