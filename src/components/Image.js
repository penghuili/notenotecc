import { Box } from '@radix-ui/themes';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';

import { useInView } from '../shared-private/react/hooks/useInView';
import { LoadingSkeleton } from '../shared-private/react/LoadingSkeleton';
import { useAtomValue } from '../shared-private/react/store/atomHelpers';
import { isUpdatingImageUrlsAtom } from '../store/note/noteAtoms';
import { updateImageUrlsEffect } from '../store/note/noteEffects';
import { ImageActions } from './ImageActions';

const FullScreenWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  background: black;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export function Image({ noteId, imageUrl, imagePath }) {
  const isUpdatingImageUrls = useAtomValue(isUpdatingImageUrlsAtom);

  const [showImage, setShowImage] = useState(false);

  const ref = useInView(
    () => {
      setShowImage(true);
    },
    {
      threshold: 0.5,
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
      />
    );
  }

  return (
    <div ref={ref} style={{ minHeight: '10px', position: 'relative' }}>
      {renderContent()}
    </div>
  );
}

function InnerImage({ noteId, imageUrl, imagePath, isUpdatingImageUrls, onShowImage }) {
  const imageRef = useRef(null);
  const [showFullScreen, setShowFullScreen] = useState(false);

  return (
    <>
      <img
        ref={imageRef}
        src={imageUrl}
        style={{ width: '100%' }}
        onError={() => {
          if (noteId && !isUpdatingImageUrls) {
            onShowImage(false);
            updateImageUrlsEffect(noteId, {
              onSucceeded: () => onShowImage(true),
              showSuccess: false,
            });
          }
        }}
        onClick={() => setShowFullScreen(true)}
        crossOrigin="anonymous"
      />

      <Box position="absolute" top="2" right="2">
        <ImageActions
          noteId={noteId}
          image={{ url: imageUrl, path: imagePath }}
          imageRef={imageRef}
        />
      </Box>

      {showFullScreen && (
        <FullScreenWrapper onClick={() => setShowFullScreen(false)}>
          <img
            src={imageUrl}
            style={{ width: '100%', maxWidth: 900, maxHeight: 900 }}
            onClick={e => e.stopPropagation()}
          />
        </FullScreenWrapper>
      )}
    </>
  );
}
