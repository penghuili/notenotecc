import { getAtomValue, updateAtomValue } from '../../shared-private/react/store/atomHelpers';
import { goBackEffect, setToastEffect } from '../../shared-private/react/store/sharedEffects';
import { fetchAlbumsEffect } from '../album/albumEffects';
import {
  isAddingImagesAtom,
  isCreatingNoteAtom,
  isDeletingImageAtom,
  isDeletingNoteAtom,
  isLoadingNoteAtom,
  isLoadingNotesAtom,
  isUpdatingImageUrlsAtom,
  isUpdatingNoteAtom,
  noteAtom,
  notesAtom,
} from './noteAtoms';
import {
  addImages,
  createNote,
  deleteImage,
  deleteNote,
  fetchNote,
  fetchNotes,
  noteCache,
  updateImageUrls,
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
    updateAtomValue(notesAtom, data);
  }

  updateAtomValue(isLoadingNotesAtom, false);
}

export async function fetchNoteEffect(noteId) {
  updateAtomValue(isLoadingNoteAtom, true);

  const cachedNote = await noteCache.getCachedItem(noteId);
  updateAtomValue(noteAtom, cachedNote || null);

  const { data } = await fetchNote(noteId);
  if (data) {
    updateAtomValue(noteAtom, data);
  }

  updateAtomValue(isLoadingNoteAtom, false);
}

export async function createNoteEffect({
  note,
  canvases,
  albumIds,
  albumDescription,
  onSucceeded,
  goBack,
}) {
  updateAtomValue(isCreatingNoteAtom, true);

  const { data } = await createNote({
    note,
    canvases,
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

    const currentNotes = getAtomValue(notesAtom);
    updateAtomValue(notesAtom, {
      ...currentNotes,
      items: (currentNotes.items || []).map(note => (note.sortKey === data.sortKey ? data : note)),
    });

    const currentNoteDetails = getAtomValue(noteAtom);
    if (currentNoteDetails?.sortKey === data.sortKey) {
      updateAtomValue(noteAtom, data);
    }

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
    const currentNotes = getAtomValue(notesAtom);
    updateAtomValue(notesAtom, {
      ...currentNotes,
      items: (currentNotes.items || []).map(note => (note.sortKey === data.sortKey ? data : note)),
    });

    const currentNoteDetails = getAtomValue(noteAtom);
    if (currentNoteDetails?.sortKey === data.sortKey) {
      updateAtomValue(noteAtom, data);
    }

    setToastEffect('Deleted!');

    if (onSucceeded) {
      onSucceeded(data);
    }
    if (goBack) {
      goBackEffect();
    }
  }

  updateAtomValue(isDeletingImageAtom, false);
}

export async function addImagesEffect(noteId, { canvases, onSucceeded, goBack }) {
  updateAtomValue(isAddingImagesAtom, true);

  const { data } = await addImages(noteId, canvases);

  if (data) {
    const currentNotes = getAtomValue(notesAtom);
    updateAtomValue(notesAtom, {
      ...currentNotes,
      items: (currentNotes.items || []).map(note => (note.sortKey === data.sortKey ? data : note)),
    });

    const currentNoteDetails = getAtomValue(noteAtom);
    if (currentNoteDetails?.sortKey === data.sortKey) {
      updateAtomValue(noteAtom, data);
    }

    setToastEffect('Added!');

    if (onSucceeded) {
      onSucceeded(data);
    }
    if (goBack) {
      goBackEffect();
    }
  }

  updateAtomValue(isAddingImagesAtom, false);
}

export async function updateImageUrlsEffect(noteId, { onSucceeded, goBack, showSuccess }) {
  updateAtomValue(isUpdatingImageUrlsAtom, true);

  const { data } = await updateImageUrls(noteId);

  if (data) {
    const currentNotes = getAtomValue(notesAtom);
    updateAtomValue(notesAtom, {
      ...currentNotes,
      items: (currentNotes.items || []).map(note => (note.sortKey === data.sortKey ? data : note)),
    });

    const currentNoteDetails = getAtomValue(noteAtom);
    if (currentNoteDetails?.sortKey === data.sortKey) {
      updateAtomValue(noteAtom, data);
    }

    if (showSuccess) {
      setToastEffect('Updated!');
    }

    if (onSucceeded) {
      onSucceeded(data);
    }
    if (goBack) {
      goBackEffect();
    }
  }

  updateAtomValue(isUpdatingImageUrlsAtom, false);
}

export async function deleteNoteEffect(noteId, { onSucceeded, goBack }) {
  updateAtomValue(isDeletingNoteAtom, true);

  const { error } = await deleteNote(noteId);

  if (!error) {
    const currentNotes = getAtomValue(notesAtom);
    updateAtomValue(notesAtom, {
      ...currentNotes,
      items: (currentNotes.items || []).filter(note => note.sortKey !== noteId),
    });

    setToastEffect('Deleted!');

    if (onSucceeded) {
      onSucceeded();
    }
    if (goBack) {
      goBackEffect();
    }
  }

  updateAtomValue(isDeletingNoteAtom, false);
}
