import { Flex, IconButton } from '@radix-ui/themes';
import {
  RiAnticlockwise2Line,
  RiArrowDownDoubleLine,
  RiCameraLine,
  RiClockwise2Line,
  RiCloseLine,
  RiImageAddLine,
} from '@remixicon/react';
import { Cropt } from 'cropt';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { FilePicker } from './FilePicker';
import { isAndroidPhone } from './isAndroid';

const Video = styled.video`
  width: 100vw;
  height: 100vw;
  max-width: 600px;
  max-height: 600px;
  object-fit: contain;
`;
const Image = styled.img`
  width: 100%;
  object-fit: contain;
`;
const ImageWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vw;
  background-color: white;
  z-index: 2;

  display: flex;
  align-items: flex-start;
  justify-content: center;
`;

export function Camera({ onSelect }) {
  const [hasTakenImage, setHasTakenImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [canvas, setCanvas] = useState(null);
  const videoStreamRef = useRef(null);
  const videoRef = useRef(null);

  const pickedImageEditorRef = useRef(null);
  const croptRef = useRef(null);
  const [pickedImage, setPickedImage] = useState(null);
  const pickedImageUrl = useMemo(
    () => (pickedImage ? URL.createObjectURL(pickedImage) : null),
    [pickedImage]
  );

  useEffect(() => {
    const constraints = {
      video: {
        facingMode: { exact: 'environment' },
        width: { ideal: 900 },
        height: { ideal: 900 },
      },
    };

    function startVideoStream() {
      if (videoStreamRef.current || !isAndroidPhone()) {
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

  useEffect(() => {
    if (!pickedImageUrl) {
      return;
    }

    const cropt = new Cropt(pickedImageEditorRef.current, {
      viewport: {
        width: Math.min(600, window.innerWidth),
        height: Math.min(600, window.innerWidth),
        type: 'square',
      },
    });
    cropt.bind(pickedImageUrl);
    croptRef.current = cropt;

    return () => {
      cropt.destroy();
    };
  }, [pickedImageUrl]);

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
    setHasTakenImage(true);
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
    setHasTakenImage(false);
    setImageUrl(null);
    setCanvas(null);
  }

  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <Video ref={videoRef} autoPlay />
      {hasTakenImage && (
        <ImageWrapper>
          <Image src={imageUrl} />
        </ImageWrapper>
      )}
      <div
        ref={pickedImageEditorRef}
        style={{
          width: '100%',
          position: 'absolute',
          zIndex: pickedImage ? '1' : '-1',
          top: 0,
          left: 0,
        }}
      />

      <Flex justify="center" align="center" pt="9">
        {hasTakenImage && (
          <>
            <IconButton
              size="4"
              onClick={() => {
                onSelect({ canvas, url: imageUrl });
                handleClose();
              }}
            >
              <RiArrowDownDoubleLine />
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
        )}

        {!!pickedImage && (
          <IconButton
            size="4"
            onClick={async () => {
              const canvas = await croptRef.current.toCanvas(900);
              const imageUrl = canvas.toDataURL('image/png');
              onSelect({ canvas, url: imageUrl });
              setPickedImage(null);
            }}
          >
            <RiArrowDownDoubleLine />
          </IconButton>
        )}

        {!hasTakenImage && !pickedImage && (
          <>
            {isAndroidPhone() && (
              <IconButton size="4" onClick={handleCapture} mr="2">
                <RiCameraLine />
              </IconButton>
            )}

            <FilePicker accept="image/*" takePhoto={false} onSelect={setPickedImage} height="auto">
              <IconButton size="4">
                <RiImageAddLine />
              </IconButton>
            </FilePicker>
          </>
        )}
      </Flex>
    </div>
  );
}
