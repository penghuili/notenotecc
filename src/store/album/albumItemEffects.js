import { idbStorage } from '../../shared-private/react/indexDB';
import { albumItemsCat, isLoadingAlbumItemsCat } from './albumItemCats';
import { fetchAlbumItems } from './albumNetwork';

export async function fetchAlbumItemsEffect(albumId, { startKey }) {
  isLoadingAlbumItemsCat.set(true);

  if (!startKey) {
    const cachedAlbumItems = await idbStorage.getItem(albumId);
    if (cachedAlbumItems?.length) {
      albumItemsCat.set({
        items: cachedAlbumItems,
        albumId,
        startKey: null,
        hasMore: false,
      });
    }
  }

  const { data } = await fetchAlbumItems(albumId, { startKey });
  if (data) {
    albumItemsCat.set({
      items: startKey ? [...albumItemsCat.get().items, ...data.items] : data.items,
      startKey: data.startKey,
      hasMore: data.hasMore,
      albumId,
    });
  }

  isLoadingAlbumItemsCat.set(false);
}
