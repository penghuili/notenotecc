import React from 'react';

import { PrepareData } from '../components/PrepareData.jsx';
import { PublicLinks } from '../components/PublicLinks.jsx';
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

      <PublicLinks />
    </PrepareData>
  );
});

const Header = React.memo(() => {
  return <PageHeader title="Settings" hasBack />;
});
