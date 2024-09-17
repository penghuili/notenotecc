import { Flex } from '@radix-ui/themes';
import React from 'react';
import fastMemo from 'react-fast-memo';

import { playStoreLink } from '../lib/constants';
import { isAndroidBrowser } from '../shared/react/device';

export const AndroidApp = fastMemo(() => {
  if (!isAndroidBrowser()) {
    return null;
  }

  return (
    <Flex justify="center">
      <a href={playStoreLink} target="_blank" rel="noreferrer">
        <img src="https://notenote.cc/play-store.svg" alt="Play store" height="40" />
      </a>
    </Flex>
  );
});
