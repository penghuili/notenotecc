import React from 'react';
import fastMemo from 'react-fast-memo';

import { PrepareData } from '../components/PrepareData.jsx';
import { PublicLinks } from '../components/PublicLinks.jsx';
import { FontSize } from '../shared/react/FontSize.jsx';
import { ItemsWrapper } from '../shared/react/ItemsWrapper.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';

export const Settings = fastMemo(() => {
  return (
    <PrepareData>
      <Header />

      <ItemsWrapper align="start">
        <FontSize />
      </ItemsWrapper>

      <PublicLinks />
    </PrepareData>
  );
});

const Header = fastMemo(() => {
  return <PageHeader title="Settings" hasBack />;
});
