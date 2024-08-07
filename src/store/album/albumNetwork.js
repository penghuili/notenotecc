import { localStorageKeys } from '../../lib/constants';
import {
  decryptMessageAsymmetric,
  decryptMessageSymmetric,
  encryptMessageAsymmetric,
  encryptMessageSymmetric,
} from '../../shared-private/js/encryption';
import { generatePassword } from '../../shared-private/js/generatePassword';
import { orderByPosition } from '../../shared-private/js/position';
import { HTTP } from '../../shared-private/react/HTTP';
import { appName } from '../../shared-private/react/initShared';
import { LocalStorage, sharedLocalStorageKeys } from '../../shared-private/react/LocalStorage';
import { objectToQueryString } from '../../shared-private/react/routeHelpers';

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
    const {
      items,
      startKey: newStartKey,
      limit,
    } = await HTTP.get(appName, `/v1/albums/${albumId}/notes${query ? `?${query}` : ''}`);

    const decrypted = await Promise.all(
      items.filter(item => !!item).map(note => decryptNote(note))
    );

    if (!startKey) {
      LocalStorage.set(albumId, decrypted);
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

export async function createAlbum({ title }) {
  try {
    const password = generatePassword(20, true);
    const encryptedPassword = await encryptMessageAsymmetric(
      LocalStorage.get(sharedLocalStorageKeys.publicKey),
      password
    );
    const encryptedTitle = title ? await encryptMessageSymmetric(password, title) : title;

    const data = await HTTP.post(appName, `/v1/albums`, {
      encryptedPassword,
      title: encryptedTitle,
    });

    const decrypted = await decryptAlbum(data);

    updateCache(decrypted, 'create');

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

    updateCache(decrypted, 'update');

    return { data: decrypted, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteAlbum(albumId) {
  try {
    const data = await HTTP.delete(appName, `/v1/albums/${albumId}`);

    updateCache({ sortKey: albumId }, 'delete');

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

function updateCache(album, type) {
  const cachedItems = LocalStorage.get(localStorageKeys.albums) || [];

  let newItems = cachedItems;
  if (type === 'update') {
    newItems = orderByPosition(
      cachedItems.map(item => (item.sortKey === album.sortKey ? album : item)),
      true
    );
  } else if (type === 'delete') {
    newItems = cachedItems.filter(item => item.sortKey !== album.sortKey);
  } else if (type === 'create') {
    newItems = [album, ...cachedItems];
  }

  LocalStorage.set(localStorageKeys.albums, newItems);
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
  const password = await decryptMessageAsymmetric(
    LocalStorage.get(sharedLocalStorageKeys.privateKey),
    encryptedPassword
  );
  return password;
}
export async function encryptMessageWithEncryptedPassword(encryptedPassword, message) {
  if (!message) {
    return message;
  }

  const password = await decryptPassword(encryptedPassword);
  const encryptedMessage = await encryptMessageSymmetric(password, message);

  return encryptedMessage;
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
