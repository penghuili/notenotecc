import '@radix-ui/themes/styles.css';

import { Theme } from '@radix-ui/themes';
import React from 'react';
import styled from 'styled-components';

export const themeColor = 'tomato';
export const successColor = 'green';
export const warningColor = 'amber';
export const errorColor = 'red';

export const themeCssColor = 'var(--accent-a11)';
export const successCssColor = 'var(--green-9)';
export const warningCssColor = 'var(--amber-9)';
export const errorCssColor = 'var(--red-9)';
export const textCssColor = 'var(--gray-12)';

const Wrapper = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  box-sizing: border-box;
`;

export function AppWrapper({ children }) {
  return (
    <Theme accentColor={themeColor} appearance="light">
      <Wrapper>{children}</Wrapper>
    </Theme>
  );
}
