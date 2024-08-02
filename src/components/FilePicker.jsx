import React, { useCallback } from 'react';
import styled from 'styled-components';

const Wrapper = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  height: ${p => p.height || '16px'};
  cursor: pointer;
`;
const Input = styled.input`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`;

export const FilePicker = React.memo(
  ({ accept, takePhoto, height, children, disabled, onSelect }) => {
    const handleChange = useCallback(
      e => {
        const file = onSelect(e.target.files?.[0]);
        if (file) {
          onSelect(file);
        }
      },
      [onSelect]
    );

    return (
      <Wrapper height={height}>
        {children}
        <Input
          type="file"
          accept={accept || 'image/*'}
          capture={takePhoto ? 'environment' : undefined}
          onChange={handleChange}
          disabled={disabled}
        />
      </Wrapper>
    );
  }
);
