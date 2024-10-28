import React from 'react';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';

import { IconButton } from '../shared/semi/IconButton';

export const IconButtonWithText = fastMemo(({ onClick, children, text, disabled }) => {
  return (
    <IconButton
      theme="solid"
      size={50}
      onClick={onClick}
      disabled={disabled}
      icon={
        <>
          {children} <HelperText>{text}</HelperText>
        </>
      }
      style={{
        position: 'relative',
      }}
    />
  );
});

const HelperText = styled.span`
  position: absolute;
  top: calc(50% + 5px);
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  font-size: 10px;
`;
