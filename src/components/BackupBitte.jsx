import { Text } from '@radix-ui/themes';
import React, { useMemo } from 'react';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { isLoggedInCat } from '../shared/browser/store/sharedCats';
import { Banner } from '../shared/radix/Banner.jsx';
import { RouteLink } from '../shared/radix/RouteLink.jsx';
import { notesCat } from '../store/note/noteCats.js';

export const BackupBitte = fastMemo(() => {
  const isLoggedIn = useCat(isLoggedInCat);
  const notes = useCat(notesCat);
  const hasOwnNote = useMemo(() => {
    return notes?.items?.find(n => !n.isWelcome);
  }, [notes]);

  if (isLoggedIn || !hasOwnNote) {
    return null;
  }

  return (
    <Banner open>
      <Text>
        <RouteLink to="/sign-up">Create an account</RouteLink> to backup your notes.
      </Text>
    </Banner>
  );
});
