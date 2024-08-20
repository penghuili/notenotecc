import '@radix-ui/themes/styles.css';
import './style.css';

import { Theme } from '@radix-ui/themes';
import React from 'react';
import { createCat, useCat } from 'usecat';

import { LocalStorage, sharedLocalStorageKeys } from './LocalStorage.js';
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

export const hasPageMinHeightCat = createCat(true);
export const fontScalingCat = createCat(LocalStorage.get(sharedLocalStorageKeys.fontScaling) || 1);

export function AppWrapper({ children }) {
  const hasMinHeight = useCat(hasPageMinHeightCat);
  const scaling = useCat(fontScalingCat);

  return (
    <Theme accentColor={themeColor} appearance="light" style={{ '--scaling': `${scaling}` }}>
      <PageWrapper hasMinHeight={hasMinHeight}>{children}</PageWrapper>
    </Theme>
  );
}
