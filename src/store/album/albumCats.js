import { useMemo } from 'react';
import { createCat, useCat } from 'usecat';

import { arrayToObject } from '../../shared-private/js/object';

export const albumsCat = createCat([]);
export const isLoadingAlbumsCat = createCat(false);
export const isCreatingAlbumCat = createCat(false);
export const isUpdatingAlbumCat = createCat(false);
export const isDeletingAlbumCat = createCat(false);

export function useAlbumsObject() {
  const albums = useCat(albumsCat);
  return arrayToObject(albums, 'sortKey');
}

export function useAlbum(albumId) {
  const albums = useCat(albumsCat);
  const album = useMemo(() => albums?.find(album => album?.sortKey === albumId), [albums, albumId]);

  return album;
}
