import { orderByPosition } from '../../shared-private/js/position';
import { createItemsCache } from '../../shared-private/react/cacheItems';
import { HTTP } from '../../shared-private/react/HTTP';
import { idbStorage } from '../../shared-private/react/indexDB';
import { appName } from '../../shared-private/react/initShared';
import { objectToQueryString } from '../../shared-private/react/routeHelpers';

export const albumCache = createItemsCache('simplestcam-album');

export async function fetchAlbums() {
  try {
    const albums = await HTTP.get(appName, `/v1/albums`);
    const sorted = orderByPosition(albums);

    await albumCache.cacheItems(sorted);

    return {
      data: { items: sorted },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

export async function fetchAlbumItems(albumId, { startKey }) {
  try {
    const query = objectToQueryString({ startKey });
    const {
      items,
      startKey: newStartKey,
      limit,
    } = await HTTP.get(appName, `/v1/albums/${albumId}/notes${query ? `?${query}` : ''}`);

    if (!startKey) {
      await idbStorage.setItem(albumId, items);
    }

    return {
      data: {
        items: items.filter(item => !!item),
        startKey: newStartKey,
        hasMore: items.length >= limit,
      },
      error: null,
    };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createAlbum({ title }) {
  try {
    const data = await HTTP.post(appName, `/v1/albums`, {
      title,
    });

    await updateCache(data, 'create');

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateAlbum(albumId, { title, position }) {
  try {
    const data = await HTTP.put(appName, `/v1/albums/${albumId}`, {
      title,
      position,
    });

    await updateCache(data, 'update');

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteAlbum(albumId) {
  try {
    const data = await HTTP.delete(appName, `/v1/albums/${albumId}`);

    await updateCache({ sortKey: albumId }, 'delete');

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

async function updateCache(album, type) {
  const cachedItems = (await albumCache.getCachedItems()) || [];

  let newItems = cachedItems;
  if (type === 'update') {
    newItems = orderByPosition(
      cachedItems.map(item => (item.sortKey === album.sortKey ? album : item))
    );
  } else if (type === 'delete') {
    newItems = cachedItems.filter(item => item.sortKey !== album.sortKey);
  } else if (type === 'create') {
    newItems = [album, ...cachedItems];
  }

  await albumCache.cacheItems(newItems);
}
