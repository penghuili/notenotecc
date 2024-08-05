import { Flex, Spinner, Text } from '@radix-ui/themes';
import React, { useEffect, useState } from 'react';

const PrepareDataStatus = {
  pending: 'pending',
  error: 'error',
  ready: 'ready',
};

export const PrepareData = React.memo(({ load, children }) => {
  const [status, setStatus] = useState(PrepareDataStatus.pending);

  useEffect(() => {
    if (!load) {
      setStatus(PrepareDataStatus.ready);
      return;
    }

    load()
      .then(() => setStatus(PrepareDataStatus.ready))
      .catch(() => setStatus(PrepareDataStatus.error));
  }, [load]);

  if (status === PrepareDataStatus.pending) {
    return (
      <Flex justify="center" py="8">
        <Spinner size="3" />
      </Flex>
    );
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
