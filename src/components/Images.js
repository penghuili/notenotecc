import { Flex } from '@radix-ui/themes';
import React, { useMemo } from 'react';

import { Image } from './Image';

export function Images({ noteId, images, onDeleteLocal }) {
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
          style={{ width: imageWidth, position: 'relative', aspectRaito: '1/1' }}
        >
          <Image
            noteId={noteId}
            imageUrl={image.url}
            imagePath={image.path}
            onDeleteLocal={onDeleteLocal}
          />
        </div>
      ))}
    </Flex>
  );
}
