import { RiLogoutBoxLine } from '@remixicon/react';
import React from 'react';

import { themeCssColor } from './AppWrapper.jsx';
import { HorizontalCenter } from './HorizontalCenter.jsx';
import { LinkButton } from './LinkButton.jsx';
import { logOutEffect } from './store/sharedEffects';

export function LogoutLink() {
  return (
    <HorizontalCenter gap="1">
      <RiLogoutBoxLine color={themeCssColor} />
      <LinkButton onClick={logOutEffect}>Log out</LinkButton>
    </HorizontalCenter>
  );
}
