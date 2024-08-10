import { format } from 'date-fns';
import { saveAs } from 'file-saver';

import { fileTypes } from './constants';

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

export async function downloadFileWithUrl(url, type) {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    const fileSuffix = fileTypeToSuffix(type);
    const fileName = `notenote-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}`;

    const file = new File([blob], `${fileName}.${fileSuffix}`, {
      type,
    });

    saveAs(file);
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
    const fileName = `notenote-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}`;

    const file = new File([blob], `${fileName}.${fileSuffix}`, {
      type,
    });

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
