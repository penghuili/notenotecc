import {
  decryptMessageAsymmetric,
  decryptMessageSymmetric,
  encryptMessageAsymmetric,
  encryptMessageSymmetric,
} from '../../shared-private/js/encryption';
import { generatePassword } from '../../shared-private/js/generatePassword';
import { orderByPosition } from '../../shared-private/js/position';
import { createItemsCache } from '../../shared-private/react/cacheItems';
import { HTTP } from '../../shared-private/react/HTTP';
import { idbStorage } from '../../shared-private/react/indexDB';
import { appName } from '../../shared-private/react/initShared';
import { LocalStorage, sharedLocalStorageKeys } from '../../shared-private/react/LocalStorage';
import { objectToQueryString } from '../../shared-private/react/routeHelpers';

export const albumCache = createItemsCache('notenotecc-album');

export async function fetchAlbums() {
  try {
    const albums = await HTTP.get(appName, `/v1/albums`);
    const sorted = orderByPosition(albums, true);

    const decrypted = await Promise.all(sorted.map(album => decryptAlbum(album)));
    await albumCache.cacheItems(decrypted);

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
      await idbStorage.setItem(albumId, decrypted);
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

export async function encryptAlbums(albums) {
  try {
    const unencrypted = albums.filter(album => !album.encryptedPassword && !album.encrypted);
    await Promise.all(
      unencrypted.map(async album => {
        const password = generatePassword(20, true);
        const encryptedPassword = await encryptMessageAsymmetric(
          LocalStorage.get(sharedLocalStorageKeys.publicKey),
          password
        );
        const encryptedTitle = album.title
          ? await encryptMessageSymmetric(password, album.title)
          : album.title;

        await HTTP.put(appName, `/v1/albums/${album.sortKey}/encrypt`, {
          encryptedPassword,
          title: encryptedTitle,
        });
      })
    );

    return { data: {}, error: null };
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

    await updateCache(decrypted, 'create');

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

    await updateCache(decrypted, 'update');

    return { data: decrypted, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteAlbum(albumId) {
  try {
    const data = await HTTP.delete(appName, `/v1/albums/${albumId}`);

    await updateCache({ sortKey: albumId }, 'delete');

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

async function updateCache(album, type) {
  const cachedItems = (await albumCache.getCachedItems()) || [];

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

  await albumCache.cacheItems(newItems);
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
