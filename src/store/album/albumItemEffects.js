import { LocalStorage } from '../../shared/react/LocalStorage';
import { albumItemsCat, isLoadingAlbumItemsCat } from './albumItemCats';
import { fetchAlbumItems } from './albumNetwork';

export async function fetchAlbumItemsEffect(albumId, { startKey }) {
  if (!startKey) {
    const cachedAlbumItems = LocalStorage.get(albumId);
    if (cachedAlbumItems?.length) {
      albumItemsCat.set({
        items: cachedAlbumItems,
        albumId,
        startKey: null,
        hasMore: false,
      });
    }
  }

  if (albumItemsCat.get()?.items?.length) {
    forceFetchAlbumItemsEffect(albumId, { startKey });
  } else {
    await forceFetchAlbumItemsEffect(albumId, { startKey });
  }
}

async function forceFetchAlbumItemsEffect(albumId, { startKey }) {
  isLoadingAlbumItemsCat.set(true);

  const { data } = await fetchAlbumItems(albumId, { startKey });
  if (data) {
    albumItemsCat.set({
      items: startKey ? [...albumItemsCat.get().items, ...data.items] : data.items,
      albumId,
      startKey: data.startKey,
      hasMore: data.hasMore,
    });
  }

  isLoadingAlbumItemsCat.set(false);
}
