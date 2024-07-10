import { Flex, IconButton } from '@radix-ui/themes';
import { Button } from '@radix-ui/themes/dist/cjs/index.js';
import {
  RiAnticlockwise2Line,
  RiArrowDownDoubleLine,
  RiCameraLine,
  RiCheckLine,
  RiClockwise2Line,
  RiCloseLine,
  RiDeleteBinLine,
  RiImageAddLine,
  RiRefreshLine,
  RiSkipDownLine,
  RiSkipUpLine,
  RiSquareLine,
} from '@remixicon/react';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { disableBodyScroll, enableBodyScroll } from '../lib/bodySccroll';
import { makeImageSquare } from '../lib/makeImageSquare';
import { AnimatedBox } from '../shared-private/react/AnimatedBox';
import { FilePicker } from './FilePicker';
import { ImageCropper } from './ImageCropper';
import { Images } from './Images';
import { isAndroidPhone } from './isAndroid';

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  background-color: white;
`;
const ContentWrapper = styled.div`
  position: relative;
  margin: 0 auto;
  width: ${props => `${props.size}px`};
  height: 100vh;
`;
const Video = styled.video`
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
`;
const Image = styled.img`
  width: 100%;
`;
const ImageWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
  background-color: white;
  z-index: 2;

  display: flex;
  align-items: flex-end;
  justify-content: center;
`;
const CropperWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
  background-color: white;
  z-index: ${props => (props.hasImage ? 2 : -1)};

  display: flex;
  align-items: center;
  justify-content: center;
`;
const ImagesWrapper = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  background-color: white;
`;

export function Camera({ onSelect, onClose }) {
  const videoStreamRef = useRef(null);
  const videoRef = useRef(null);
  const cropperRef = useRef(null);
  const [facingMode, setFacingMode] = useState('environment');

  const [takenImageCanvas, setTakenImageCanvas] = useState(null);
  const [takeImageUrl, setTakenImageUrl] = useState(null);
  const [pickedImage, setPickedImage] = useState(null);

  const [images, setImages] = useState([]);
  const [showImages, setShowImages] = useState(false);

  function requestCameraPermission(mode) {
    setFacingMode(mode);

    const constraints = {
      video: {
        facingMode: { exact: mode },
        width: { ideal: 900 },
        height: { ideal: 900 },
      },
    };

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

  useEffect(() => {
    disableBodyScroll();
    return () => {
      enableBodyScroll();
      handleClose();
      setImages([]);
    };
  }, []);

  useEffect(() => {
    function startVideoStream() {
      if (videoStreamRef.current || !isAndroidPhone()) {
        return;
      }

      requestCameraPermission('environment');
    }

    function stopVideoStream() {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
        videoStreamRef.current = null;
      }
    }

    window.addEventListener('focus', startVideoStream);
    window.addEventListener('blur', stopVideoStream);

    startVideoStream();

    return () => {
      window.removeEventListener('focus', startVideoStream);
      window.removeEventListener('blur', stopVideoStream);
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
    setTakenImageUrl(data);
    setTakenImageCanvas(tempCanvas);
  }
  function handleRotate(clockwise) {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = takenImageCanvas.height;
    newCanvas.height = takenImageCanvas.width;

    const newCtx = newCanvas.getContext('2d');

    if (clockwise) {
      newCtx.translate(takenImageCanvas.height, 0);
      newCtx.rotate(Math.PI / 2);
    } else {
      newCtx.translate(0, takenImageCanvas.width);
      newCtx.rotate(-Math.PI / 2);
    }

    newCtx.drawImage(takenImageCanvas, 0, 0);

    const data = newCanvas.toDataURL('image/png');
    setTakenImageUrl(data);
    setTakenImageCanvas(newCanvas);
  }
  function handleClose() {
    setTakenImageCanvas(null);
    setTakenImageUrl(null);
    setPickedImage(null);
  }

  let size = Math.min(600, window.innerWidth, window.innerHeight);
  if (window.innerWidth > window.innerHeight) {
    size = size - 150;
  }

  return (
    <Wrapper>
      <ContentWrapper size={size}>
        <Video ref={videoRef} autoPlay size={size} />
        {!!takenImageCanvas && (
          <ImageWrapper size={size}>
            <Image src={takeImageUrl} />
          </ImageWrapper>
        )}
        <CropperWrapper hasImage={!!pickedImage} size={size}>
          <ImageCropper ref={cropperRef} width={size} pickedImage={pickedImage} />
        </CropperWrapper>

        <Flex justify="center" align="center" py="2" gap="2">
          {!!takenImageCanvas && (
            <>
              <IconButton
                size="4"
                onClick={() => {
                  setImages([...images, { canvas: takenImageCanvas, url: takeImageUrl }]);
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
              >
                <RiAnticlockwise2Line />
              </IconButton>
              <IconButton
                size="4"
                onClick={() => {
                  handleRotate(true);
                }}
              >
                <RiClockwise2Line />
              </IconButton>
              <IconButton size="4" onClick={handleClose}>
                <RiCloseLine />
              </IconButton>
            </>
          )}

          {!!pickedImage && (
            <>
              <IconButton
                size="4"
                onClick={async () => {
                  const canvas = cropperRef.current.crop(900);
                  const imageUrl = canvas.toDataURL('image/png');
                  setImages([...images, { canvas, url: imageUrl }]);
                  handleClose();
                }}
              >
                <RiArrowDownDoubleLine />
              </IconButton>
              <IconButton
                size="4"
                onClick={async () => {
                  const squareCanvas = await makeImageSquare(pickedImage);
                  const imageUrl = squareCanvas.toDataURL('image/png');
                  setImages([...images, { canvas: takenImageCanvas, url: imageUrl }]);
                  handleClose();
                }}
              >
                <RiSquareLine />
              </IconButton>
              <IconButton size="4" onClick={handleClose}>
                <RiCloseLine />
              </IconButton>
            </>
          )}

          {!takenImageCanvas && !pickedImage && (
            <>
              {isAndroidPhone() && (
                <>
                  <IconButton size="4" onClick={handleCapture} mr="2">
                    <RiCameraLine />
                  </IconButton>
                  <IconButton
                    size="4"
                    onClick={() => {
                      const mode = facingMode === 'user' ? 'environment' : 'user';
                      setFacingMode(mode);
                      requestCameraPermission(mode);
                    }}
                  >
                    <RiRefreshLine />
                  </IconButton>
                </>
              )}

              <FilePicker
                accept="image/*"
                takePhoto={false}
                onSelect={setPickedImage}
                height="auto"
              >
                <IconButton size="4">
                  <RiImageAddLine />
                </IconButton>
              </FilePicker>
            </>
          )}
        </Flex>

        {!!images.length && (
          <Flex justify="center" align="center" py="2" gap="2">
            <IconButton
              size="4"
              onClick={() => {
                onSelect(images);
              }}
            >
              <RiCheckLine />
            </IconButton>

            <IconButton size="4" onClick={onClose} variant="soft">
              <RiDeleteBinLine />
            </IconButton>
          </Flex>
        )}

        {!!images?.length && (
          <ImagesWrapper>
            <Button onClick={() => setShowImages(!showImages)} variant="ghost">
              {showImages ? <RiSkipDownLine /> : <RiSkipUpLine />} ({images.length})
            </Button>
            <AnimatedBox visible={showImages}>
              <Images
                images={images}
                onDeleteLocal={item => setImages(images.filter(i => i.url !== item.url))}
              />
            </AnimatedBox>
          </ImagesWrapper>
        )}
      </ContentWrapper>
    </Wrapper>
  );
}
