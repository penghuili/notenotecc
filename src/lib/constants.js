import { isIOS } from '../shared/react/device';

export const localStorageKeys = {
  notes: 'notenote-notes-2',
  notesChangedAtKey: 'notenote-notesChangedAt',
  note: 'notenote-note-2',
  albums: 'notenote-albums',
  albumsChangedAt: 'notenote-albumsChangedAt',
  album: 'notenote-album',
  showIOSCameraBanner: 'settings-notenote-show-ios-camera-banner',
  actions: 'notenote-actions',
};

export const fileTypes = {
  webp: 'image/webp',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webm: 'video/webm',
  mp4: 'video/mp4',
  weba: 'audio/webm',
};

export const imageType = isIOS() ? fileTypes.jpeg : fileTypes.webp;
export const videoType = isIOS() ? fileTypes.mp4 : fileTypes.webm;
