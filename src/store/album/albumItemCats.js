import { createCat, useCat } from 'usecat';

const defaultAlbumItems = { items: [], startKey: null, hasMore: false, albumId: null };

export const albumItemsCat = createCat(defaultAlbumItems);
export const isLoadingAlbumItemsCat = createCat(false);

export function useAlbumNotes(albumId) {
  return useCat(albumItemsCat, data => (data.albumId === albumId ? data : defaultAlbumItems));
}
