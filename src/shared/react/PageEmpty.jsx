import { Flex } from '@radix-ui/themes';
import React from 'react';

export const PageEmpty = React.memo(({ children }) => {
  return (
    <Flex align="center" py="8" direction="column">
      {children}
    </Flex>
  );
});
