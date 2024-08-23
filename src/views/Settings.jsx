import { Link } from '@radix-ui/themes';
import { RiCodeLine } from '@remixicon/react';
import React from 'react';

import { PrepareData } from '../components/PrepareData.jsx';
import { themeCssColor } from '../shared/react/AppWrapper.jsx';
import { FontSize } from '../shared/react/FontSize.jsx';
import { HorizontalCenter } from '../shared/react/HorizontalCenter.jsx';
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
        <HorizontalCenter gap="1">
          <RiCodeLine color={themeCssColor} />
          <Link href="https://github.com/penghuili/notenotecc" target="_blank">
            Source code
          </Link>
        </HorizontalCenter>
      </ItemsWrapper>
    </PrepareData>
  );
});

const Header = React.memo(() => {
  return <PageHeader title="Settings" hasBack />;
});
