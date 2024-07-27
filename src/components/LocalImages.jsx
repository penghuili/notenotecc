import { Box, Flex, IconButton } from '@radix-ui/themes';
import { RiDeleteBinLine } from '@remixicon/react';
import React, { useMemo } from 'react';

import { cameraTypes } from '../lib/cameraTypes';

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

  function renderMedia(item) {
    if (item.type === cameraTypes.takePhoto || item.type === cameraTypes.pickPhoto) {
      return <img src={item.url} style={{ width: '100%' }} crossOrigin="anonymous" />;
    }

    if (item.type === cameraTypes.takeVideo) {
      return <video src={item.url} controls style={{ width: '100%' }} />;
    }

    if (item.type === cameraTypes.takeAudio) {
      return (
        <div
          style={{
            boxSizing: 'border-box',
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0.5rem',
            border: '1px solid #ddd',
          }}
        >
          <audio
            src={item.url}
            controls
            style={{
              width: '100%',
            }}
          />
        </div>
      );
    }

    return null;
  }

  return (
    <Flex
      wrap="wrap"
      direction="row"
      justify="start"
      width="100%"
      style={{ gap: '6px' }}
      onClick={onClick}
    >
      {images.map(image => (
        <div
          key={image.url}
          style={{ width: imageWidth, aspectRatio: '1 / 1', position: 'relative' }}
        >
          {renderMedia(image)}
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
