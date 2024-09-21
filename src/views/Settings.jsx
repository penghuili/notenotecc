import React from 'react';
import fastMemo from 'react-fast-memo';

import { PrepareData } from '../components/PrepareData.jsx';
import { PublicLinks } from '../components/PublicLinks.jsx';
import { DarkMode } from '../shared/radix/DarkMode.jsx';
import { FontSize } from '../shared/radix/FontSize.jsx';
import { ItemsWrapper } from '../shared/radix/ItemsWrapper.jsx';
import { PageHeader } from '../shared/radix/PageHeader.jsx';

export const Settings = fastMemo(() => {
  return (
    <PrepareData>
      <Header />

      <ItemsWrapper align="start">
        <DarkMode />
        <FontSize />
      </ItemsWrapper>

      <PublicLinks />
    </PrepareData>
  );
});

const Header = fastMemo(() => {
  return <PageHeader title="Settings" hasBack />;
});
