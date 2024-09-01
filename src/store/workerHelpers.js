import { decryptMessageAsymmetric, decryptMessageSymmetric } from '../shared/js/encryption';

export const workerActionTypes = {
  DECRYPT_NOTES: 'DECRYPT_NOTES',
  DECRYPT_ALBUMS: 'DECRYPT_ALBUMS',
};

export async function decryptNote(note, privateKey) {
  try {
    if (!note?.encrypted) {
      return note;
    }

    const decryptedPassword = await decryptMessageAsymmetric(privateKey, note.encryptedPassword);

    const decryptedTitle = note.note
      ? await decryptMessageSymmetric(decryptedPassword, note.note)
      : note.note;

    return { ...note, note: decryptedTitle };
  } catch (e) {
    console.log(e);
    return note;
  }
}

export async function decryptAlbum(album, privateKey) {
  if (!album?.encrypted) {
    return album;
  }

  const decryptedPassword = await decryptMessageAsymmetric(privateKey, album.encryptedPassword);

  const decryptedTitle = album.title
    ? await decryptMessageSymmetric(decryptedPassword, album.title)
    : album.title;

  return { ...album, title: decryptedTitle };
}
