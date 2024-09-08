import '@radix-ui/themes/styles.css';
import './style.css';

import { Theme } from '@radix-ui/themes';
import React, { useEffect, useMemo } from 'react';
import { useCat } from 'usecat';

import { themeModeCat } from './DarkMode.jsx';
import { updateFontSize } from './FontSize.jsx';
import { useWidthWithoutScrollbar } from './getScrollbarWidth.js';
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

if ('virtualKeyboard' in navigator) {
  navigator.virtualKeyboard.overlaysContent = true;
}

export function AppWrapper({ children }) {
  const windowWidth = useWidthWithoutScrollbar();
  const themeMode = useCat(themeModeCat);

  const widthStyle = useMemo(() => {
    return { width: windowWidth };
  }, [windowWidth]);

  useEffect(() => {
    updateFontSize(LocalStorage.get(sharedLocalStorageKeys.fontScaling) || 1);
  }, []);

  return (
    <Theme accentColor={themeColor} appearance={themeMode} style={widthStyle}>
      <PageWrapper>{children}</PageWrapper>
      <div style={{ height: 'env(keyboard-inset-height, 0px)' }} />
    </Theme>
  );
}
