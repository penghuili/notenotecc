import { atom, useAtomValue } from 'jotai';
import { useMemo } from 'react';

import { arrayToObject } from '../../shared-private/js/object';
import { updateAtomValue } from '../../shared-private/react/store/atomHelpers';

export const albumsAtom = atom([]);
export const isLoadingAlbumsAtom = atom(false);
export const isCreatingAlbumAtom = atom(false);
export const isUpdatingAlbumAtom = atom(false);
export const isDeletingAlbumAtom = atom(false);

export const albumsObjectAtom = atom(get => {
  const albums = get(albumsAtom);
  return arrayToObject(albums, 'sortKey');
});

export function useAlbum(albumId) {
  const albums = useAtomValue(albumsAtom);
  const album = useMemo(() => albums?.find(album => album?.sortKey === albumId), [albums, albumId]);

  return album;
}

export function resetAlbumAtoms() {
  updateAtomValue(albumsAtom, []);
  updateAtomValue(isLoadingAlbumsAtom, false);
  updateAtomValue(isCreatingAlbumAtom, false);
  updateAtomValue(isUpdatingAlbumAtom, false);
  updateAtomValue(isDeletingAlbumAtom, false);
}
