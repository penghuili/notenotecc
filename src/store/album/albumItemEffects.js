import { idbStorage } from '../../shared-private/react/indexDB';
import { getAtomValue, updateAtomValue } from '../../shared-private/react/store/atomHelpers';
import { albumItemsAtom, isLoadingAlbumItemsAtom } from './albumItemAtoms';
import { fetchAlbumItems } from './albumNetwork';

export async function fetchAlbumItemsEffect(albumId, { startKey }) {
  updateAtomValue(isLoadingAlbumItemsAtom, true);

  if (!startKey) {
    const cachedAlbumItems = await idbStorage.getItem(albumId);
    if (cachedAlbumItems?.length) {
      updateAtomValue(albumItemsAtom, {
        items: cachedAlbumItems,
        albumId,
        startKey: null,
        hasMore: false,
      });
    }
  }

  const { data } = await fetchAlbumItems(albumId, { startKey });
  if (data) {
    updateAtomValue(albumItemsAtom, {
      items: startKey ? [...getAtomValue(albumItemsAtom).items, ...data.items] : data.items,
      startKey: data.startKey,
      hasMore: data.hasMore,
      albumId,
    });
  }

  updateAtomValue(isLoadingAlbumItemsAtom, false);
}
