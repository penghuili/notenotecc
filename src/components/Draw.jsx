import { Popover, Typography } from '@douyinfe/semi-ui';
import { RiCheckboxFill, RiCheckLine, RiPaletteFill, RiSquareFill } from '@remixicon/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';

import { imageType } from '../lib/constants';
import { canvasToBlob } from '../shared/browser/canvasToBlob';
import { idbStorage } from '../shared/browser/indexDB';
import { randomHash } from '../shared/js/randomHash';
import { Flex } from '../shared/semi/Flex.jsx';
import { IconButton } from '../shared/semi/IconButton.jsx';
import { getCameraSize, VideoWrapper } from './TakeVideo.jsx';

const colors = [
  'black',
  '#e54d2e',
  '#ffe629',
  '#ffc53d',
  '#f76b15',
  '#e5484d',
  '#e54666',
  '#e93d82',
  '#d6409f',
  '#ab4aba',
  '#8e4ec6',
  '#6e56cf',
  '#5b5bd6',
  '#3e63dd',
  '#0090ff',
  '#00a2c7',
  '#12a594',
  '#29a383',
  '#30a46c',
  '#46a758',
  '#bdee63',
  '#86ead4',
  '#7ce2fe',
  '#ad7f58',
  '#a18072',
  '#978365',
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

      <Flex justify="center" align="center" gap="0.5rem" style={{ paddingTop: '12px' }}>
        <IconButton
          theme="solid"
          size={50}
          onClick={handleDone}
          icon={<RiCheckLine size={40} />}
          round
        />

        <Typography.Text
          size="small"
          style={{
            textAlign: 'center',
            position: 'absolute',
            top: displaySize + 70,
            right: '50%',
            transform: 'translateX(50%)',
          }}
        >
          Touch to draw anything.
        </Typography.Text>

        <div style={{ position: 'absolute', top: displaySize + 12, right: 12 }}>
          <ColorPicker color={color} onChange={setColor} />
        </div>
      </Flex>
    </VideoWrapper>
  );
});

const ColorPicker = fastMemo(({ color, onChange }) => {
  return (
    <Popover
      content={
        <Flex direction="row" gap="0.75rem" wrap="wrap" p="0.5rem" style={{ width: 220 }}>
          {colors.map(c => (
            <div key={c}>
              {c === color ? (
                <RiCheckboxFill color={c} onClick={() => onChange(null)} />
              ) : (
                <RiSquareFill color={c} onClick={() => onChange(c)} />
              )}
            </div>
          ))}
        </Flex>
      }
      trigger="click"
      clickToHide
    >
      <IconButton size={50} round icon={<RiPaletteFill color={color} />} />
    </Popover>
  );
});
