import { localStorageKeys } from '../../lib/constants';
import { LocalStorage, sharedLocalStorageKeys } from '../../shared/browser/LocalStorage';
import { isLoggedInCat } from '../../shared/browser/store/sharedCats';
import { fetchSettingsEffect } from '../../shared/browser/store/sharedEffects';
import { asyncForEach } from '../../shared/js/asyncForEach';
import { formatDate, isNewer } from '../../shared/js/date';
import { createAlbumEffect } from '../album/albumEffects';
import { albumItemsCat } from '../album/albumItemCats';
import { workerActionTypes } from '../workerHelpers';
import { myWorker } from '../workerListener';
import {
  hasLocalNotesCat,
  isAddingImagesCat,
  isCreatingNoteCat,
  isDeletingImageCat,
  isDeletingNoteCat,
  isLoadingNoteCat,
  isLoadingNotesCat,
  isLoadingOnThisDayNotesCat,
  isUpdatingNoteCat,
  noteCat,
  notesCat,
  onThisDayNotesCat,
} from './noteCats';
import {
  addImages,
  createNote,
  deleteImage,
  deleteNote,
  fetchNote,
  fetchNotes,
  updateNote,
} from './noteNetwork';

export const noteTimestamps = {
  fetchNotes: undefined,
  updateNotes: undefined,
};

export function fetchHomeNotesEffect() {
  if (!notesCat.get()?.items?.length) {
    const cachedNotes = LocalStorage.get(localStorageKeys.notes);
    if (cachedNotes?.items?.length) {
      notesCat.set(cachedNotes);
    }
  }
}

export async function forceFetchHomeNotesEffect(startKey) {
  if (!isLoggedInCat.get()) {
    return;
  }

  isLoadingNotesCat.set(true);

  const { data } = await fetchNotes(startKey);

  if (data) {
    myWorker.postMessage({
      type: workerActionTypes.DECRYPT_NOTES,
      notes: data.items,
      privateKey: LocalStorage.get(sharedLocalStorageKeys.privateKey),
      rest: {
        startKey,
        newStartKey: data.startKey,
        hasMore: data.hasMore,
      },
    });
  }
}

export async function fetchOnThisDayNotesEffect(type, startTime, endTime) {
  const onThisDayNotes = onThisDayNotesCat.get();
  if (onThisDayNotes[type]) {
    return;
  }

  if (!isLoggedInCat.get()) {
    return;
  }

  isLoadingOnThisDayNotesCat.set(true);

  const { data } = await fetchNotes(null, startTime, endTime);
  if (data?.items) {
    myWorker.postMessage({
      type: workerActionTypes.DECRYPT_NOTES,
      notes: data.items,
      privateKey: LocalStorage.get(sharedLocalStorageKeys.privateKey),
      rest: { date: type },
    });
  }
}

async function forceFetchNoteEffect(noteId) {
  if (!isLoggedInCat.get()) {
    return;
  }

  noteTimestamps.fetchNotes = Date.now();

  isLoadingNoteCat.set(true);

  const { data } = await fetchNote(noteId);
  const stateNote = noteCat.get();
  if (
    data &&
    (stateNote?.sortKey !== noteId ||
      (isNewer(data.updatedAt, noteCat.get()?.updatedAt) &&
        noteTimestamps.fetchNotes > noteTimestamps.updateNotes))
  ) {
    updateNoteStates(data, 'update');
  }

  isLoadingNoteCat.set(false);
}

export async function fetchNoteEffect(noteId) {
  const noteInState = noteCat.get();
  if (noteInState?.sortKey === noteId) {
    return;
  }

  if (noteInState?.sortKey !== noteId) {
    const cachedNote = LocalStorage.get(`${localStorageKeys.note}-${noteId}`);
    if (cachedNote) {
      noteCat.set(cachedNote);
    }
  }

  if (noteCat.get()?.sortKey === noteId) {
    forceFetchNoteEffect(noteId);
  } else {
    await forceFetchNoteEffect(noteId);
  }
}

export async function createNoteEffect({ sortKey, timestamp, note, images, albumIds }) {
  if (!isLoggedInCat.get()) {
    return;
  }

  isCreatingNoteCat.set(true);

  const { data } = await createNote({ sortKey, timestamp, note, images, albumIds });
  if (data) {
    const found = notesCat.get()?.items?.find(n => n.sortKey === sortKey);
    const action = found ? 'update' : 'create';
    const newNote = { ...data, ...found };
    updateNoteStates(newNote, action);

    fetchSettingsEffect();
  }

  isCreatingNoteCat.set(false);
}

function getEncryptedPassword(noteId) {
  const noteInState = noteCat.get();
  if (!noteInState || noteInState?.sortKey !== noteId) {
    return;
  }

  return noteInState.encryptedPassword;
}

export async function updateNoteEffect(noteId, { note, albumIds }) {
  if (!isLoggedInCat.get()) {
    return;
  }

  const encryptedPassword = getEncryptedPassword(noteId);
  if (!encryptedPassword) {
    return;
  }

  isUpdatingNoteCat.set(true);

  const { data } = await updateNote(noteId, {
    encryptedPassword,
    note,
    albumIds,
  });

  if (data) {
    updateNoteStates(data, 'update');
  }

  isUpdatingNoteCat.set(false);
}

export async function deleteImageEffect(noteId, { imagePath }) {
  if (!isLoggedInCat.get()) {
    return;
  }

  isDeletingImageCat.set(true);

  const { data } = await deleteImage(noteId, imagePath);

  if (data) {
    updateNoteStates(data, 'update');

    fetchSettingsEffect();
  }

  isDeletingImageCat.set(false);
}

export async function addImagesEffect(noteId, { images }) {
  if (!isLoggedInCat.get()) {
    return;
  }

  const encryptedPassword = getEncryptedPassword(noteId);
  if (!encryptedPassword) {
    return;
  }

  isAddingImagesCat.set(true);

  const { data } = await addImages(noteId, { encryptedPassword, images });

  if (data) {
    updateNoteStates(data, 'update');

    fetchSettingsEffect();
  }

  isAddingImagesCat.set(false);
}

export async function deleteNoteEffect(noteId) {
  if (!isLoggedInCat.get()) {
    return;
  }

  isDeletingNoteCat.set(true);

  const { data } = await deleteNote(noteId);

  if (data) {
    updateNoteStates(data, 'delete');

    fetchSettingsEffect();
  }

  isDeletingNoteCat.set(false);
}

export async function saveLocalNotesAndAlbumsEffect() {
  const localNotes =
    LocalStorage.get(localStorageKeys.notes)?.items?.filter(
      note => note.beforeLoggedIn && !note.isWelcome
    ) || [];
  const localAlbums =
    LocalStorage.get(localStorageKeys.albums)?.filter(
      album => album.beforeLoggedIn && !album.isWelcome
    ) || [];

  const hasLocal = !!localNotes.length || !!localAlbums.length;

  if (hasLocal) {
    notesCat.set({ items: [], startKey: null, hasMore: false });

    hasLocalNotesCat.set(hasLocal);
    await asyncForEach(localAlbums, async album => {
      await createAlbumEffect({
        sortKey: album.sortKey,
        timestamp: album.createdAt,
        title: album.title,
      });
    });

    await asyncForEach(localNotes, async note => {
      await createNoteEffect({
        sortKey: note.sortKey,
        timestamp: note.createdAt,
        note: note.note,
        images: note.images,
        albumIds: note.albumIds,
      });
    });

    LocalStorage.remove(localStorageKeys.notes);
    LocalStorage.remove(localStorageKeys.albums);
  }

  hasLocalNotesCat.set(false);
}

export function updateNoteStates(newNote, type) {
  const updateFn = (items, item) =>
    items.map(i => (i.sortKey === item.sortKey ? { ...i, ...item } : i));
  const createFn = (items, item) => [item, ...items];
  const deleteFn = (items, item) => items.filter(i => i.sortKey !== item.sortKey);
  const fn = type === 'update' ? updateFn : type === 'create' ? createFn : deleteFn;

  // home
  const currentNotes = notesCat.get();
  const updatedHome = {
    ...currentNotes,
    items: fn(currentNotes.items || [], newNote),
  };
  notesCat.set(updatedHome);
  LocalStorage.set(localStorageKeys.notes, updatedHome);

  // single
  if (type === 'update' || type === 'create') {
    const mergedNote = { ...noteCat.get(), ...newNote };
    noteCat.set(mergedNote);
    LocalStorage.set(`${localStorageKeys.note}-${newNote.sortKey}`, mergedNote);
  } else if (type === 'delete') {
    LocalStorage.remove(`${localStorageKeys.note}-${newNote.sortKey}`);
  }

  // album items
  const albumItems = albumItemsCat.get();
  let updatedAlbumItems;
  if (type === 'create' && newNote.albumIds?.find(id => id === albumItems.albumId)) {
    updatedAlbumItems = {
      ...albumItems,
      items: createFn(albumItems.items || [], newNote),
    };
  } else if (albumItems?.items?.find(i => i.sortKey === newNote.sortKey)) {
    const newItems =
      type === 'update' && newNote.albumIds?.find(id => id === albumItems.albumId)
        ? updateFn(albumItems.items, newNote)
        : deleteFn(albumItems.items, newNote);

    updatedAlbumItems = {
      ...albumItems,
      items: newItems,
    };
  }
  if (updatedAlbumItems) {
    albumItemsCat.set(updatedAlbumItems);
    LocalStorage.set(`${localStorageKeys.album}-${albumItems.albumId}`, updatedAlbumItems);
  }

  // on this day
  if (newNote.createdAt) {
    const currentOnThisDayNotes = onThisDayNotesCat.get();
    const date = formatDate(newNote.createdAt);
    if (currentOnThisDayNotes?.[date]) {
      onThisDayNotesCat.set({
        ...currentOnThisDayNotes,
        [date]: fn(currentOnThisDayNotes[date] || [], newNote),
      });
    }
  }
}
