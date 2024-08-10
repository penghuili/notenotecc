import { fileTypes } from './constants';

export async function fetchFileWithUrl(fileUrl, type) {
  const response = await fetch(fileUrl, { mode: 'cors' });
  const blob = await response.blob();

  return {
    blob,
    size: blob.size,
    type: type || getType(fileUrl),
  };
}

function getType(url) {
  if (url.endsWith('.webm')) {
    return fileTypes.webm;
  }
  if (url.endsWith('.mp4')) {
    return fileTypes.mp4;
  }
  if (url.endsWith('.weba')) {
    return fileTypes.weba;
  }
  if (url.endsWith('.jpeg')) {
    return fileTypes.jpeg;
  }
  return fileTypes.webp;
}
