import { Button, DataList, Flex, IconButton, Text } from '@radix-ui/themes';
import {
  RiCodeLine,
  RiFileCopyLine,
  RiHeartLine,
  RiHomeLine,
  RiMoneyDollarCircleLine,
  RiServiceLine,
  RiShieldCheckLine,
} from '@remixicon/react';
import React, { useCallback } from 'react';
import { useCat } from 'usecat';

import { PrepareData } from '../components/PrepareData.jsx';
import { useIsAdmin } from '../lib/useIsAdmin.js';
import { formatDateTime } from '../shared/js/date';
import { AppVersion } from '../shared/react/AppVersion.jsx';
import { copyToClipboard } from '../shared/react/copyToClipboard';
import { getFileSizeString } from '../shared/react/file';
import { isTesting } from '../shared/react/isTesting.js';
import { ItemsWrapper } from '../shared/react/ItemsWrapper.jsx';
import { LogoutLink } from '../shared/react/LogoutLink.jsx';
import { CustomRouteLink } from '../shared/react/my-router.jsx';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { PaymentStatus } from '../shared/react/PaymentStatus.jsx';
import { isLoadingAccountCat, settingsCat, userCat } from '../shared/react/store/sharedCats.js';
import { fetchSettingsEffect, setToastEffect } from '../shared/react/store/sharedEffects';

async function load() {
  await fetchSettingsEffect();
}

export const Account = React.memo(() => {
  return (
    <PrepareData load={load}>
      <Header />

      <AccountInfo />

      <ItemsWrapper align="start">
        {!isTesting() && (
          <CustomRouteLink to="/upgrade">
            <Button variant="ghost">
              <RiMoneyDollarCircleLine /> Subscription
            </Button>
          </CustomRouteLink>
        )}

        <CustomRouteLink to="/security">
          <Button variant="ghost">
            <RiShieldCheckLine /> Security
          </Button>
        </CustomRouteLink>
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

      <ItemsWrapper align="start">
        <LogoutLink />

        <AppVersion />
      </ItemsWrapper>
    </PrepareData>
  );
});

const Header = React.memo(() => {
  const isLoadingAccount = useCat(isLoadingAccountCat);

  return <PageHeader title="Account" isLoading={isLoadingAccount} hasBack />;
});

const AccountInfo = React.memo(() => {
  const account = useCat(userCat);
  const settings = useCat(settingsCat);
  const isAdmin = useIsAdmin();

  const handleCopyUserId = useCallback(async () => {
    await copyToClipboard(account.id);
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

        {!isTesting() && (
          <DataList.Item>
            <DataList.Label minWidth="88px">Valid until</DataList.Label>
            <DataList.Value>
              <PaymentStatus />
            </DataList.Value>
          </DataList.Item>
        )}

        <DataList.Item>
          <DataList.Label minWidth="88px">Notes count</DataList.Label>
          <DataList.Value>
            <Text size="3">{settings?.notesCount || 0}</Text>
          </DataList.Value>
        </DataList.Item>

        {isAdmin && (
          <>
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
          </>
        )}
      </DataList.Root>
    </ItemsWrapper>
  );
});
