import { Text } from '@radix-ui/themes';
import React, { useMemo } from 'react';
import { useCat } from 'usecat';

import { Banner } from '../shared/react/Banner.jsx';
import { RouteLink } from '../shared/react/my-router.jsx';
import { isLoggedInCat } from '../shared/react/store/sharedCats';
import { notesCat } from '../store/note/noteCats.js';

export const BackupBitte = React.memo(() => {
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
