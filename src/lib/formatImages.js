import { canvasToBlob } from '../shared-private/react/canvasToBlob';

export async function formatImages(canvasAndBlobs) {
  const images = await Promise.all(
    canvasAndBlobs.map(async i => {
      let blob = i.blob;
      if (!blob) {
        blob = await canvasToBlob(i.canvas, 'image/webp', 0.8);
      }

      return { isImage: !!i.canvas, blob, size: blob.size };
    })
  );

  return images;
}
