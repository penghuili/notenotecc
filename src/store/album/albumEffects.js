import { orderByPosition } from '../../shared-private/js/position';
import {
  eventEmitter,
  eventEmitterEvents,
} from '../../shared-private/react/eventEmitter';
import {
  getAtomValue,
  updateAtomValue,
} from '../../shared-private/react/store/atomHelpers';
import {
  goBackEffect,
  setToastEffect,
} from '../../shared-private/react/store/sharedEffects';
import {
  albumsAtom,
  isCreatingAlbumAtom,
  isDeletingAlbumAtom,
  isLoadingAlbumsAtom,
  isUpdatingAlbumAtom,
} from './albumAtoms';
import {
  albumCache,
  createAlbum,
  deleteAlbum,
  fetchAlbums,
  updateAlbum,
} from './albumNetwork';

export async function fetchAlbumsEffect(force) {
  const albumsInStore = getAtomValue(albumsAtom);
  if (albumsInStore?.length && !force) {
    return;
  }

  const cachedAlbums = await albumCache.getCachedItems();
  if (cachedAlbums?.length) {
    updateAtomValue(albumsAtom, cachedAlbums);
  }

  updateAtomValue(isLoadingAlbumsAtom, true);

  const { data } = await fetchAlbums();
  if (data) {
    updateAtomValue(albumsAtom, data.items);
  }

  updateAtomValue(isLoadingAlbumsAtom, false);
}

export async function createAlbumEffect({ title, onSucceeded, goBack }) {
  updateAtomValue(isCreatingAlbumAtom, true);

  const { data } = await createAlbum({ title });
  if (data) {
    updateAtomValue(albumsAtom, [data, ...getAtomValue(albumsAtom)]);

    setToastEffect('Created!');

    if (onSucceeded) {
      onSucceeded(data);
    }
    if (goBack) {
      goBackEffect();
    }
  }

  updateAtomValue(isCreatingAlbumAtom, false);
}

export async function updateAlbumEffect(albumId, { title, onSucceeded, goBack }) {
  updateAtomValue(isUpdatingAlbumAtom, true);

  const { data } = await updateAlbum(albumId, {
    title,
  });

  if (data) {
    updateAtomValue(
      albumsAtom,
      orderByPosition(getAtomValue(albumsAtom) || []).map(album =>
        album.sortKey === albumId ? data : album
      )
    );

    setToastEffect('Updated!');

    if (onSucceeded) {
      onSucceeded(data);
    }
    if (goBack) {
      goBackEffect();
    }
  }

  updateAtomValue(isUpdatingAlbumAtom, false);
}

export async function deleteAlbumEffect(albumId, { onSucceeded, goBack }) {
  updateAtomValue(isDeletingAlbumAtom, true);

  const { data } = await deleteAlbum(albumId);

  if (data) {
    updateAtomValue(
      albumsAtom,
      (getAtomValue(albumsAtom) || []).filter(album => album.sortKey !== albumId)
    );

    setToastEffect('Deleted!');

    if (onSucceeded) {
      onSucceeded();
    }
    if (goBack) {
      goBackEffect();
    }
  }

  updateAtomValue(isDeletingAlbumAtom, false);
}

eventEmitter.on(eventEmitterEvents.loggedIn, fetchAlbumsEffect);
