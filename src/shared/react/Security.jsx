import { Button } from '@radix-ui/themes';
import { RiDeviceLine, RiLockPasswordLine, RiLockStarLine, RiMailLine } from '@remixicon/react';
import React from 'react';
import { useCat } from 'usecat';

import { themeCssColor } from './AppWrapper.jsx';
import { DeleteAccountLink } from './DeleteAccountLink.jsx';
import { HorizontalCenter } from './HorizontalCenter.jsx';
import { ItemsWrapper } from './ItemsWrapper.jsx';
import { LogoutLink } from './LogoutLink.jsx';
import { RouteLink } from './my-router.jsx';
import { PageHeader } from './PageHeader.jsx';
import { isDeletingAccountCat, isLoggingOutFromAllDevicesCat } from './store/sharedCats.js';
import { logOutFromAllDevicesEffect } from './store/sharedEffects';

export const Security = React.memo(() => {
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
        <HorizontalCenter gap="1">
          <RiLockStarLine color={themeCssColor} />
          <RouteLink to="/security/2fa">2-Factor Authentication</RouteLink>
        </HorizontalCenter>

        <HorizontalCenter gap="1">
          <RiMailLine color={themeCssColor} />
          <RouteLink to="/security/email">Change email</RouteLink>
        </HorizontalCenter>

        <HorizontalCenter gap="1">
          <RiLockPasswordLine color={themeCssColor} />
          <RouteLink to="/security/password">Change password</RouteLink>
        </HorizontalCenter>

        <LogoutLink />

        <Button variant="ghost" onClick={logOutFromAllDevicesEffect}>
          <RiDeviceLine />
          Log out from all devices
        </Button>

        <DeleteAccountLink />
      </ItemsWrapper>
    </>
  );
});
