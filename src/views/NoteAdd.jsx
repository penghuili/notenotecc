import { Text } from '@radix-ui/themes';
import React, { useCallback } from 'react';
import { navigateTo, replaceTo } from 'react-baby-router';
import fastMemo from 'react-fast-memo';

import { PrepareData } from '../components/PrepareData.jsx';
import { generateNoteSortKey } from '../lib/generateSortKey.js';
import { PageEmpty } from '../shared/react/PageEmpty.jsx';
import { objectToQueryString } from '../shared/react/routeHelpers.js';
import { actionTypes, dispatchAction } from '../store/allActions.js';
import { noteCat } from '../store/note/noteCats.js';

export const NoteAdd = fastMemo(({ queryParams: { cameraType } }) => {
  const prepareData = useCallback(async () => {
    const timestamp = Date.now();
    const sortKey = generateNoteSortKey(timestamp);
    dispatchAction({
      type: actionTypes.CREATE_NOTE,
      payload: { sortKey, timestamp, note: '' },
    });

    const note = noteCat.get();
    if (note) {
      replaceTo(`/notes/details?noteId=${note.sortKey}&add=1`);
      if (cameraType) {
        const query = objectToQueryString({ noteId: note.sortKey, cameraType });
        navigateTo(`/add-images?${query}`);
      }
    }
  }, [cameraType]);

  return (
    <PrepareData load={prepareData}>
      <PageEmpty>
        <Text>Something went wrong.</Text>
      </PageEmpty>
    </PrepareData>
  );
});
