import { decryptAlbum, decryptNote, workerActionTypes } from './workerHelpers';

self.onmessage = async function (event) {
  const { type } = event.data;

  try {
    if (type === workerActionTypes.DECRYPT_NOTES) {
      const { notes, privateKey, rest } = event.data;
      const decrypted = await decryptNotes(notes, privateKey);
      self.postMessage({ type, decryptedNotes: decrypted, rest });
    } else if (type === workerActionTypes.DECRYPT_ALBUMS) {
      const { albums, privateKey } = event.data;
      const decrypted = await decryptAlbums(albums, privateKey);
      self.postMessage({ type, decryptedAlbums: decrypted });
    }
  } catch (error) {
    console.log(error);
  }
};

async function decryptNotes(notes, privateKey) {
  return await Promise.all(notes.map(note => decryptNote(note, privateKey)));
}

async function decryptAlbums(albums, privateKey) {
  return await Promise.all(albums.map(note => decryptAlbum(note, privateKey)));
}
