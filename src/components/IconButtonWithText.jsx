import { IconButton } from '@radix-ui/themes';
import React from 'react';
import styled from 'styled-components';

export const IconButtonWithText = React.memo(({ onClick, children, text, disabled, variant }) => {
  return (
    <ButtonWrapper size="4" onClick={onClick} disabled={disabled} variant={variant}>
      {children}
      <HelperText>{text}</HelperText>
    </ButtonWrapper>
  );
});

const ButtonWrapper = styled(IconButton)`
  position: relative;
`;
const HelperText = styled.span`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  font-size: 10px;
`;
