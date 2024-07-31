import { createCat, useCat } from '../../shared-private/react/store/cat';

export const notesCat = createCat({});
export const isLoadingNotesCat = createCat(false);
export const noteCat = createCat(null);
export const isLoadingNoteCat = createCat(false);
export const isCreatingNoteCat = createCat(false);
export const isUpdatingNoteCat = createCat(false);
export const isDeletingImageCat = createCat(false);
export const isAddingImagesCat = createCat(false);
export const isDeletingNoteCat = createCat(false);
export const fullScreenImageUrlCat = createCat(null);
export const onThisDayNotesCat = createCat({});
export const isLoadingOnThisDayNotesCat = createCat(false);
export const randomDateCat = createCat(null);

export function useNote(noteId) {
  const note = useCat(noteCat);
  return note?.sortKey === noteId ? note : null;
}
