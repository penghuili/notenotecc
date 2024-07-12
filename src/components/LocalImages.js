import { Flex } from '@radix-ui/themes';
import { Box, IconButton } from '@radix-ui/themes/dist/cjs/index.js';
import { RiCloseLine } from '@remixicon/react';
import React, { useMemo } from 'react';

export function LocalImages({ images, onDelete }) {
  const imageWidth = useMemo(() => {
    if (images?.length === 1) {
      return '100%';
    }

    return 'calc(50% - 3px)';
  }, [images]);

  if (!images?.length) {
    return null;
  }

  return (
    <Flex wrap="wrap" direction="row" justify="start" style={{ gap: '6px' }}>
      {images.map(image => (
        <div
          key={image.url}
          style={{ width: imageWidth, aspectRaito: '1/1', position: 'relative' }}
        >
          <img src={image.url} style={{ width: '100%' }} crossOrigin="anonymous" />
          <Box position="absolute" top="2" right="2">
            <IconButton>
              <RiCloseLine onClick={() => onDelete(image)} />
            </IconButton>
          </Box>
        </div>
      ))}
    </Flex>
  );
}
