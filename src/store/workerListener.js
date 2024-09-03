import { localStorageKeys } from '../lib/constants';
import { LocalStorage } from '../shared/react/LocalStorage';
import { albumsCat, isLoadingAlbumsCat } from './album/albumCats';
import {
  isLoadingNotesCat,
  isLoadingOnThisDayNotesCat,
  notesCat,
  onThisDayNotesCat,
} from './note/noteCats';
import { workerActionTypes } from './workerHelpers';

export const myWorker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module',
});

myWorker.onmessage = event => {
  const { type } = event.data;
  if (type === workerActionTypes.DECRYPT_NOTES) {
    const {
      decryptedNotes,
      rest: { startKey, hasMore, date },
    } = event.data;
    if (date) {
      onThisDayNotesCat.set({ ...onThisDayNotesCat.get(), [date]: decryptedNotes.reverse() });
      isLoadingOnThisDayNotesCat.set(false);
    } else {
      const data = {
        items: startKey ? [...notesCat.get().items, ...decryptedNotes] : decryptedNotes,
        startKey: startKey,
        hasMore: hasMore,
      };
      notesCat.set(data);

      if (!startKey) {
        LocalStorage.set(localStorageKeys.notes, data);
      }

      isLoadingNotesCat.set(false);
    }
  } else if (type === workerActionTypes.DECRYPT_ALBUMS) {
    const { decryptedAlbums } = event.data;
    albumsCat.set(decryptedAlbums);
    LocalStorage.set(localStorageKeys.albums, decryptedAlbums);
    isLoadingAlbumsCat.set(false);
  }
};