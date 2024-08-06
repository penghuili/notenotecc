import { DataList, Flex, IconButton, Text } from '@radix-ui/themes';
import { RiFileCopyLine, RiLockLine } from '@remixicon/react';
import React, { useCallback } from 'react';
import { useCat } from 'usecat';

import { PrepareData } from '../components/PrepareData.jsx';
import { formatDateTime } from '../shared-private/js/date';
import { AppVersion } from '../shared-private/react/AppVersion.jsx';
import { themeCssColor } from '../shared-private/react/AppWrapper.jsx';
import { copyToClipboard } from '../shared-private/react/copyToClipboard';
import { getFileSizeString } from '../shared-private/react/file';
import { HorizontalCenter } from '../shared-private/react/HorizontalCenter.jsx';
import { ItemsWrapper } from '../shared-private/react/ItemsWrapper.jsx';
import { LogoutLink } from '../shared-private/react/LogoutLink.jsx';
import { RouteLink } from '../shared-private/react/my-router.jsx';
import { PageHeader } from '../shared-private/react/PageHeader.jsx';
import { PaymentStatus } from '../shared-private/react/PaymentStatus.jsx';
import {
  isLoadingAccountCat,
  settingsCat,
  userCat,
} from '../shared-private/react/store/sharedCats.js';
import { fetchSettingsEffect, setToastEffect } from '../shared-private/react/store/sharedEffects';

async function load() {
  await fetchSettingsEffect();
}

export const Account = React.memo(() => {
  return (
    <PrepareData load={load}>
      <Header />

      <AccountInfo />

      <ItemsWrapper align="start">
        <HorizontalCenter gap="1">
          <RiLockLine color={themeCssColor} />
          <RouteLink to="/security">Security</RouteLink>
        </HorizontalCenter>
      </ItemsWrapper>

      <ItemsWrapper align="start">
        <LogoutLink />
      </ItemsWrapper>

      <ItemsWrapper align="start">
        <AppVersion />
      </ItemsWrapper>
    </PrepareData>
  );
});

const Header = React.memo(() => {
  const isLoadingAccount = useCat(isLoadingAccountCat);

  return <PageHeader title="Account" isLoading={isLoadingAccount} fixed hasBack />;
});

const AccountInfo = React.memo(() => {
  const account = useCat(userCat);
  const settings = useCat(settingsCat);

  const handleCopyUserId = useCallback(() => {
    copyToClipboard(account.id);
    setToastEffect('Copied!');
  }, [account.id]);

  if (!account?.id) {
    return null;
  }

  return (
    <ItemsWrapper align="start">
      <DataList.Root>
        <DataList.Item>
          <DataList.Label minWidth="88px">Email</DataList.Label>
          <DataList.Value>
            <Text size="3">{account.email}</Text>
          </DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label minWidth="88px">User Id</DataList.Label>
          <DataList.Value>
            <Flex align="center" gap="2">
              <Text size="3">{account.id}</Text>
              <IconButton color="gray" variant="ghost" onClick={handleCopyUserId}>
                <RiFileCopyLine />
              </IconButton>
            </Flex>
          </DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label minWidth="88px">Created at</DataList.Label>
          <DataList.Value>
            <Text size="3">{formatDateTime(account.createdAt)}</Text>
          </DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label minWidth="88px">Valid until</DataList.Label>
          <DataList.Value>
            <PaymentStatus />
          </DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label minWidth="88px">Notes count</DataList.Label>
          <DataList.Value>
            <Text size="3">{settings?.notesCount || 0}</Text>
          </DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label minWidth="88px">Files size</DataList.Label>
          <DataList.Value>
            <Text size="3">{getFileSizeString(settings?.filesSize || 0)}</Text>
          </DataList.Value>
        </DataList.Item>

        <DataList.Item>
          <DataList.Label minWidth="88px">Encrypted files size</DataList.Label>
          <DataList.Value>
            <Text size="3">{getFileSizeString(settings?.encryptedFilesSize || 0)}</Text>
          </DataList.Value>
        </DataList.Item>
      </DataList.Root>
    </ItemsWrapper>
  );
});
