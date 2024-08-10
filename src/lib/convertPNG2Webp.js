import { canvasToBlob } from '../shared-private/react/canvasToBlob';
import { fileTypes } from './constants';

export async function convertPNG2Webp(pngUrl) {
  const response = await fetch(pngUrl, { mode: 'cors' });
  const blob = await response.blob();
  const imageBitmap = await createImageBitmap(blob);

  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imageBitmap, 0, 0);

  const webpBlob = await canvasToBlob(canvas, fileTypes.webp, 0.8);
  return { blob: webpBlob, size: webpBlob.size, isImage: true };
}
