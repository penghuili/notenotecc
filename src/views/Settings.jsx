import { Button } from '@radix-ui/themes';
import { RiCodeLine, RiHeartLine, RiHomeLine, RiServiceLine } from '@remixicon/react';
import React from 'react';

import { PrepareData } from '../components/PrepareData.jsx';
import { FontSize } from '../shared/react/FontSize.jsx';
import { ItemsWrapper } from '../shared/react/ItemsWrapper.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';

export const Settings = React.memo(() => {
  return (
    <PrepareData>
      <Header />

      <ItemsWrapper align="start">
        <FontSize />
      </ItemsWrapper>

      <ItemsWrapper align="start">
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
      </ItemsWrapper>
    </PrepareData>
  );
});

const Header = React.memo(() => {
  return <PageHeader title="Settings" hasBack />;
});
