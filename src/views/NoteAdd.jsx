import { Text } from '@radix-ui/themes';
import React, { useCallback } from 'react';

import { PrepareData } from '../components/PrepareData.jsx';
import { generateNoteSortKey } from '../lib/generateSortKey.js';
import { navigate, replaceTo } from '../shared/react/my-router.jsx';
import { PageEmpty } from '../shared/react/PageEmpty.jsx';
import { objectToQueryString } from '../shared/react/routeHelpers.js';
import { actionTypes, dispatchAction } from '../store/allActions.js';
import { noteCat } from '../store/note/noteCats.js';

export const NoteAdd = React.memo(({ queryParams: { cameraType } }) => {
  const prepareData = useCallback(async () => {
    const timestamp = Date.now();
    const sortKey = generateNoteSortKey(timestamp);
    dispatchAction({
      type: actionTypes.CREATE_NOTE,
      payload: { sortKey, timestamp, note: '' },
    });

    const note = noteCat.get();
    if (note) {
      replaceTo(`/notes/${note.sortKey}?add=1`);
      const query = objectToQueryString({ cameraType, add: 1 });
      if (query) {
        navigate(`/notes/${note.sortKey}?${query}`);
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
