import { Box } from '@radix-ui/themes';
import React from 'react';

import { useIsMobileSize } from '../shared-private/react/hooks/useIsMobileSize';

export function Padding({ children }) {
  const isMobile = useIsMobileSize();
  return <Box px={isMobile ? '2' : '0'}>{children}</Box>;
}
