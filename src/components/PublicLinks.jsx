import { Button } from '@radix-ui/themes';
import {
  RiCodeLine,
  RiHeartLine,
  RiHomeLine,
  RiLockLine,
  RiMailLine,
  RiServiceLine,
} from '@remixicon/react';
import React, { useCallback } from 'react';
import fastMemo from 'react-fast-memo';

import { copyToClipboard } from '../shared/browser/copyToClipboard.js';
import { setToastEffect } from '../shared/browser/store/sharedEffects.js';
import { ItemsWrapper } from '../shared/radix/ItemsWrapper.jsx';
import { InstallApp } from './InstallApp.jsx';

export const PublicLinks = fastMemo(() => {
  const handleCopyEmail = useCallback(async () => {
    await copyToClipboard('peng@tuta.com');
    setToastEffect('Contact email is copied!');
  }, []);

  return (
    <ItemsWrapper align="start">
      <InstallApp />

      <a href="https://notenote.cc" target="_blank" rel="noreferrer">
        <Button variant="ghost">
          <RiHomeLine />
          Learn more
        </Button>
      </a>

      <a href="https://github.com/penghuili/notenotecc" target="_blank" rel="noreferrer">
        <Button variant="ghost">
          <RiCodeLine />
          Source code
        </Button>
      </a>

      <a href="https://notenote.cc/encryption/" target="_blank" rel="noreferrer">
        <Button variant="ghost">
          <RiLockLine />
          Encryption
        </Button>
      </a>

      <a href="https://notenote.cc/privacy" target="_blank" rel="noreferrer">
        <Button variant="ghost">
          <RiHeartLine />
          Privacy
        </Button>
      </a>

      <a href="https://notenote.cc/terms" target="_blank" rel="noreferrer">
        <Button variant="ghost">
          <RiServiceLine />
          Terms
        </Button>
      </a>

      <Button variant="ghost" onClick={handleCopyEmail}>
        <RiMailLine />
        Contact: peng@tuta.com
      </Button>
    </ItemsWrapper>
  );
});
