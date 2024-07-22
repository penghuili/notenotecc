import { Flex } from '@radix-ui/themes';
import { Box, IconButton } from '@radix-ui/themes/dist/cjs/index.js';
import { RiDeleteBinLine } from '@remixicon/react';
import React, { useMemo } from 'react';

export function LocalImages({ images, onClick, onDelete }) {
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
    <Flex wrap="wrap" direction="row" justify="start" style={{ gap: '6px' }} onClick={onClick}>
      {images.map(image => (
        <div
          key={image.url}
          style={{ width: imageWidth, aspectRaito: '1/1', position: 'relative' }}
        >
          {image.canvas ? (
            <img src={image.url} style={{ width: '100%' }} crossOrigin="anonymous" />
          ) : (
            <video src={image.url} controls style={{ width: '100%' }} />
          )}
          <Box position="absolute" top="2" right="2">
            <IconButton>
              <RiDeleteBinLine
                onClick={e => {
                  e.stopPropagation();
                  onDelete(image);
                }}
              />
            </IconButton>
          </Box>
        </div>
      ))}
    </Flex>
  );
}
