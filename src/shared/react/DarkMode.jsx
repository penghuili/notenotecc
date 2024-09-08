import './FontSize.css';

import { Flex, Switch } from '@radix-ui/themes';
import React, { useCallback } from 'react';
import fastMemo from 'react-fast-memo';
import { createCat, useCat } from 'usecat';

import { LocalStorage, sharedLocalStorageKeys } from './LocalStorage.js';

export const themeModeCat = createCat(getThemeMode());

export const DarkMode = fastMemo(() => {
  const themeMode = useCat(themeModeCat);

  const handleChange = useCallback(value => {
    themeModeCat.set(value ? 'dark' : 'light');
    LocalStorage.set(sharedLocalStorageKeys.themeMode, value ? 'dark' : 'light');
  }, []);

  return (
    <Flex gap="2">
      <Switch checked={themeMode === 'dark'} onCheckedChange={handleChange} /> Dark mode
    </Flex>
  );
});

function getThemeMode() {
  return (
    LocalStorage.get(sharedLocalStorageKeys.themeMode) || (browserHasDarkMode() ? 'dark' : 'light')
  );
}

function browserHasDarkMode() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
