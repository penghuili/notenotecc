export async function shareFile(file) {
  try {
    await navigator.share({
      files: [file],
      title: 'SimplestCam',
    });
    return true;
  } catch (error) {
    console.log('Error sharing canvas image:', error);
    return false;
  }
}

export async function shareImageWithUrl(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], 'photo.jpg', { type: blob.type });

    return await shareFile(file);
  } catch (e) {
    console.log(e);
    return false;
  }
}

export function supportShare() {
  return !!navigator.canShare;
}

export function blobToFile(blob, name, type) {
  return new File([blob], name, { type });
}
