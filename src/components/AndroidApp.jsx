import { Flex } from '@radix-ui/themes';
import React from 'react';
import fastMemo from 'react-fast-memo';

import { playStoreLink } from '../lib/constants';
import { isAndroidApp, isAndroidBrowser } from '../shared/browser/device';

export const AndroidApp = fastMemo(() => {
  if (!isAndroidBrowser() || isAndroidApp()) {
    return null;
  }

  return (
    <Flex justify="center" mb="5">
      <a href={playStoreLink} target="_blank" rel="noreferrer">
        <img src="https://notenote.cc/play-store.svg" alt="Play store" height="40" />
      </a>
    </Flex>
  );
});
