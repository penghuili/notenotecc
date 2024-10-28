import { Spin, Typography } from '@douyinfe/semi-ui';
import React from 'react';
import fastMemo from 'react-fast-memo';

import { eventEmitter, eventEmitterEvents } from '../shared/browser/eventEmitter.js';
import { PageEmpty } from '../shared/semi/PageEmpty.jsx';
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
      <Spin size="large" />
      <Typography.Paragraph style={{ marginTop: '2rem' }}>
        Encrypting and saving local notes to server...
      </Typography.Paragraph>
    </PageEmpty>
  );
});
