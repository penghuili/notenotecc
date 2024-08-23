import { localStorageKeys } from '../../lib/constants';
import { formatDate, isNewer } from '../../shared/js/date';
import { LocalStorage } from '../../shared/react/LocalStorage';
import { isLoggedInCat } from '../../shared/react/store/sharedCats';
import { fetchSettingsEffect } from '../../shared/react/store/sharedEffects';
import { albumItemsCat } from '../album/albumItemCats';
import {
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

export function fetchHomeNotesEffect() {
  if (!notesCat.get()?.items?.length) {
    const cachedNotes = LocalStorage.get(localStorageKeys.notes);
    if (cachedNotes?.items?.length) {
      notesCat.set(cachedNotes);
    }
  }

  forceFetchHomeNotesEffect(null);
}

export async function forceFetchHomeNotesEffect(startKey) {
  if (!isLoggedInCat.get()) {
    return;
  }

  isLoadingNotesCat.set(true);

  const { data } = await fetchNotes(startKey);

  if (data) {
    notesCat.set({
      items: startKey ? [...notesCat.get().items, ...data.items] : data.items,
      startKey: data.startKey,
      hasMore: data.hasMore,
    });
  }

  isLoadingNotesCat.set(false);
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
    onThisDayNotesCat.set({ ...onThisDayNotes, [type]: data.items.reverse() });
  }

  isLoadingOnThisDayNotesCat.set(false);
}

async function forceFetchNoteEffect(noteId) {
  if (!isLoggedInCat.get()) {
    return;
  }

  isLoadingNoteCat.set(true);

  const { data } = await fetchNote(noteId);
  const stateNote = noteCat.get();
  if (
    data &&
    (stateNote?.sortKey !== noteId || isNewer(data.updatedAt, noteCat.get()?.updatedAt))
  ) {
    updateNoteStates(data, 'update');
  }

  isLoadingNoteCat.set(false);
}

export async function fetchNoteEffect(noteId) {
  const noteInState = noteCat.get();
  if (noteInState?.sortKey === noteId && noteInState.isLocal) {
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
    updateNoteStates(data, 'update');
    fetchSettingsEffect();
  }

  isCreatingNoteCat.set(false);
}

export async function updateNoteEffect(noteId, { encryptedPassword, note, albumIds }) {
  if (!isLoggedInCat.get()) {
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

export async function addImagesEffect(noteId, { encryptedPassword, images }) {
  if (!isLoggedInCat.get()) {
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

export function updateNoteStates(newNote, type) {
  const fn =
    type === 'update'
      ? (items, item) => items.map(i => (i.sortKey === item.sortKey ? { ...i, ...item } : i))
      : type === 'create'
        ? (items, item) => [item, ...items]
        : (items, item) => items.filter(i => i.sortKey !== item.sortKey);

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
    noteCat.set(newNote);
    LocalStorage.set(`${localStorageKeys.note}-${newNote.sortKey}`, newNote);
  } else if (type === 'delete') {
    LocalStorage.remove(`${localStorageKeys.note}-${newNote.sortKey}`);
  }

  // album items
  const albumItems = albumItemsCat.get();
  let updatedAlbumItems;
  if (type === 'create' && newNote.albumIds?.find(id => id === albumItems.albumId)) {
    updatedAlbumItems = {
      ...albumItems,
      items: [newNote, ...albumItems.items],
    };
  } else if (albumItems?.items?.find(i => i.sortKey === newNote.sortKey)) {
    const newItems =
      type === 'update' && newNote.albumIds?.find(id => id === albumItems.albumId)
        ? albumItems.items.map(i => (i.sortKey === newNote.sortKey ? newNote : i))
        : albumItems.items.filter(i => i.sortKey !== newNote.sortKey);

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
  const currentOnThisDayNotes = onThisDayNotesCat.get();
  const date = formatDate(newNote.createdAt);
  if (currentOnThisDayNotes?.[date]) {
    onThisDayNotesCat.set({
      ...currentOnThisDayNotes,
      [date]: fn(currentOnThisDayNotes[date] || [], newNote),
    });
  }
}
