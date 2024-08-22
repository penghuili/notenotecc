import { fileTypes, localStorageKeys } from '../../lib/constants';
import {
  decryptFileSymmetric,
  encryptFileSymmetric,
  encryptMessageAsymmetric,
  encryptMessageSymmetric,
} from '../../shared/js/encryption';
import { generatePassword } from '../../shared/js/generatePassword';
import { blobToUint8Array, uint8ArrayToBlob } from '../../shared/react/file';
import { HTTP } from '../../shared/react/HTTP';
import { idbStorage } from '../../shared/react/indexDB';
import { appName } from '../../shared/react/initShared';
import { LocalStorage, sharedLocalStorageKeys } from '../../shared/react/LocalStorage';
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

    LocalStorage.set(`${localStorageKeys.note}-${noteId}`, decrypted);

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
      const name = getName(item.type, item.hash);

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

  await Promise.all(
    images.map(async item => {
      await idbStorage.removeItem(item.hash);
    })
  );

  return uploadUrls.map((u, i) => ({
    path: u.path,
    type: images[i].type,
    size: images[i].size,
    encryptedSize: encrypted[i].encryptedSize,
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

    const decrypted = await decryptNote(data);

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
