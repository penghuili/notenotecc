import React, { useEffect } from 'react';

import { replaceTo } from '../shared/react/my-router.jsx';
import { PageLoading } from './PageLoading.jsx';

export const Waiting = React.memo(() => {
  useEffect(() => {
    setTimeout(async () => {
      replaceTo('/');
    }, 500);
  }, []);

  return <PageLoading />;
});
