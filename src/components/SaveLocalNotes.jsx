import { Spinner, Text } from '@radix-ui/themes';
import React from 'react';
import { createCat } from 'usecat';

import { localStorageKeys } from '../lib/constants.js';
import { asyncForEach } from '../shared/js/asyncForEach.js';
import { eventEmitter, eventEmitterEvents } from '../shared/react/eventEmitter.js';
import { LocalStorage } from '../shared/react/LocalStorage.js';
import { PageEmpty } from '../shared/react/PageEmpty.jsx';
import { createAlbumEffect } from '../store/album/albumEffects.js';
import { createNoteEffect } from '../store/note/noteEffects.js';

export const hasLocalNotesCat = createCat(false);

eventEmitter.on(eventEmitterEvents.loggedIn, async () => {
  const localNotes =
    LocalStorage.get(localStorageKeys.notes)?.items?.filter(
      note => note.isLocal && !note.isWelcome
    ) || [];
  const localAlbums =
    LocalStorage.get(localStorageKeys.albums)?.filter(album => album.isLocal) || [];

  const hasLocal = !!localNotes.length || !!localAlbums.length;
  hasLocalNotesCat.set(hasLocal);

  if (hasLocal) {
    await asyncForEach(localAlbums, async album => {
      await createAlbumEffect({
        sortKey: album.sortKey,
        timestamp: album.createdAt,
        title: album.title,
      });
    });

    await asyncForEach(localNotes, async note => {
      await createNoteEffect({
        sortKey: note.sortKey,
        timestamp: note.createdAt,
        note: note.note,
        images: note.images,
        albumIds: note.albumIds,
      });
    });

    hasLocalNotesCat.set(false);
  }
});

export const SaveLocalNotes = React.memo(() => {
  return (
    <PageEmpty>
      <Spinner size="3" />
      <Text mt="4">Encrypting and saving local notes to server...</Text>
    </PageEmpty>
  );
});
