import { isIOS } from '../shared/react/device';

export const localStorageKeys = {
  notes: 'notenote-notes',
  note: 'notenote-note',
  albums: 'notenote-albums',
};

export const fileTypes = {
  webp: 'image/webp',
  jpeg: 'image/jpeg',
  webm: 'video/webm',
  mp4: 'video/mp4',
  weba: 'audio/webm',
};

export const imageType = isIOS() ? fileTypes.jpeg : fileTypes.webp;
export const videoType = isIOS() ? fileTypes.mp4 : fileTypes.webm;
