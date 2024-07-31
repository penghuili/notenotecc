import { createCat, useCat } from 'usecat';

const defaultAlbumItems = { items: [], startKey: null, hasMore: false, albumId: null };

export const albumItemsCat = createCat(defaultAlbumItems);
export const isLoadingAlbumItemsCat = createCat(false);

export function useAlbumNotes(albumId) {
  const albumItems = useCat(albumItemsCat);

  return albumItems.albumId === albumId ? albumItems : defaultAlbumItems;
}
