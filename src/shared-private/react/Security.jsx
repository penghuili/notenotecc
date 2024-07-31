import React from 'react';

import { DeleteAccountLink } from './DeleteAccountLink.jsx';
import { ItemsWrapper } from './ItemsWrapper.jsx';
import { LinkButton } from './LinkButton.jsx';
import { LogoutLink } from './LogoutLink.jsx';
import { PageHeader } from './PageHeader.jsx';
import { RouteLink } from './RouteLink.jsx';
import { useCat } from './store/cat.js';
import { isDeletingAccountCat, isLoggingOutFromAllDevicesCat } from './store/sharedCats.js';
import { logOutFromAllDevicesEffect } from './store/sharedEffects';

export function Security() {
  const isLoggingOutFromAllDevices = useCat(isLoggingOutFromAllDevicesCat);
  const isDeletingAccount = useCat(isDeletingAccountCat);

  return (
    <>
      <PageHeader
        title="Security"
        hasBack
        isLoading={isLoggingOutFromAllDevices || isDeletingAccount}
      />

      <ItemsWrapper align="start">
        <RouteLink to="/security/2fa">2-Factor Authentication</RouteLink>

        <RouteLink to="/security/email">Change email</RouteLink>

        <RouteLink to="/security/password">Change password</RouteLink>

        <LogoutLink />

        <LinkButton onClick={logOutFromAllDevicesEffect}>Log out from all devices</LinkButton>

        <DeleteAccountLink />
      </ItemsWrapper>
    </>
  );
}
