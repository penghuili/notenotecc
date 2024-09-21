import { canvasToBlob } from '../shared/browser/canvasToBlob';

export async function convertImageTo(imageBlob, imageType, quality = 0.8) {
  const imageBitmap = await createImageBitmap(imageBlob);

  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageBitmap, 0, 0);

  return await canvasToBlob(canvas, imageType, quality);
}
