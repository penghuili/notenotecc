import { Button } from '@radix-ui/themes';
import { RiCodeLine, RiHeartLine, RiHomeLine, RiMailLine, RiServiceLine } from '@remixicon/react';
import React from 'react';

import { ItemsWrapper } from '../shared/react/ItemsWrapper.jsx';
import { InstallApp } from './InstallApp.jsx';

export const PublicLinks = React.memo(() => {
  return (
    <ItemsWrapper align="start">
      <InstallApp />

      <a href="https://notenote.cc" target="_blank" rel="noreferrer">
        <Button variant="ghost">
          <RiHomeLine />
          Learn more
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

      <a href="https://github.com/penghuili/notenotecc" target="_blank" rel="noreferrer">
        <Button variant="ghost">
          <RiCodeLine />
          Source code
        </Button>
      </a>

      <Button variant="ghost">
        <RiMailLine />
        Contact: peng@tuta.com
      </Button>
    </ItemsWrapper>
  );
});
