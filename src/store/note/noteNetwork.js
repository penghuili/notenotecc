import { fileTypes, localStorageKeys } from '../../lib/constants';
import { blobToUint8Array, uint8ArrayToBlob } from '../../shared/browser/file';
import { HTTP } from '../../shared/browser/HTTP';
import { idbStorage } from '../../shared/browser/indexDB';
import { appName } from '../../shared/browser/initShared';
import { LocalStorage, sharedLocalStorageKeys } from '../../shared/browser/LocalStorage';
import { objectToQueryString } from '../../shared/browser/routeHelpers';
import { asyncForEach } from '../../shared/js/asyncForEach';
import { asyncMap } from '../../shared/js/asyncMap';
import {
  decryptFileSymmetric,
  encryptFileSymmetric,
  encryptMessageAsymmetric,
  encryptMessageSymmetric,
} from '../../shared/js/encryption';
import { generatePassword } from '../../shared/js/generatePassword';
import { decryptPassword, encryptMessageWithEncryptedPassword } from '../album/albumNetwork';
import { decryptNote } from '../workerHelpers';

export async function fetchNotes(startKey, startTime, endTime) {
  try {
    const query = objectToQueryString({ startKey, startTime, endTime });
    const url = query ? `/v1/notes?${query}` : '/v1/notes';
    const { items, startKey: newStartKey, limit } = await HTTP.get(appName, url);

    const data = {
      items,
      startKey: newStartKey,
      hasMore: items.length >= limit,
    };

    return { data, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error };
  }
}

export async function fetchNote(noteId) {
  try {
    const note = await HTTP.get(appName, `/v1/notes/${noteId}`);

    const decrypted = await decryptNote(note, LocalStorage.get(sharedLocalStorageKeys.privateKey));

    LocalStorage.set(`${localStorageKeys.note}-${noteId}`, decrypted);

    return {
      data: decrypted,
      error: null,
    };
  } catch (error) {
    console.log(error);
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
  const encrypted = await asyncMap(images, async item => {
    const blob = await idbStorage.getItem(item.hash);
    if (!blob) {
      return null;
    }

    const name = getName(item.type, item.hash);
    const uint8 = await blobToUint8Array(blob);
    const encrypted = await encryptFileSymmetric(password, uint8);
    const encryptedBlob = uint8ArrayToBlob(encrypted, octetType);

    return {
      name,
      type: item.type,
      size: item.size,
      blob: encryptedBlob,
      encryptedSize: encryptedBlob.size,
    };
  });
  const filteredEncrypted = encrypted.filter(Boolean);
  const uploadUrls = await HTTP.post(appName, `/v1/upload-urls`, {
    images: filteredEncrypted.filter(Boolean).map(e => ({
      name: e.name,
      type: octetType,
    })),
  });
  await Promise.all(
    filteredEncrypted.map(async (item, i) => {
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

  await asyncForEach(images, async item => {
    await idbStorage.removeItem(item.hash);
  });

  return uploadUrls.map((u, i) => ({
    path: u.path,
    type: images[i].type,
    size: images[i].size,
    encryptedSize: filteredEncrypted[i].encryptedSize,
  }));
}

export async function createNote({ sortKey, timestamp, note, images, albumIds }) {
  try {
    const password = generatePassword(20, true);
    const encryptedPassword = await encryptMessageAsymmetric(
      LocalStorage.get(sharedLocalStorageKeys.publicKey),
      password
    );

    const uploadedImages = await uploadImages(password, images);
    const encryptedNote = note ? await encryptMessageSymmetric(password, note) : note;

    const data = await HTTP.post(appName, `/v1/notes`, {
      sortKey,
      timestamp,
      encryptedPassword,
      note: encryptedNote,
      images: uploadedImages,
      albumIds,
    });

    const decrypted = await decryptNote(data, LocalStorage.get(sharedLocalStorageKeys.privateKey));

    return { data: decrypted, error: null };
  } catch (error) {
    console.log(error);
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

    const decrypted = await decryptNote(data, LocalStorage.get(sharedLocalStorageKeys.privateKey));

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

    const decrypted = await decryptNote(data, LocalStorage.get(sharedLocalStorageKeys.privateKey));

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

    const decrypted = await decryptNote(data, LocalStorage.get(sharedLocalStorageKeys.privateKey));

    return { data: decrypted, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteNote(noteId) {
  try {
    const data = await HTTP.delete(appName, `/v1/notes/${noteId}`);

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
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
