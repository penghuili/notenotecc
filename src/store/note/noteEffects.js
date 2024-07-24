import {
  getAtomValue,
  updateAtomValue,
} from '../../shared-private/react/store/atomHelpers';
import {
  fetchSettingsEffect,
  goBackEffect,
  setToastEffect,
} from '../../shared-private/react/store/sharedEffects';
import { fetchAlbumsEffect } from '../album/albumEffects';
import { albumItemsAtom } from '../album/albumItemAtoms';
import {
  isAddingImagesAtom,
  isConvertingImagesAtom,
  isCreatingNoteAtom,
  isDeletingImageAtom,
  isDeletingNoteAtom,
  isLoadingNoteAtom,
  isLoadingNotesAtom,
  isLoadingOnThisDayNotesAtom,
  isUpdatingNoteAtom,
  noteAtom,
  notesAtom,
  onThisDayNotesAtom,
} from './noteAtoms';
import {
  addImages,
  convertNoteImages,
  createNote,
  deleteImage,
  deleteNote,
  fetchNote,
  fetchNotes,
  noteCache,
  updateNote,
} from './noteNetwork';

export async function fetchNotesEffect(startKey) {
  updateAtomValue(isLoadingNotesAtom, true);

  if (!startKey) {
    const cachedNotes = await noteCache.getCachedItems();
    if (cachedNotes?.length) {
      updateAtomValue(notesAtom, {
        items: cachedNotes,
        startKey: null,
        hasMore: cachedNotes.length >= 20,
      });
    }
  }

  const { data } = await fetchNotes(startKey);
  if (data) {
    updateAtomValue(notesAtom, {
      items: startKey ? [...getAtomValue(notesAtom).items, ...data.items] : data.items,
      startKey: data.startKey,
      hasMore: data.hasMore,
    });
  }

  updateAtomValue(isLoadingNotesAtom, false);
}

export async function fetchOnThisDayNotesEffect(type, startTime, endTime) {
  const onThisDayNotes = getAtomValue(onThisDayNotesAtom);
  if (onThisDayNotes[type]) {
    return;
  }

  updateAtomValue(isLoadingOnThisDayNotesAtom, true);

  const { data } = await fetchNotes(null, startTime, endTime);
  if (data?.items) {
    updateAtomValue(onThisDayNotesAtom, { ...onThisDayNotes, [type]: data.items.reverse() });
  }

  updateAtomValue(isLoadingOnThisDayNotesAtom, false);
}

export async function fetchNoteEffect(noteId) {
  const noteInState = getAtomValue(noteAtom);
  if (noteInState?.sortKey === noteId) {
    return;
  }

  const cachedNote = await noteCache.getCachedItem(noteId);
  if (cachedNote?.sortKey === noteId) {
    updateAtomValue(noteAtom, cachedNote);
  }

  updateAtomValue(isLoadingNoteAtom, true);

  const { data } = await fetchNote(noteId);
  if (data) {
    updateAtomValue(noteAtom, data);
  }

  updateAtomValue(isLoadingNoteAtom, false);
}

export function setNoteEffect(note) {
  updateAtomValue(noteAtom, note);
}

export async function createNoteEffect({
  note,
  images,
  albumIds,
  albumDescription,
  onSucceeded,
  goBack,
}) {
  updateAtomValue(isCreatingNoteAtom, true);

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

    const currentNotes = getAtomValue(notesAtom);
    updateAtomValue(notesAtom, { ...currentNotes, items: [data, ...(currentNotes.items || [])] });

    setToastEffect('Created!');

    if (onSucceeded) {
      onSucceeded(data);
    }
    if (goBack) {
      goBackEffect();
    }

    fetchSettingsEffect(true);
  }

  updateAtomValue(isCreatingNoteAtom, false);
}

export async function updateNoteEffect(
  noteId,
  { note, albumIds, albumDescription, onSucceeded, goBack }
) {
  updateAtomValue(isUpdatingNoteAtom, true);

  const { data } = await updateNote(noteId, { note, albumIds, albumDescription });

  if (data) {
    if (albumDescription) {
      await fetchAlbumsEffect(true);
    }

    updateStates(data, 'update');

    setToastEffect('Updated!');

    if (onSucceeded) {
      onSucceeded(data);
    }
    if (goBack) {
      goBackEffect();
    }
  }

  updateAtomValue(isUpdatingNoteAtom, false);
}

export async function deleteImageEffect(noteId, { imagePath, onSucceeded, goBack }) {
  updateAtomValue(isDeletingImageAtom, true);

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

  updateAtomValue(isDeletingImageAtom, false);
}

export async function addImagesEffect(noteId, { images, onSucceeded, goBack }) {
  updateAtomValue(isAddingImagesAtom, true);

  const { data } = await addImages(noteId, images);

  if (data) {
    updateStates(data, 'update');

    setToastEffect('Added!');

    if (onSucceeded) {
      onSucceeded(data);
    }
    if (goBack) {
      goBackEffect();
    }

    fetchSettingsEffect(true);
  }

  updateAtomValue(isAddingImagesAtom, false);
}

export async function convertNoteImagesEffect(note, { onSucceeded, goBack }) {
  updateAtomValue(isConvertingImagesAtom, true);

  const { data } = await convertNoteImages(note);

  if (data) {
    updateStates(data, 'update');

    setToastEffect('Converted!');

    if (onSucceeded) {
      onSucceeded(data);
    }
    if (goBack) {
      goBackEffect();
    }

    fetchSettingsEffect(true);
  }

  updateAtomValue(isConvertingImagesAtom, false);
}

export async function deleteNoteEffect(noteId, { onSucceeded, goBack }) {
  updateAtomValue(isDeletingNoteAtom, true);

  const { error } = await deleteNote(noteId);

  if (!error) {
    updateStates({ sortKey: noteId }, 'delete');

    setToastEffect('Deleted!');

    if (onSucceeded) {
      onSucceeded();
    }
    if (goBack) {
      goBackEffect();
    }

    fetchSettingsEffect(true);
  }

  updateAtomValue(isDeletingNoteAtom, false);
}

function updateStates(newNote, type) {
  const fn =
    type === 'update'
      ? (items, item) => items.map(i => (i.sortKey === item.sortKey ? item : i))
      : (items, item) => items.filter(i => i.sortKey !== item.sortKey);

  const currentNotes = getAtomValue(notesAtom);
  updateAtomValue(notesAtom, {
    ...currentNotes,
    items: fn(currentNotes.items || [], newNote),
  });

  const currentNote = getAtomValue(noteAtom);
  if (currentNote?.sortKey === newNote.sortKey) {
    updateAtomValue(noteAtom, newNote);
  }

  const albumItems = getAtomValue(albumItemsAtom);
  if (albumItems?.items?.find(i => i.sortKey === newNote.sortKey)) {
    updateAtomValue(albumItemsAtom, {
      ...albumItems,
      items: fn(albumItems.items || [], newNote),
    });
  }

  const currentOnThisDayNotes = getAtomValue(onThisDayNotesAtom);
  const types = Object.keys(currentOnThisDayNotes);
  if (types.length) {
    const updatedItems = types.map(type => ({
      type,
      items: fn(currentOnThisDayNotes[type] || [], newNote),
    }));
    const newOnThisDayNotes = updatedItems.reduce(
      (acc, item) => ({ ...acc, [item.type]: item.items }),
      {}
    );
    updateAtomValue(onThisDayNotesAtom, newOnThisDayNotes);
  }
}
