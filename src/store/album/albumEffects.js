import { albumDescriptionCat, albumSelectedKeysCat } from '../../components/AlbumsSelector.jsx';
import { localStorageKeys } from '../../lib/constants';
import { orderByPosition } from '../../shared/js/position';
import { eventEmitter, eventEmitterEvents } from '../../shared/react/eventEmitter';
import { LocalStorage } from '../../shared/react/LocalStorage';
import { settingsCat } from '../../shared/react/store/sharedCats';
import { goBackEffect, setToastEffect } from '../../shared/react/store/sharedEffects';
import { toastTypes } from '../../shared/react/Toast.jsx';
import {
  albumsCat,
  isCreatingAlbumCat,
  isDeletingAlbumCat,
  isLoadingAlbumsCat,
  isUpdatingAlbumCat,
} from './albumCats';
import { createAlbum, deleteAlbum, fetchAlbums, updateAlbum } from './albumNetwork';

const albumsChangedAtKey = 'notenote-albumsChangedAt';

export async function fetchAlbumsEffect(force) {
  const albumsInStore = albumsCat.get();
  if (albumsInStore?.length && !force) {
    return;
  }

  const settings = settingsCat.get();
  const cachedAlbums = LocalStorage.get(localStorageKeys.albums);
  if (cachedAlbums?.length) {
    albumsCat.set(cachedAlbums);

    if (!force) {
      const lastChangedAt = LocalStorage.get(albumsChangedAtKey);
      if (lastChangedAt && settings?.albumsChangedAt <= lastChangedAt) {
        return;
      }
    }
  }

  isLoadingAlbumsCat.set(true);

  const { data } = await fetchAlbums();
  if (data) {
    albumsCat.set(data.items);

    LocalStorage.set(albumsChangedAtKey, settingsCat.get()?.albumsChangedAt);
  }

  isLoadingAlbumsCat.set(false);
}

export async function createAlbumEffect({ title, onSucceeded, goBack }) {
  isCreatingAlbumCat.set(true);

  const { data } = await createAlbum({ title });
  if (data) {
    albumsCat.set([...albumsCat.get(), data]);
    albumSelectedKeysCat.set([data.sortKey, ...albumSelectedKeysCat.get()]);
    albumDescriptionCat.set('');

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
  setToastEffect('Encrypting ...', toastTypes.info);

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

    setToastEffect('Saved!');

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

eventEmitter.on(eventEmitterEvents.settingsFetched, () => fetchAlbumsEffect());
