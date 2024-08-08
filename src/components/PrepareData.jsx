import { Flex, Text } from '@radix-ui/themes';
import React, { useEffect, useState } from 'react';

import { PageLoading } from './PageLoading.jsx';

const PrepareDataStatus = {
  pending: 'pending',
  error: 'error',
  ready: 'ready',
};

export const PrepareData = React.memo(({ load, children, source }) => {
  const [status, setStatus] = useState(PrepareDataStatus.pending);

  useEffect(() => {
    if (!load) {
      setStatus(PrepareDataStatus.ready);
      return;
    }

    load()
      .then(() => setStatus(PrepareDataStatus.ready))
      .catch(e => {
        console.log(e);
        setStatus(PrepareDataStatus.error);
      });
  }, [load]);

  if (status === PrepareDataStatus.pending) {
    console.log('PrepareData loading source:', source);
    return <PageLoading />;
  }

  if (status === PrepareDataStatus.error) {
    return (
      <Flex justify="center" py="8">
        <Text>Something went wrong.</Text>
      </Flex>
    );
  }

  return children;
});
