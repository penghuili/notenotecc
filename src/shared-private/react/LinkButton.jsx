import { Link } from '@radix-ui/themes';
import React from 'react';
import styled from 'styled-components';

const StyledLink = styled(Link)`
  &:hover {
    text-decoration: ${({ disabled }) => (disabled ? 'none' : 'underline')};
    text-decoration-color: color-mix(in oklab, var(--accent-a5), var(--gray-a6));
    cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  }
`;

export function LinkButton({ children, onClick, disabled }) {
  return (
    <StyledLink
      disabled={disabled}
      onClick={() => {
        if (disabled) {
          return;
        }
        onClick();
      }}
      color={disabled ? 'gray' : 'accent'}
    >
      {children}
    </StyledLink>
  );
}
