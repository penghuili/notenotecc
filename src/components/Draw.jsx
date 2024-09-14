import { Box, Flex, IconButton, Popover, Text } from '@radix-ui/themes';
import { RiCheckboxFill, RiCheckLine, RiPaletteFill, RiSquareFill } from '@remixicon/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';

import { imageType } from '../lib/constants';
import { randomHash } from '../shared/js/randomHash';
import { canvasToBlob } from '../shared/react/canvasToBlob';
import { idbStorage } from '../shared/react/indexDB';
import { getCameraSize, VideoWrapper } from './TakeVideo.jsx';

const colorsVariables = [
  '--tomato-9',
  '--yellow-9',
  '--amber-9',
  '--orange-9',
  '--red-9',
  '--ruby-9',
  '--crimson-9',
  '--pink-9',
  '--plum-9',
  '--purple-9',
  '--violet-9',
  '--iris-9',
  '--indigo-9',
  '--blue-9',
  '--cyan-9',
  '--teal-9',
  '--jade-9',
  '--green-9',
  '--grass-9',
  '--lime-9',
  '--mint-9',
  '--sky-9',
  '--brown-9',
  '--bronze-9',
  '--gold-9',
  '--gray-9',
];
const colors = [
  'black',
  ...colorsVariables.map(color =>
    getComputedStyle(document.documentElement).getPropertyValue(color)
  ),
];

const INTERNAL_SIZE = 900;
const displaySize = getCameraSize();

const DrawingCanvas = styled.canvas`
  width: ${displaySize}px;
  height: ${displaySize}px;
  touch-action: none;
  background-color: white;
`;

export const Draw = fastMemo(({ onSelect }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState(colors[0]);

  const handleDone = useCallback(async () => {
    requestAnimationFrame(async () => {
      const blob = await canvasToBlob(canvasRef.current, imageType, 0.8);
      const hash = randomHash();
      await idbStorage.setItem(hash, blob);
      onSelect({ hash, size: blob.size, type: imageType });
    });
  }, [onSelect]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = INTERNAL_SIZE;
    canvas.height = INTERNAL_SIZE;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, INTERNAL_SIZE, INTERNAL_SIZE);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 2 * (INTERNAL_SIZE / displaySize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = color;

    const draw = (x, y) => {
      if (!isDrawing) return;
      ctx.beginPath();

      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      setLastPos({ x, y });
    };

    const startDrawing = e => {
      setIsDrawing(true);
      const pos = getEventPosition(e);
      setLastPos(pos);
    };

    const stopDrawing = () => {
      setIsDrawing(false);
    };

    const drawHandler = e => {
      const pos = getEventPosition(e);
      draw(pos.x, pos.y);
    };

    const scaleCoord = coord => (coord * INTERNAL_SIZE) / displaySize;

    const getEventPosition = e => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: scaleCoord(clientX - rect.left),
        y: scaleCoord(clientY - rect.top),
      };
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', drawHandler);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', drawHandler);
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', drawHandler);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', drawHandler);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [isDrawing, lastPos, color]);

  return (
    <VideoWrapper>
      <DrawingCanvas width={INTERNAL_SIZE} height={INTERNAL_SIZE} ref={canvasRef} />

      <Flex justify="center" align="center" pt="12px" gap="2">
        <IconButton size="4" onClick={handleDone} radius="full">
          <RiCheckLine style={{ '--font-size': '40px' }} />
        </IconButton>

        <Text
          align="center"
          size="2"
          style={{
            position: 'absolute',
            top: displaySize + 70,
            right: '50%',
            transform: 'translateX(50%)',
          }}
        >
          Touch to draw anything.
        </Text>

        <Box style={{ position: 'absolute', top: displaySize + 12, right: 12 }}>
          <ColorPicker color={color} onChange={setColor} />
        </Box>
      </Flex>
    </VideoWrapper>
  );
});

const ColorPicker = fastMemo(({ color, onChange }) => {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <IconButton variant="soft" size="4" radius="full">
          <RiPaletteFill color={color} />
        </IconButton>
      </Popover.Trigger>
      <Popover.Content width="360px">
        <Flex gap="3" wrap="wrap">
          {colors.map(c => (
            <Popover.Close key={c}>
              {c === color ? (
                <RiCheckboxFill color={c} onClick={() => onChange(null)} />
              ) : (
                <RiSquareFill color={c} onClick={() => onChange(c)} />
              )}
            </Popover.Close>
          ))}
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
});
