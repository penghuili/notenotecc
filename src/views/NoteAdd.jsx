import { useEffect } from 'react';
import { navigateTo, replaceTo } from 'react-baby-router';
import fastMemo from 'react-fast-memo';

import { imagesCat } from '../components/Camera.jsx';
import { generateNoteSortKey } from '../lib/generateSortKey.js';
import { objectToQueryString } from '../shared/browser/routeHelpers.js';
import { actionTypes, dispatchAction } from '../store/allActions.js';
import { noteCat } from '../store/note/noteCats.js';

export const NoteAdd = fastMemo(({ queryParams: { cameraType } }) => {
  useEffect(() => {
    const timestamp = Date.now();
    const sortKey = generateNoteSortKey(timestamp);
    dispatchAction({
      type: actionTypes.CREATE_NOTE,
      payload: { sortKey, timestamp, note: '' },
    });

    const note = noteCat.get();
    if (note) {
      const query = objectToQueryString({ noteId: note.sortKey });
      replaceTo(`/notes/details?${query}`);
      if (cameraType) {
        requestAnimationFrame(() => {
          imagesCat.reset();
          const query = objectToQueryString({ noteId: note.sortKey, cameraType });
          navigateTo(`/add-images?${query}`);
        });
      }
    }
  }, [cameraType]);

  console.log('add note');
  return null;
});
