export function rotateCanvas(canvas, clockwise) {
  const newCanvas = document.createElement('canvas');
  newCanvas.width = canvas.height;
  newCanvas.height = canvas.width;

  const newCtx = newCanvas.getContext('2d');

  if (clockwise) {
    newCtx.translate(canvas.height, 0);
    newCtx.rotate(Math.PI / 2);
  } else {
    newCtx.translate(0, canvas.width);
    newCtx.rotate(-Math.PI / 2);
  }

  newCtx.drawImage(canvas, 0, 0);

  return canvas;
}
