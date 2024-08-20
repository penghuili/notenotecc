import { Flex, Text } from '@radix-ui/themes';
import React, { useCallback } from 'react';

import { PrepareData } from '../components/PrepareData.jsx';
import { useScrollToTop } from '../lib/useScrollToTop.js';
import { navigate, replaceTo } from '../shared/react/my-router.jsx';
import { objectToQueryString } from '../shared/react/routeHelpers.js';
import { noteCat } from '../store/note/noteCats.js';
import { createNoteEffect } from '../store/note/noteEffects';

export const NoteAdd = React.memo(({ queryParams: { cameraType, editor } }) => {
  const prepareData = useCallback(async () => {
    await createNoteEffect({ note: '', goBack: false, showSuccess: false });
    const note = noteCat.get();
    if (note) {
      replaceTo(`/notes/${note.sortKey}`);
      const query = objectToQueryString({ cameraType, editor });
      if (query) {
        navigate(`/notes/${note.sortKey}?${query}`);
      }
    }
  }, [cameraType, editor]);

  useScrollToTop();

  return (
    <PrepareData load={prepareData}>
      <Flex justify="center" py="8">
        <Text>Something went wrong.</Text>
      </Flex>
    </PrepareData>
  );
});
