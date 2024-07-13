import { Flex, IconButton } from '@radix-ui/themes';
import { Button } from '@radix-ui/themes/dist/cjs/index.js';
import {
  RiArrowDownDoubleLine,
  RiCameraLine,
  RiCheckLine,
  RiCloseLine,
  RiImageAddLine,
  RiRefreshLine,
  RiSkipDownLine,
  RiSkipUpLine,
  RiSquareLine,
} from '@remixicon/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import { disableBodyScroll, enableBodyScroll } from '../lib/bodySccroll';
import { isAndroidPhone } from '../lib/isAndroid';
import { makeImageSquare } from '../lib/makeImageSquare';
import { resizeCanvas } from '../lib/resizeCanvas';
import { FilePicker } from './FilePicker';
import { ImageCropper } from './ImageCropper';
import { LocalImages } from './LocalImages';

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
const CropperWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: ${props => `${props.size}px`};
  height: ${props => `${props.size}px`};
  background-color: white;
  z-index: ${props => (props.hasImage ? 3000 : -1)};

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

  const [pickedImage, setPickedImage] = useState(null);

  const [images, setImages] = useState([]);

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
    const imageUrl = tempCanvas.toDataURL('image/png');

    setImages([...images, { canvas: tempCanvas, url: imageUrl }]);
  }

  function handleClose() {
    setPickedImage(null);
  }

  let size = Math.min(600, window.innerWidth, window.innerHeight);
  if (window.innerWidth > window.innerHeight) {
    size = size - 230;
  }

  return (
    <Wrapper>
      <ContentWrapper size={size}>
        <Video ref={videoRef} autoPlay size={size} />
        <CropperWrapper hasImage={!!pickedImage} size={size}>
          <ImageCropper ref={cropperRef} width={size} pickedImage={pickedImage} />
        </CropperWrapper>

        <Flex justify="center" align="center" py="2" gap="2">
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
                  const resizedCanvas = resizeCanvas(squareCanvas, 900, 900);
                  const imageUrl = resizedCanvas.toDataURL('image/png');
                  setImages([...images, { canvas: resizedCanvas, url: imageUrl }]);
                  handleClose();
                }}
              >
                <RiSquareLine />
              </IconButton>
              <IconButton size="4" onClick={handleClose} variant="soft">
                <RiCloseLine />
              </IconButton>
            </>
          )}

          {!pickedImage && (
            <>
              {isAndroidPhone() && (
                <>
                  <IconButton size="4" onClick={handleCapture}>
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

              <IconButton size="4" onClick={onClose}>
                <RiCloseLine />
              </IconButton>
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

            <IconButton size="4" onClick={onClose}>
              <RiCloseLine />
            </IconButton>
          </Flex>
        )}

        {!!images?.length && (
          <ImagesWrapper>
            <ImagesPreview
              images={images}
              onDelete={item => setImages(images.filter(i => i.url !== item.url))}
            />
          </ImagesWrapper>
        )}
      </ContentWrapper>
    </Wrapper>
  );
}

const PreviewWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  width: ${props => `${props.width}px`};
`;
const PreviewImage = styled.img`
  width: 100px;
  height: 100px;
  border: 1px solid #ddd;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;
`;

function ImagesPreview({ images, onDelete }) {
  const [showImages, setShowImages] = useState(false);
  const reversedImages = useMemo(() => [...(images || [])].reverse(), [images]);

  if (!reversedImages.length) {
    return null;
  }

  return (
    <>
      <Button onClick={() => setShowImages(!showImages)} variant="ghost">
        {showImages ? <RiSkipDownLine /> : <RiSkipUpLine />} ({images.length})
      </Button>

      {showImages ? (
        <LocalImages images={reversedImages} onDelete={onDelete} />
      ) : (
        <PreviewWrapper
          width={(reversedImages.length - 1) * 20 + 100}
          onClick={() => setShowImages(true)}
        >
          {reversedImages.map((image, index) => {
            const translateX = -index * 80;
            const zIndex = reversedImages.length - index;
            return (
              <PreviewImage
                src={image.url}
                key={image.url}
                style={{
                  transform: `translateX(${translateX}px)`,
                  zIndex: zIndex,
                }}
              />
            );
          })}
        </PreviewWrapper>
      )}
    </>
  );
}
