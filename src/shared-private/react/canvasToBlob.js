export async function canvasToBlob(canvas, type, quality) {
  return new Promise(resolve => {
    canvas.toBlob(resolve, type || 'image/jpeg', quality || 0.9);
  });
}
