import { Box } from '@radix-ui/themes';
import React, { useRef, useState } from 'react';

import { useInView } from '../shared-private/react/hooks/useInView';
import { LoadingSkeleton } from '../shared-private/react/LoadingSkeleton';
import { updateAtomValue, useAtomValue } from '../shared-private/react/store/atomHelpers';
import { fullScreenImageUrlAtom, isUpdatingImageUrlsAtom } from '../store/note/noteAtoms';
import { updateImageUrlsEffect } from '../store/note/noteEffects';
import { ImageActions } from './ImageActions';

export function Image({ noteId, imageUrl, imagePath, onDeleteLocal }) {
  const isUpdatingImageUrls = useAtomValue(isUpdatingImageUrlsAtom);

  const [showImage, setShowImage] = useState(false);

  const ref = useInView(
    () => {
      setShowImage(true);
    },
    {
      threshold: 0.1,
    }
  );

  function renderContent() {
    if (!showImage) {
      return <LoadingSkeleton width="100%" height="100%" />;
    }

    return (
      <InnerImage
        noteId={noteId}
        imageUrl={imageUrl}
        imagePath={imagePath}
        isUpdatingImageUrls={isUpdatingImageUrls}
        onShowImage={setShowImage}
        onDeleteLocal={onDeleteLocal}
      />
    );
  }

  return (
    <>
      <div
        ref={ref}
        style={{ position: 'relative', aspectRatio: '1/1', width: '100%', maxWidth: 600 }}
        onClick={() => {
          updateAtomValue(fullScreenImageUrlAtom, imageUrl);
        }}
      >
        {renderContent()}
      </div>
    </>
  );
}

function InnerImage({
  noteId,
  imageUrl,
  imagePath,
  isUpdatingImageUrls,
  onShowImage,
  onDeleteLocal,
}) {
  const imageRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <LoadingSkeleton width="100%" height="100%" />}
      <img
        ref={imageRef}
        src={imageUrl}
        style={{ width: '100%', display: isLoading ? 'none' : 'block' }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          if (noteId && !isUpdatingImageUrls) {
            onShowImage(false);
            updateImageUrlsEffect(noteId, {
              onSucceeded: () => onShowImage(true),
              showSuccess: false,
            });
          }
        }}
        crossOrigin="anonymous"
      />

      <Box position="absolute" top="2" right="2">
        <ImageActions
          noteId={noteId}
          image={{ url: imageUrl, path: imagePath }}
          imageRef={imageRef}
          onDeleteLocal={onDeleteLocal}
        />
      </Box>
    </>
  );
}
