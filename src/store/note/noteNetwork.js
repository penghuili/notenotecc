import { fileTypes, localStorageKeys } from '../../lib/constants';
import { fetchFileWithUrl } from '../../lib/fetchFileWithUrl';
import { imagePathToUrl } from '../../lib/imagePathToUrl';
import { asyncForEach } from '../../shared/js/asyncForEach';
import {
  decryptFileSymmetric,
  encryptFileSymmetric,
  encryptMessageAsymmetric,
  encryptMessageSymmetric,
} from '../../shared/js/encryption';
import { generatePassword } from '../../shared/js/generatePassword';
import { blobToUint8Array, uint8ArrayToBlob } from '../../shared/react/file';
import { HTTP } from '../../shared/react/HTTP';
import { appName } from '../../shared/react/initShared';
import { LocalStorage, sharedLocalStorageKeys } from '../../shared/react/LocalStorage';
import { md5 } from '../../shared/react/md5';
import { objectToQueryString } from '../../shared/react/routeHelpers';
import {
  decryptNote,
  decryptPassword,
  encryptMessageWithEncryptedPassword,
} from '../album/albumNetwork';

export async function fetchNotes(startKey, startTime, endTime) {
  try {
    const query = objectToQueryString({ startKey, startTime, endTime });
    const url = query ? `/v1/notes?${query}` : '/v1/notes';
    const { items, startKey: newStartKey, limit } = await HTTP.get(appName, url);

    const decrypted = await Promise.all(items.map(note => decryptNote(note)));

    const data = {
      items: decrypted,
      startKey: newStartKey,
      hasMore: items.length >= limit,
    };
    if (!startKey && !startTime && !endTime) {
      LocalStorage.set(localStorageKeys.notes, data);
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function fetchNote(noteId) {
  try {
    const note = await HTTP.get(appName, `/v1/notes/${noteId}`);

    const decrypted = await decryptNote(note);

    LocalStorage.set(decrypted.sortKey, decrypted);

    return {
      data: decrypted,
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

async function uploadImages(password, images) {
  if (!images?.length) {
    return [];
  }

  function getName(type, hash) {
    if (type === fileTypes.weba) {
      return `audio-${hash}.nncc`;
    }
    if (type === fileTypes.webm) {
      return `video-${hash}.nncc`;
    }
    if (type === fileTypes.mp4) {
      return `mp4-${hash}.nncc`;
    }

    return `pic-${hash}.nncc`;
  }
  const octetType = 'application/octet-stream';
  const encrypted = await Promise.all(
    images.map(async item => {
      const hash = await md5(item.blob);
      const name = getName(item.type, hash);

      const uint8 = await blobToUint8Array(item.blob);
      const encrypted = await encryptFileSymmetric(password, uint8);
      const encryptedBlob = uint8ArrayToBlob(encrypted, octetType);

      return {
        name,
        type: item.type,
        size: item.size,
        blob: encryptedBlob,
        encryptedSize: encryptedBlob.size,
      };
    })
  );
  const uploadUrls = await HTTP.post(appName, `/v1/upload-urls`, {
    images: encrypted.map(e => ({
      name: e.name,
      type: octetType,
    })),
  });
  await Promise.all(
    encrypted.map(async (item, i) => {
      await fetch(uploadUrls[i].url, {
        method: 'PUT',
        body: item.blob,
        headers: {
          'Content-Type': octetType,
          'Cache-Control': 'max-age=31536000,public',
        },
      });
    })
  );

  return uploadUrls.map((u, i) => ({
    path: u.path,
    type: images[i].type,
    size: images[i].size,
    encryptedSize: encrypted[i].encryptedSize,
  }));
}

export async function encryptExistingNote(note) {
  if (note?.encrypted) {
    return { data: note };
  }

  const images = note.images || [];
  const imageBlobs = await Promise.all(images.map(i => fetchFileWithUrl(imagePathToUrl(i.path))));
  const password = generatePassword(20, true);
  const encryptedPassword = await encryptMessageAsymmetric(
    LocalStorage.get(sharedLocalStorageKeys.publicKey),
    password
  );

  const { data } = await addImages(note.sortKey, {
    encryptedPassword,
    images: imageBlobs,
  });
  if (data) {
    await asyncForEach(images, async i => {
      await deleteImage(note.sortKey, i.path);
    });
  }

  try {
    const encryptedNote = note.note
      ? await encryptMessageSymmetric(password, note.note)
      : note.note;
    const encrypted = await HTTP.put(appName, `/v1/notes/${note.sortKey}/encrypt`, {
      encryptedPassword,
      note: encryptedNote,
    });

    const decrypted = await decryptNote(encrypted);

    updateCache(decrypted, 'update');

    return { data: decrypted, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createNote({ note, images, albumIds }) {
  try {
    const password = generatePassword(20, true);
    const encryptedPassword = await encryptMessageAsymmetric(
      LocalStorage.get(sharedLocalStorageKeys.publicKey),
      password
    );

    const uploadedImages = await uploadImages(password, images);
    const encryptedNote = note ? await encryptMessageSymmetric(password, note) : note;

    const data = await HTTP.post(appName, `/v1/notes`, {
      encryptedPassword,
      note: encryptedNote,
      images: uploadedImages,
      albumIds,
    });

    const decrypted = await decryptNote(data);

    updateCache(decrypted, 'create');

    return { data: decrypted, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateNote(noteId, { encryptedPassword, note, albumIds }) {
  try {
    const encryptedMessage = await encryptMessageWithEncryptedPassword(encryptedPassword, note);

    const data = await HTTP.put(appName, `/v1/notes/${noteId}`, {
      note: encryptedMessage,
      albumIds,
    });

    const decrypted = await decryptNote(data);

    updateCache(decrypted, 'update');

    return { data: decrypted, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteImage(noteId, imagePath) {
  try {
    const data = await HTTP.put(appName, `/v1/notes/${noteId}/images/delete`, {
      imagePath,
    });

    const decrypted = await decryptNote(data);

    updateCache(decrypted, 'update');

    return { data: decrypted, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function addImages(noteId, { encryptedPassword, images }) {
  try {
    const password = await decryptPassword(encryptedPassword);
    const uploadedImages = await uploadImages(password, images);
    const data = await HTTP.put(appName, `/v1/notes/${noteId}/images/add`, {
      images: uploadedImages,
    });

    const decrypted = await decryptNote(data);

    updateCache(decrypted, 'update');

    return { data: decrypted, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteNote(noteId) {
  try {
    const data = await HTTP.delete(appName, `/v1/notes/${noteId}`);

    updateCache({ sortKey: noteId }, 'delete');

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

function updateCache(note, type) {
  if (type === 'update' || type === 'create') {
    LocalStorage.set(note.sortKey, note);
  } else if (type === 'delete') {
    LocalStorage.remove(note.sortKey);
  }

  const cachedItems = LocalStorage.get(localStorageKeys.notes) || [];

  let newItems = cachedItems?.items;
  if (!newItems?.length) {
    return;
  }

  if (type === 'update') {
    newItems = newItems.map(item => (item.sortKey === note.sortKey ? note : item));
  } else if (type === 'delete') {
    newItems = newItems.filter(item => item.sortKey !== note.sortKey);
  } else if (type === 'create') {
    newItems = [note, ...newItems];
  }

  LocalStorage.set(localStorageKeys.notes, { ...cachedItems, items: newItems });
}

export async function encryptBlob(password, blob) {
  const uint8 = await blobToUint8Array(blob);
  const encrypted = await encryptFileSymmetric(password, uint8);
  return uint8ArrayToBlob(encrypted, 'application/octet-stream');
}
export async function decryptBlob(encryptedPassword, encryptedBlob, type) {
  const password = await decryptPassword(encryptedPassword);
  const uint8 = await blobToUint8Array(encryptedBlob);
  const decrypted = await decryptFileSymmetric(password, uint8);
  return uint8ArrayToBlob(decrypted, type);
}
