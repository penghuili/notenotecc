import { Button } from '@radix-ui/themes';
import { RiDeviceLine, RiLockPasswordLine, RiLockStarLine, RiMailLine } from '@remixicon/react';
import React from 'react';
import { useCat } from 'usecat';

import { DeleteAccountLink } from './DeleteAccountLink.jsx';
import { ItemsWrapper } from './ItemsWrapper.jsx';
import { LogoutLink } from './LogoutLink.jsx';
import { CustomRouteLink } from './my-router.jsx';
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
        <CustomRouteLink to="/security/2fa">
          <Button variant="ghost">
            <RiLockStarLine /> 2-Factor Authentication
          </Button>
        </CustomRouteLink>

        <CustomRouteLink to="/security/email">
          <Button variant="ghost">
            <RiMailLine /> Change email
          </Button>
        </CustomRouteLink>

        <CustomRouteLink to="/security/password">
          <Button variant="ghost">
            <RiLockPasswordLine /> Change password
          </Button>
        </CustomRouteLink>

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
