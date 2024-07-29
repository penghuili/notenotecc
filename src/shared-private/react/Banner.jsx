import { Box, Flex } from '@radix-ui/themes';
import React from 'react';

import { AnimatedBox } from './AnimatedBox.jsx';

export function Banner({ open, children, right }) {
  return (
    <AnimatedBox visible={open}>
      <Flex
        direction="row"
        align="center"
        justify="between"
        py="3"
        px="2"
        style={{ backgroundColor: 'var(--accent-2)' }}
      >
        <Box>{children}</Box>
        {right}
      </Flex>
    </AnimatedBox>
  );
}
