import { Button } from '@douyinfe/semi-ui';
import {
  RiCodeLine,
  RiHeartLine,
  RiHomeLine,
  RiLockLine,
  RiMailLine,
  RiServiceLine,
} from '@remixicon/react';
import React from 'react';
import fastMemo from 'react-fast-memo';

import { copyContactEmailEffect } from '../shared/browser/store/sharedEffects.js';
import { contactEmail } from '../shared/js/constants.js';
import { ItemsWrapper } from '../shared/semi/ItemsWrapper.jsx';
import { InstallApp } from './InstallApp.jsx';

export const PublicLinks = fastMemo(() => {
  return (
    <ItemsWrapper align="start">
      <a href="https://notenote.cc" target="_blank" rel="noreferrer">
        <Button theme="outline" icon={<RiHomeLine />}>
          Learn more
        </Button>
      </a>

      <a href="https://github.com/penghuili/notenotecc" target="_blank" rel="noreferrer">
        <Button theme="outline" icon={<RiCodeLine />}>
          Source code
        </Button>
      </a>

      <a href="https://notenote.cc/encryption/" target="_blank" rel="noreferrer">
        <Button theme="outline" icon={<RiLockLine />}>
          Encryption
        </Button>
      </a>

      <a href="https://notenote.cc/privacy" target="_blank" rel="noreferrer">
        <Button theme="outline" icon={<RiHeartLine />}>
          Privacy
        </Button>
      </a>

      <a href="https://notenote.cc/terms" target="_blank" rel="noreferrer">
        <Button theme="outline" icon={<RiServiceLine />}>
          Terms
        </Button>
      </a>

      <Button theme="outline" icon={<RiMailLine />} onClick={copyContactEmailEffect}>
        Contact: {contactEmail}
      </Button>

      <InstallApp />
    </ItemsWrapper>
  );
});
