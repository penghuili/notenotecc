import { formatDate } from '../../shared-private/js/date';
import { LocalStorage } from '../../shared-private/react/LocalStorage';
import { settingsCat } from '../../shared-private/react/store/sharedCats';
import {
  fetchSettingsEffect,
  goBackEffect,
  setToastEffect,
} from '../../shared-private/react/store/sharedEffects';
import { fetchAlbumsEffect } from '../album/albumEffects';
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
  encryptExistingNote,
  fetchNote,
  fetchNotes,
  noteCache,
  updateNote,
} from './noteNetwork';

const notesChangedAtKey = 'notenote-notesChangedAt';

export async function fetchNotesEffect(startKey, force) {
  const notesInState = notesCat.get();
  if (notesInState?.items?.length && !force) {
    return;
  }

  const settings = settingsCat.get();
  if (!startKey) {
    const cachedNotes = await noteCache.getCachedItems();
    if (cachedNotes?.items?.length) {
      notesCat.set(cachedNotes);

      if (!force) {
        const lastChangedAt = LocalStorage.get(notesChangedAtKey);
        if (lastChangedAt && settings?.notesChangedAt <= lastChangedAt) {
          return;
        }
      }
    }
  }

  isLoadingNotesCat.set(true);

  const { data } = await fetchNotes(startKey);
  if (data) {
    notesCat.set({
      items: startKey ? [...notesCat.get().items, ...data.items] : data.items,
      startKey: data.startKey,
      hasMore: data.hasMore,
    });

    LocalStorage.set(notesChangedAtKey, settings?.notesChangedAt);
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

export async function fetchNoteEffect(noteId) {
  const noteInState = noteCat.get();
  if (noteInState?.sortKey === noteId) {
    return;
  }

  const cachedNote = await noteCache.getCachedItem(noteId);
  if (cachedNote?.sortKey === noteId) {
    noteCat.set(cachedNote);
  }

  isLoadingNoteCat.set(true);

  const { data } = await fetchNote(noteId);
  if (data) {
    noteCat.set(data);
  }

  isLoadingNoteCat.set(false);
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

  const { data } = await createNote({
    note,
    images,
    albumIds,
    albumDescription,
  });
  if (data) {
    if (albumDescription) {
      await fetchAlbumsEffect(true);
    }

    const currentNotes = notesCat.get();
    notesCat.set({ ...currentNotes, items: [data, ...(currentNotes.items || [])] });

    setToastEffect('Encrypted and created!');

    if (onSucceeded) {
      onSucceeded(data);
    }
    if (goBack) {
      goBackEffect();
    }

    fetchSettingsEffect(true);
  }

  isCreatingNoteCat.set(false);
}

export async function updateNoteEffect(
  noteId,
  { encryptedPassword, note, albumIds, albumDescription, onSucceeded, goBack }
) {
  isUpdatingNoteCat.set(true);

  const { data } = await updateNote(noteId, {
    encryptedPassword,
    note,
    albumIds,
    albumDescription,
  });

  if (data) {
    if (albumDescription) {
      await fetchAlbumsEffect(true);
    }

    updateStates(data, 'update');

    setToastEffect('Encrypted and updated!');

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

    fetchSettingsEffect(true);
  }

  isDeletingImageCat.set(false);
}

export async function addImagesEffect(noteId, { encryptedPassword, images, onSucceeded, goBack }) {
  isAddingImagesCat.set(true);

  const { data } = await addImages(noteId, { encryptedPassword, images });

  if (data) {
    updateStates(data, 'update');

    setToastEffect('Encrypted and added!');

    if (onSucceeded) {
      onSucceeded(data);
    }
    if (goBack) {
      goBackEffect();
    }

    fetchSettingsEffect(true);
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

    fetchSettingsEffect(true);
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
      items: fn(albumItems.items || [], newNote),
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
