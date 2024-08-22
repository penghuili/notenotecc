import { localStorageKeys } from '../../lib/constants';
import {
  decryptMessageAsymmetric,
  decryptMessageSymmetric,
  encryptMessageAsymmetric,
  encryptMessageSymmetric,
} from '../../shared/js/encryption';
import { generatePassword } from '../../shared/js/generatePassword';
import { orderByPosition } from '../../shared/js/position';
import { HTTP } from '../../shared/react/HTTP';
import { appName } from '../../shared/react/initShared';
import { LocalStorage, sharedLocalStorageKeys } from '../../shared/react/LocalStorage';
import { objectToQueryString } from '../../shared/react/routeHelpers';

export async function fetchAlbums() {
  try {
    const albums = await HTTP.get(appName, `/v1/albums`);
    const sorted = orderByPosition(albums, true);

    const decrypted = await Promise.all(sorted.map(album => decryptAlbum(album)));
    LocalStorage.set(localStorageKeys.albums, decrypted);

    return {
      data: { items: decrypted },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

export async function fetchAlbumItems(albumId, { startKey }) {
  try {
    const query = objectToQueryString({ startKey });
    const url = query ? `/v1/albums/${albumId}/notes?${query}` : `/v1/albums/${albumId}/notes`;
    const { items, startKey: newStartKey, limit } = await HTTP.get(appName, url);

    const decrypted = await Promise.all(
      items.filter(item => !!item).map(note => decryptNote(note))
    );

    if (!startKey) {
      LocalStorage.set(`${localStorageKeys.album}-${albumId}`, decrypted);
    }

    return {
      data: {
        items: decrypted,
        startKey: newStartKey,
        hasMore: items.length >= limit,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createAlbum({ sortKey, timestamp, title }) {
  try {
    const password = generatePassword(20, true);
    const encryptedPassword = await encryptMessageAsymmetric(
      LocalStorage.get(sharedLocalStorageKeys.publicKey),
      password
    );
    const encryptedTitle = title ? await encryptMessageSymmetric(password, title) : title;

    const data = await HTTP.post(appName, `/v1/albums`, {
      sortKey,
      timestamp,
      encryptedPassword,
      title: encryptedTitle,
    });

    const decrypted = await decryptAlbum(data);

    return { data: decrypted, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateAlbum(albumId, { encryptedPassword, title, position }) {
  try {
    const encryptedTitle = await encryptMessageWithEncryptedPassword(encryptedPassword, title);

    const data = await HTTP.put(appName, `/v1/albums/${albumId}`, {
      title: encryptedTitle,
      position,
    });

    const decrypted = await decryptAlbum(data);

    return { data: decrypted, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteAlbum(albumId) {
  try {
    const data = await HTTP.delete(appName, `/v1/albums/${albumId}`);

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function decryptAlbum(album) {
  if (!album?.encrypted) {
    return album;
  }

  const decryptedPassword = await decryptMessageAsymmetric(
    LocalStorage.get(sharedLocalStorageKeys.privateKey),
    album.encryptedPassword
  );

  const decryptedTitle = album.title
    ? await decryptMessageSymmetric(decryptedPassword, album.title)
    : album.title;

  return { ...album, title: decryptedTitle };
}
export async function decryptPassword(encryptedPassword) {
  return await decryptMessageAsymmetric(
    LocalStorage.get(sharedLocalStorageKeys.privateKey),
    encryptedPassword
  );
}
export async function encryptMessageWithEncryptedPassword(encryptedPassword, message) {
  if (!message) {
    return message;
  }

  const password = await decryptPassword(encryptedPassword);
  return await encryptMessageSymmetric(password, message);
}
export async function decryptNote(note) {
  if (!note?.encrypted) {
    return note;
  }

  const decryptedPassword = await decryptMessageAsymmetric(
    LocalStorage.get(sharedLocalStorageKeys.privateKey),
    note.encryptedPassword
  );

  const decryptedTitle = note.note
    ? await decryptMessageSymmetric(decryptedPassword, note.note)
    : note.note;

  return { ...note, note: decryptedTitle };
}
