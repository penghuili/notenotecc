import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';

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

export async function downloadFileWithUrl(url, type, isMp4) {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    const fileSuffix = fileTypeToSuffix(type);
    const fileName = `notenote-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}`;

    let file;
    if (type === 'video/webm' && isMp4) {
      const mp4Blob = await convertWebMBlobToMP4Blob(blob);
      file = new File([mp4Blob], `${fileName}.mp4`, {
        type: 'video/mp4',
      });
    } else {
      file = new File([blob], `${fileName}.${fileSuffix}`, {
        type,
      });
    }

    saveAs(file);
  } catch (e) {
    console.log(e);
    return false;
  }
}

export async function shareFileWithUrl(url, type, isMp4) {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    const fileSuffix = fileTypeToSuffix(type);
    const fileName = `notenote-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}`;

    let file;
    if (type === 'video/webm' && isMp4) {
      const mp4Blob = await convertWebMBlobToMP4Blob(blob);
      file = new File([mp4Blob], `${fileName}.mp4`, {
        type: 'video/mp4',
      });
    } else {
      file = new File([blob], `${fileName}.${fileSuffix}`, {
        type,
      });
    }

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

const convertWebMBlobToMP4Blob = async webmBlob => {
  const ffmpeg = await loadFfmpeg();

  const webmFile = new File([webmBlob], 'input.webm');
  await ffmpeg.writeFile('input.webm', await fetchFile(webmFile));
  await ffmpeg.exec(['-i', 'input.webm', 'output.mp4']);
  const data = await ffmpeg.readFile('output.mp4');

  const mp4Blob = new Blob([data.buffer], { type: 'video/mp4' });

  return mp4Blob;
};

const loadFfmpeg = async () => {
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  const ffmpeg = new FFmpeg();
  ffmpeg.on('log', ({ message }) => {
    console.log(message);
  });
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  return ffmpeg;
};
