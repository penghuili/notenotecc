import { Spinner } from '@radix-ui/themes';
import React from 'react';

import { PageEmpty } from './PageEmpty.jsx';

export const PageLoading = React.memo(() => {
  return (
    <PageEmpty>
      <Spinner size="3" />
    </PageEmpty>
  );
});
