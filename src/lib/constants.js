import { isIOSBrowser } from '../shared/browser/device';

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

export const imageType = isIOSBrowser() ? fileTypes.jpeg : fileTypes.webp;
export const videoType = isIOSBrowser() ? fileTypes.mp4 : fileTypes.webm;

export const playStoreLink = 'https://play.google.com/store/apps/details?id=cc.notenote.app.twa';

export const imageSize = 1024;
