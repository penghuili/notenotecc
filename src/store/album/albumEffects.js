import { orderByPosition } from '../../shared-private/js/position';
import {
  eventEmitter,
  eventEmitterEvents,
} from '../../shared-private/react/eventEmitter';
import {
  goBackEffect,
  setToastEffect,
} from '../../shared-private/react/store/sharedEffects';
import {
  albumsCat,
  isCreatingAlbumCat,
  isDeletingAlbumCat,
  isLoadingAlbumsCat,
  isUpdatingAlbumCat,
} from './albumCats';
import {
  albumCache,
  createAlbum,
  deleteAlbum,
  fetchAlbums,
  updateAlbum,
} from './albumNetwork';

export async function fetchAlbumsEffect(force) {
  const albumsInStore = albumsCat.get();
  if (albumsInStore?.length && !force) {
    return;
  }

  const cachedAlbums = await albumCache.getCachedItems();
  if (cachedAlbums?.length) {
    albumsCat.set(cachedAlbums);
  }

  isLoadingAlbumsCat.set(true);

  const { data } = await fetchAlbums();
  if (data) {
    albumsCat.set(data.items);
  }

  isLoadingAlbumsCat.set(false);
}

export async function createAlbumEffect({ title, onSucceeded, goBack }) {
  isCreatingAlbumCat.set(true);

  const { data } = await createAlbum({ title });
  if (data) {
    albumsCat.set([data, ...albumsCat.get()]);

    setToastEffect('Encrypted and created!');

    if (onSucceeded) {
      onSucceeded(data);
    }
    if (goBack) {
      goBackEffect();
    }
  }

  isCreatingAlbumCat.set(false);
}

export async function updateAlbumEffect(
  albumId,
  { encryptedPassword, title, position, onSucceeded, goBack }
) {
  isUpdatingAlbumCat.set(true);

  const { data } = await updateAlbum(albumId, {
    encryptedPassword,
    title,
    position,
  });

  if (data) {
    const newAlbums = orderByPosition(
      (albumsCat.get() || []).map(album => (album.sortKey === albumId ? data : album)),
      true
    );
    albumsCat.set(newAlbums);

    setToastEffect('Encrypted and updated!');

    if (onSucceeded) {
      onSucceeded(data);
    }
    if (goBack) {
      goBackEffect();
    }
  }

  isUpdatingAlbumCat.set(false);
}

export async function deleteAlbumEffect(albumId, { onSucceeded, goBack }) {
  isDeletingAlbumCat.set(true);

  const { data } = await deleteAlbum(albumId);

  if (data) {
    albumsCat.set((albumsCat.get() || []).filter(album => album.sortKey !== albumId));

    setToastEffect('Deleted!');

    if (onSucceeded) {
      onSucceeded();
    }
    if (goBack) {
      goBackEffect();
    }
  }

  isDeletingAlbumCat.set(false);
}

eventEmitter.on(eventEmitterEvents.loggedIn, () => fetchAlbumsEffect());
