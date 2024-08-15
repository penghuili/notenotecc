import { albumDescriptionCat, albumSelectedKeysCat } from '../../components/AlbumsSelector.jsx';
import { localStorageKeys } from '../../lib/constants';
import { formatDate, isNewer } from '../../shared/js/date';
import { LocalStorage } from '../../shared/react/LocalStorage';
import { settingsCat } from '../../shared/react/store/sharedCats';
import {
  fetchSettingsEffect,
  goBackEffect,
  setToastEffect,
} from '../../shared/react/store/sharedEffects';
import { toastTypes } from '../../shared/react/Toast.jsx';
import { albumsCat } from '../album/albumCats.js';
import { albumItemsCat } from '../album/albumItemCats';
import { createAlbum } from '../album/albumNetwork.js';
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
  encryptExistingNote,
  fetchNote,
  fetchNotes,
  updateNote,
} from './noteNetwork';

const notesChangedAtKey = 'notenote-notesChangedAt';
const encryptingMessage = 'Encrypting ...';

export async function fetchNotesEffect(startKey, force) {
  if (!force && notesCat.get()?.items?.length) {
    return;
  }

  if (!force && !startKey) {
    const cachedNotes = LocalStorage.get(localStorageKeys.notes);
    if (cachedNotes?.items?.length) {
      notesCat.set(cachedNotes);

      await fetchSettingsEffect();

      if (!isNewer(settingsCat.get()?.notesChangedAt, LocalStorage.get(notesChangedAtKey))) {
        return;
      }
    }
  }

  console.log('fetching notes');
  isLoadingNotesCat.set(true);

  const { data } = await fetchNotes(startKey);
  if (data) {
    notesCat.set({
      items: startKey ? [...notesCat.get().items, ...data.items] : data.items,
      startKey: data.startKey,
      hasMore: data.hasMore,
    });

    LocalStorage.set(notesChangedAtKey, settingsCat.get()?.notesChangedAt);
  }

  isLoadingNotesCat.set(false);
}

export async function fetchOnThisDayNotesEffect(type, startTime, endTime) {
  const onThisDayNotes = onThisDayNotesCat.get();
  if (onThisDayNotes[type]) {
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
  isLoadingNoteCat.set(true);

  const { data } = await fetchNote(noteId);
  if (data && isNewer(data.updatedAt, noteCat.get()?.updatedAt)) {
    noteCat.set(data);
  }

  isLoadingNoteCat.set(false);
}

export async function fetchNoteEffect(noteId) {
  if (noteCat.get()?.sortKey === noteId) {
    return;
  }

  const cachedNote = LocalStorage.get(localStorageKeys.note);
  if (cachedNote?.sortKey === noteId && isNewer(cachedNote?.updatedAt, noteCat.get()?.updatedAt)) {
    noteCat.set(cachedNote);
  }

  forceFetchNoteEffect(noteId);
}

export function setNoteEffect(note) {
  noteCat.set(note);
}

export async function createNoteEffect({
  note,
  images,
  albumIds,
  albumDescription,
  onSucceeded,
  goBack,
}) {
  isCreatingNoteCat.set(true);
  setToastEffect(encryptingMessage, toastTypes.info);

  const updatedAlbumIds = await getAlbumIds(albumIds, albumDescription);

  const { data } = await createNote({
    note,
    images,
    albumIds: updatedAlbumIds,
  });
  if (data) {
    const currentNotes = notesCat.get();
    notesCat.set({ ...currentNotes, items: [data, ...(currentNotes.items || [])] });

    setToastEffect('Saved!');

    if (onSucceeded) {
      onSucceeded(data);
    }
    if (goBack) {
      goBackEffect();
    }

    fetchSettingsEffect();
  }

  isCreatingNoteCat.set(false);
}

export async function updateNoteEffect(
  noteId,
  { encryptedPassword, note, albumIds, albumDescription, onSucceeded, goBack }
) {
  isUpdatingNoteCat.set(true);
  setToastEffect(encryptingMessage, toastTypes.info);

  const updatedAlbumIds = await getAlbumIds(albumIds, albumDescription);

  const { data } = await updateNote(noteId, {
    encryptedPassword,
    note,
    albumIds: updatedAlbumIds,
  });

  if (data) {
    updateStates(data, 'update');

    setToastEffect('Saved!');

    if (onSucceeded) {
      onSucceeded(data);
    }
    if (goBack) {
      goBackEffect();
    }
  }

  isUpdatingNoteCat.set(false);
}

export async function encryptExistingNoteEffect(note) {
  isUpdatingNoteCat.set(true);
  setToastEffect(encryptingMessage, toastTypes.info);

  const { data } = await encryptExistingNote(note);

  if (data) {
    updateStates(data, 'update');

    setToastEffect('Encrypted!');
  }

  isUpdatingNoteCat.set(false);
}

export async function deleteImageEffect(noteId, { imagePath, onSucceeded, goBack }) {
  isDeletingImageCat.set(true);

  const { data } = await deleteImage(noteId, imagePath);

  if (data) {
    updateStates(data, 'update');

    setToastEffect('Deleted!');

    if (onSucceeded) {
      onSucceeded(data);
    }
    if (goBack) {
      goBackEffect();
    }

    fetchSettingsEffect();
  }

  isDeletingImageCat.set(false);
}

export async function addImagesEffect(noteId, { encryptedPassword, images, onSucceeded, goBack }) {
  isAddingImagesCat.set(true);
  setToastEffect(encryptingMessage, toastTypes.info);

  const { data } = await addImages(noteId, { encryptedPassword, images });

  if (data) {
    updateStates(data, 'update');

    setToastEffect('Saved!');

    if (onSucceeded) {
      onSucceeded(data);
    }
    if (goBack) {
      goBackEffect();
    }

    fetchSettingsEffect();
  }

  isAddingImagesCat.set(false);
}

export async function deleteNoteEffect(noteId, { onSucceeded, goBack }) {
  isDeletingNoteCat.set(true);

  const { data } = await deleteNote(noteId);

  if (data) {
    updateStates(data, 'delete');

    setToastEffect('Deleted!');

    if (onSucceeded) {
      onSucceeded();
    }
    if (goBack) {
      goBackEffect();
    }

    fetchSettingsEffect();
  }

  isDeletingNoteCat.set(false);
}

function updateStates(newNote, type) {
  const fn =
    type === 'update'
      ? (items, item) => items.map(i => (i.sortKey === item.sortKey ? item : i))
      : (items, item) => items.filter(i => i.sortKey !== item.sortKey);

  const currentNotes = notesCat.get();
  notesCat.set({
    ...currentNotes,
    items: fn(currentNotes.items || [], newNote),
  });

  const currentNote = noteCat.get();
  if (currentNote?.sortKey === newNote.sortKey) {
    noteCat.set(newNote);
  }

  const albumItems = albumItemsCat.get();
  if (albumItems?.items?.find(i => i.sortKey === newNote.sortKey)) {
    albumItemsCat.set({
      ...albumItems,
      items: fn(albumItems.items, newNote),
    });
  }

  const currentOnThisDayNotes = onThisDayNotesCat.get();
  const date = formatDate(newNote.createdAt);
  if (currentOnThisDayNotes?.[date]?.find(i => i.sortKey === newNote.sortKey)) {
    onThisDayNotesCat.set({
      ...currentOnThisDayNotes,
      [date]: fn(currentOnThisDayNotes[date] || [], newNote),
    });
  }
}

async function getAlbumIds(albumIds, albumDescription) {
  if (albumDescription) {
    const { data } = await createAlbum({ title: albumDescription });
    if (data) {
      albumsCat.set([...albumsCat.get(), data]);
      albumSelectedKeysCat.set([data.sortKey, ...albumSelectedKeysCat.get()]);
      albumDescriptionCat.set('');

      return [...(albumIds || []), data.sortKey];
    }
  }

  return albumIds;
}
