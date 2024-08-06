import { Flex, Spinner } from '@radix-ui/themes';
import React from 'react';

export const PageLoading = React.memo(() => {
  return (
    <Flex justify="center" py="8">
      <Spinner size="3" />
    </Flex>
  );
});
