import { localStorageKeys } from '../../lib/constants';
import { orderByPosition } from '../../shared/js/position';
import { eventEmitter, eventEmitterEvents } from '../../shared/react/eventEmitter';
import { LocalStorage } from '../../shared/react/LocalStorage';
import { isLoggedInCat } from '../../shared/react/store/sharedCats';
import {
  albumsCat,
  isCreatingAlbumCat,
  isDeletingAlbumCat,
  isLoadingAlbumsCat,
  isUpdatingAlbumCat,
} from './albumCats';
import { createAlbum, deleteAlbum, fetchAlbums, updateAlbum } from './albumNetwork';

export async function fetchAlbumsEffect() {
  if (!albumsCat.get()?.length) {
    const cachedAlbums = LocalStorage.get(localStorageKeys.albums);
    if (cachedAlbums?.length) {
      albumsCat.set(cachedAlbums);
    }
  }

  forceFetchAlbumsEffect();
}

async function forceFetchAlbumsEffect() {
  if (!isLoggedInCat.get()) {
    return;
  }

  isLoadingAlbumsCat.set(true);

  const { data } = await fetchAlbums();
  if (data) {
    albumsCat.set(data.items);
  }

  isLoadingAlbumsCat.set(false);
}

export async function createAlbumEffect({ sortKey, timestamp, title }) {
  if (!isLoggedInCat.get()) {
    return;
  }

  isCreatingAlbumCat.set(true);

  const { data } = await createAlbum({ sortKey, timestamp, title });
  if (data) {
    updateAlbumsState(data, 'update');
  }

  isCreatingAlbumCat.set(false);
}

export async function updateAlbumEffect(albumId, { encryptedPassword, title, position }) {
  if (!isLoggedInCat.get()) {
    return;
  }

  isUpdatingAlbumCat.set(true);

  const { data } = await updateAlbum(albumId, {
    encryptedPassword,
    title,
    position,
  });

  if (data) {
    updateAlbumsState(data, 'update');
  }

  isUpdatingAlbumCat.set(false);
}

export async function deleteAlbumEffect(albumId) {
  if (!isLoggedInCat.get()) {
    return;
  }

  isDeletingAlbumCat.set(true);

  const { data } = await deleteAlbum(albumId);

  if (data) {
    updateAlbumsState(data, 'delete');
  }

  isDeletingAlbumCat.set(false);
}

fetchAlbumsEffect();
eventEmitter.on(eventEmitterEvents.settingsFetched, () => fetchAlbumsEffect());

export function updateAlbumsState(newAlbum, type) {
  const albumsInState = albumsCat.get() || [];

  let newItems = albumsInState;
  if (type === 'update') {
    newItems = orderByPosition(
      newItems.map(item => (item.sortKey === newAlbum.sortKey ? newAlbum : item)),
      true
    );
  } else if (type === 'delete') {
    newItems = newItems.filter(item => item.sortKey !== newAlbum.sortKey);
  } else if (type === 'create') {
    newItems = [...newItems, newAlbum];
  }

  albumsCat.set(newItems);
  LocalStorage.set(localStorageKeys.albums, newItems);
}
