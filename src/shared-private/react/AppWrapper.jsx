import '@radix-ui/themes/styles.css';
import './style.css';

import { Theme } from '@radix-ui/themes';
import React from 'react';

import { PageWrapper } from './PageWrapper.jsx';

export const themeColor = 'tomato';
export const successColor = 'green';
export const warningColor = 'amber';
export const errorColor = 'red';

export const themeCssColor = 'var(--accent-a11)';
export const successCssColor = 'var(--green-9)';
export const warningCssColor = 'var(--amber-9)';
export const errorCssColor = 'var(--red-9)';
export const textCssColor = 'var(--gray-12)';

export function AppWrapper({ children, hasMinHeight = true, hasPadding = true }) {
  return (
    <Theme accentColor={themeColor} appearance="light">
      <PageWrapper hasMinHeight={hasMinHeight} hasPadding={hasPadding}>
        {children}
      </PageWrapper>
    </Theme>
  );
}
