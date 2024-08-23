import '@radix-ui/themes/styles.css';
import './style.css';

import { Theme } from '@radix-ui/themes';
import React, { useEffect } from 'react';

import { updateFontSize } from './FontSize.jsx';
import { widthWithoutScrollbar } from './getScrollbarWidth.js';
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

const wrapperWidth = { width: widthWithoutScrollbar };

export function AppWrapper({ children }) {
  useEffect(() => {
    updateFontSize(LocalStorage.get(sharedLocalStorageKeys.fontScaling) || 1);
  }, []);

  return (
    <Theme accentColor={themeColor} appearance="light" style={wrapperWidth}>
      <PageWrapper>{children}</PageWrapper>
      {/* <KeyboardHandler /> */}
    </Theme>
  );
}
