import { useMemo } from 'react';
import { createCat, useCat } from 'usecat';

import { arrayToObject } from '../../shared/js/object';

export const albumsCat = createCat([]);
export const isLoadingAlbumsCat = createCat(false);
export const isCreatingAlbumCat = createCat(false);
export const isUpdatingAlbumCat = createCat(false);
export const isDeletingAlbumCat = createCat(false);

export function useAlbumsObject() {
  const albums = useCat(albumsCat);
  return useMemo(() => arrayToObject(albums, 'sortKey'), [albums]);
}

export function useAlbum(albumId) {
  return useCat(albumsCat, albums => findAlbum(albums, albumId));
}

export function findAlbum(albums, albumId) {
  return albums?.find(album => album?.sortKey === albumId);
}
