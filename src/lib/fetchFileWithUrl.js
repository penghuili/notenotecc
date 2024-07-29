export async function fetchFileWithUrl(fileUrl) {
  const response = await fetch(fileUrl, { mode: 'cors' });
  const blob = await response.blob();

  return {
    blob,
    size: blob.size,
    type: getType(fileUrl),
  };
}

function getType(url) {
  if (url.endsWith('.webm')) {
    return 'video/webm';
  }
  if (url.endsWith('.weba')) {
    return 'audio/webm';
  }
  return 'image/webp';
}
