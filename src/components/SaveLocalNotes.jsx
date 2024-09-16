import { Spinner, Text } from '@radix-ui/themes';
import React from 'react';
import fastMemo from 'react-fast-memo';

import { eventEmitter, eventEmitterEvents } from '../shared/react/eventEmitter.js';
import { PageEmpty } from '../shared/react/PageEmpty.jsx';
import { actionTypes, dispatchAction, loadActionsFromLocalStorage } from '../store/allActions.js';
import { hasLocalNotesCat } from '../store/note/noteCats.js';

eventEmitter.on(eventEmitterEvents.loggedIn, async () => {
  if (hasLocalNotesCat.get() !== undefined) {
    return;
  }

  dispatchAction({ type: actionTypes.SAVE_LOCAL_NOTES_AND_ALBUMS });

  loadActionsFromLocalStorage();
});

export const SaveLocalNotes = fastMemo(() => {
  return (
    <PageEmpty>
      <Spinner size="3" />
      <Text mt="4">Encrypting and saving local notes to server...</Text>
    </PageEmpty>
  );
});
