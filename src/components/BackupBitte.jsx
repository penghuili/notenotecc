import { Banner, Typography } from '@douyinfe/semi-ui';
import React, { useMemo } from 'react';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { isLoggedInCat } from '../shared/browser/store/sharedCats';
import { RouteLink } from '../shared/semi/RouteLink.jsx';
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
    <Banner
      fullMode={false}
      type="warning"
      bordered
      icon={null}
      closeIcon={null}
      description={
        <Typography.Text>
          <RouteLink to="/sign-up">Create an account</RouteLink> to backup your notes.
        </Typography.Text>
      }
      style={{ margin: '1rem 0' }}
    />
  );
});
