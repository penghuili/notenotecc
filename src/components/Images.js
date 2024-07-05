import { Flex } from '@radix-ui/themes';
import { Box, IconButton } from '@radix-ui/themes/dist/cjs/index.js';
import { RiCloseLine } from '@remixicon/react';
import React, { useMemo } from 'react';

import { useAtomValue } from '../shared-private/react/store/atomHelpers';
import { isDeletingImageAtom } from '../store/note/noteAtoms';
import { deleteImageEffect } from '../store/note/noteEffects';
import { Image } from './Image';

export function Images({ noteId, images, showDelete }) {
  const isDeletingImage = useAtomValue(isDeletingImageAtom);

  const imageWidth = useMemo(() => {
    if (images?.length === 1) {
      return '100%';
    }

    return 'calc(50% - 5px)';
  }, [images]);

  if (!images?.length) {
    return null;
  }

  return (
    <Flex wrap="wrap" direction="row" justify="start" style={{ gap: '10px' }}>
      {images.map(image => (
        <Box key={image.url} width={imageWidth} position="relative">
          <Image noteId={noteId} imageUrl={image.url} />
          {!!noteId && showDelete && (
            <Box position="absolute" top="2" right="2">
              <IconButton
                ml="2"
                onClick={() => deleteImageEffect(noteId, { imagePath: image.path })}
                disabled={isDeletingImage}
              >
                <RiCloseLine />
              </IconButton>
            </Box>
          )}
        </Box>
      ))}
    </Flex>
  );
}
