import { Box } from '@radix-ui/themes';
import React, { useState } from 'react';
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
  const [showFullScreen, setShowFullScreen] = useState(false);

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
      <>
        <img
          src={imageUrl}
          style={{ width: '100%' }}
          onError={() => {
            if (noteId && !isUpdatingImageUrls) {
              setShowImage(false);
              updateImageUrlsEffect(noteId, { onSucceeded: () => setShowImage(true) });
            }
          }}
          onClick={() => setShowFullScreen(true)}
        />

        <Box position="absolute" top="2" right="2">
          <ImageActions noteId={noteId} image={{ url: imageUrl, path: imagePath }} />
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

  return (
    <div ref={ref} style={{ minHeight: '10px', position: 'relative' }}>
      {renderContent()}
    </div>
  );
}
