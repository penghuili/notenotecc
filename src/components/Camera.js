import { Flex, IconButton } from '@radix-ui/themes';
import {
  RiAnticlockwise2Line,
  RiCameraLine,
  RiCheckLine,
  RiClockwise2Line,
  RiCloseLine,
} from '@remixicon/react';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { setToastEffect } from '../shared-private/react/store/sharedEffects';
import { isIOS } from './isAndroid';

const Video = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vw;
  object-fit: cover;
  z-index: 1;
`;
const Image = styled.img`
  width: 100%;
  object-fit: contain;
`;
const ImageWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 2;

  display: flex;
  align-items: flex-start;
  justify-content: center;
`;

export function Camera() {
  const [hasImage, setHasImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [canvas, setCanvas] = useState(null);
  const videoStreamRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const constraints = {
      video: {
        facingMode: { exact: 'environment' },
        width: { ideal: 1024 },
        height: { ideal: 1024 },
      },
    };

    function startVideoStream() {
      if (videoStreamRef.current) {
        return;
      }

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(stream => {
          videoStreamRef.current = stream;
          videoRef.current.srcObject = stream;
        })
        .catch(error => {
          console.error('Error accessing the camera: ', error);
        });
    }

    function stopVideoStream() {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
        videoStreamRef.current = null;
      }
    }
    function handleVisibilityChange() {
      if (document.hidden) {
        stopVideoStream();
      } else {
        startVideoStream();
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    startVideoStream();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  function handleCapture() {
    const tempCanvas = document.createElement('canvas');
    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;
    tempCanvas.width = width;
    tempCanvas.height = height;
    const context = tempCanvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, width, height);
    const data = tempCanvas.toDataURL('image/png');
    setImageUrl(data);
    setHasImage(true);
    setCanvas(tempCanvas);
  }
  function handleRotate(clockwise) {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = canvas.height;
    newCanvas.height = canvas.width;

    const newCtx = newCanvas.getContext('2d');

    if (clockwise) {
      newCtx.translate(canvas.height, 0);
      newCtx.rotate(Math.PI / 2);
    } else {
      newCtx.translate(0, canvas.width);
      newCtx.rotate(-Math.PI / 2);
    }

    newCtx.drawImage(canvas, 0, 0);

    const data = newCanvas.toDataURL('image/png');
    setImageUrl(data);
    setCanvas(newCanvas);
  }
  function handleClose() {
    setHasImage(false);
    setImageUrl(null);
    setCanvas(null);
  }
  async function shareCanvasImage() {
    // Convert canvas to blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

    // Create a File object
    const file = new File([blob], `simplestcam-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.png`, {
      type: 'image/png',
    });

    // Check if the browser supports sharing files
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'SimplestCam',
        });
      } catch (error) {
        console.error('Error sharing canvas image:', error);
      }
    } else {
      console.log('Your browser does not support sharing files.');
    }
  }

  return (
    <div>
      <Video ref={videoRef} autoPlay />
      {hasImage && (
        <ImageWrapper>
          <Image src={imageUrl} />
        </ImageWrapper>
      )}

      <Flex
        position="fixed"
        bottom="0"
        left="0"
        width="100%"
        justify="center"
        pb="8"
        style={{ zIndex: 3 }}
      >
        {hasImage ? (
          <>
            <IconButton
              size="4"
              onClick={async () => {
                if (isIOS()) {
                  await shareCanvasImage();
                  setToastEffect('Image saved.');
                  handleClose();
                } else {
                  canvas.toBlob(blob => {
                    saveAs(blob, `simplestcam-${format(new Date(), 'yyyy-MM-dd-HH-mm-ss')}.png`);
                    setToastEffect('Image saved.');
                    handleClose();
                  });
                }
              }}
            >
              <RiCheckLine />
            </IconButton>
            <IconButton
              size="4"
              onClick={() => {
                handleRotate(false);
              }}
              ml="4"
            >
              <RiAnticlockwise2Line />
            </IconButton>
            <IconButton
              size="4"
              onClick={() => {
                handleRotate(true);
              }}
              ml="4"
            >
              <RiClockwise2Line />
            </IconButton>
            <IconButton size="4" onClick={handleClose} ml="4">
              <RiCloseLine />
            </IconButton>
          </>
        ) : (
          <IconButton size="4" onClick={handleCapture}>
            <RiCameraLine />
          </IconButton>
        )}
      </Flex>
    </div>
  );
}
