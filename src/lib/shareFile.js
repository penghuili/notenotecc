import { format } from 'date-fns';
import { saveAs } from 'file-saver';

import { fileTypes } from './constants';
import { convertImageTo } from './convertImage';

export async function downloadFileWithUrl(url, type) {
  try {
    const file = await fetchFileWithUrl(url, type);

    saveAs(file);
  } catch (e) {
    console.log(e);
    return false;
  }
}

export async function shareFileWithUrl(url, type) {
  try {
    const file = await fetchFileWithUrl(url, type);

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

async function fetchFileWithUrl(url, type) {
  const response = await fetch(url, { mode: 'cors' });
  const blob = await response.blob();
  const fileName = `notenote-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}`;

  let file;
  if (type.includes('image')) {
    const pngBlob = await convertImageTo(blob, fileTypes.png);
    file = new File([pngBlob], `${fileName}.png`, {
      type: fileTypes.png,
    });
  } else {
    const fileSuffix = fileTypeToSuffix(type);
    file = new File([blob], `${fileName}.${fileSuffix}`, {
      type,
    });
  }

  return file;
}

async function shareFile(file) {
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

function fileTypeToSuffix(type) {
  if (type === fileTypes.webm) {
    return 'webm';
  }
  if (type === fileTypes.mp4) {
    return 'mp4';
  }
  if (type === fileTypes.weba) {
    return 'weba';
  }
  return 'webp';
}
