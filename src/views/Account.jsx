import { Button, DataList, Flex, IconButton, Text } from '@radix-ui/themes';
import {
  RiFileCopyLine,
  RiMoneyDollarCircleLine,
  RiSettings3Line,
  RiShieldCheckLine,
} from '@remixicon/react';
import React, { useCallback } from 'react';
import { BabyLink } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { PrepareData } from '../components/PrepareData.jsx';
import { PublicLinks } from '../components/PublicLinks.jsx';
import { useIsAdmin } from '../lib/useIsAdmin.js';
import { copyToClipboard } from '../shared/browser/copyToClipboard';
import { getFileSizeString } from '../shared/browser/file';
import { isTesting } from '../shared/browser/isTesting.js';
import { PageContent } from '../shared/browser/PageContent.jsx';
import { isLoadingAccountCat, settingsCat, userCat } from '../shared/browser/store/sharedCats.js';
import { fetchSettingsEffect, setToastEffect } from '../shared/browser/store/sharedEffects';
import { formatDateTime } from '../shared/js/date';
import { AppVersion } from '../shared/radix/AppVersion.jsx';
import { ItemsWrapper } from '../shared/radix/ItemsWrapper.jsx';
import { LogoutLink } from '../shared/radix/LogoutLink.jsx';
import { PageHeader } from '../shared/radix/PageHeader.jsx';
import { PaymentStatus } from '../shared/radix/PaymentStatus.jsx';

async function load() {
  await fetchSettingsEffect();
}

export const Account = fastMemo(() => {
  return (
    <PrepareData load={load}>
      <PageContent>
        <Header />

        <AccountInfo />

        <ItemsWrapper align="start">
          {!isTesting() && (
            <BabyLink to="/upgrade">
              <Button variant="ghost">
                <RiMoneyDollarCircleLine /> Subscription
              </Button>
            </BabyLink>
          )}

          <BabyLink to="/security">
            <Button variant="ghost">
              <RiShieldCheckLine /> Security
            </Button>
          </BabyLink>

          <BabyLink to="/settings">
            <Button variant="ghost">
              <RiSettings3Line /> Settings
            </Button>
          </BabyLink>
        </ItemsWrapper>

        <PublicLinks />

        <ItemsWrapper align="start">
          <LogoutLink />

          <AppVersion />
        </ItemsWrapper>
      </PageContent>
    </PrepareData>
  );
});

const Header = fastMemo(() => {
  const isLoadingAccount = useCat(isLoadingAccountCat);

  return <PageHeader title="Account" isLoading={isLoadingAccount} hasBack />;
});

const AccountInfo = fastMemo(() => {
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
