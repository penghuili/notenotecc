import { atom } from 'jotai';

import {
  updateAtomValue,
  useAtomValue,
} from '../../shared-private/react/store/atomHelpers';

const defaultAlbumItems = { items: [], startKey: null, hasMore: false, albumId: null };

export const albumItemsAtom = atom(defaultAlbumItems);
export const isLoadingAlbumItemsAtom = atom(false);

export function useAlbumNotes(albumId) {
  const albumItems = useAtomValue(albumItemsAtom);

  return albumItems.albumId === albumId ? albumItems : defaultAlbumItems;
}

export function resetAlbumItemsAtoms() {
  updateAtomValue(albumItemsAtom, defaultAlbumItems);
  updateAtomValue(isLoadingAlbumItemsAtom, false);
}
