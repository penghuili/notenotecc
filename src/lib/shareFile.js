import { format } from 'date-fns';

export async function shareFile(file) {
  try {
    await navigator.share({
      files: [file],
      title: 'notenote.cc',
    });
    return true;
  } catch (error) {
    console.log('Error sharing file:', error);
    return false;
  }
}

export async function shareImageFromImgTag(imgElement) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = imgElement.naturalWidth;
    canvas.height = imgElement.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgElement, 0, 0);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp'));
    const file = new File([blob], `notenote-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.webp`, {
      type: 'image/webp',
    });

    return await shareFile(file);
  } catch (e) {
    console.log(e);
    return false;
  }
}

export async function shareFileWithUrl(url, type) {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    const fileSuffix = fileTypeToSuffix(type);
    const file = new File(
      [blob],
      `notenote-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.${fileSuffix}`,
      {
        type,
      }
    );

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

function fileTypeToSuffix(type) {
  if (type === 'video/webm') {
    return 'webm';
  }
  if (type === 'audio/webm') {
    return 'weba';
  }
  return 'webp';
}
