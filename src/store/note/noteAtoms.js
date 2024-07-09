import { atom } from 'jotai';

import { updateAtomValue } from '../../shared-private/react/store/atomHelpers';

export const notesAtom = atom({});
export const isLoadingNotesAtom = atom(false);
export const noteAtom = atom(null);
export const isLoadingNoteAtom = atom(false);
export const isCreatingNoteAtom = atom(false);
export const isUpdatingNoteAtom = atom(false);
export const isDeletingImageAtom = atom(false);
export const isAddingImagesAtom = atom(false);
export const isUpdatingImageUrlsAtom = atom(false);
export const isDeletingNoteAtom = atom(false);
export const fullScreenImageUrlAtom = atom(null);

export function resetNoteAtoms() {
  updateAtomValue(notesAtom, {});
  updateAtomValue(isLoadingNotesAtom, false);
  updateAtomValue(noteAtom, null);
  updateAtomValue(isLoadingNoteAtom, false);
  updateAtomValue(isCreatingNoteAtom, false);
  updateAtomValue(isUpdatingNoteAtom, false);
  updateAtomValue(isDeletingImageAtom, false);
  updateAtomValue(isAddingImagesAtom, false);
  updateAtomValue(isUpdatingImageUrlsAtom, false);
  updateAtomValue(isDeletingNoteAtom, false);
  updateAtomValue(fullScreenImageUrlAtom, null);
}
