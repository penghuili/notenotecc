import { Button, Descriptions, Typography } from '@douyinfe/semi-ui';
import { RiMoneyDollarCircleLine, RiSettings3Line, RiShieldCheckLine } from '@remixicon/react';
import React, { useMemo } from 'react';
import { BabyLink } from 'react-baby-router';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { PublicLinks } from '../components/PublicLinks.jsx';
import { useIsAdmin } from '../lib/useIsAdmin.js';
import { getFileSizeString } from '../shared/browser/file';
import { PageContent } from '../shared/browser/PageContent.jsx';
import { isLoadingAccountCat, settingsCat, userCat } from '../shared/browser/store/sharedCats.js';
import { fetchSettingsEffect } from '../shared/browser/store/sharedEffects';
import { formatDateTime } from '../shared/js/date';
import { AppVersion } from '../shared/semi/AppVersion.jsx';
import { ItemsWrapper } from '../shared/semi/ItemsWrapper.jsx';
import { LogoutLink } from '../shared/semi/LogoutLink.jsx';
import { PageHeader } from '../shared/semi/PageHeader.jsx';
import { PaymentStatus } from '../shared/semi/PaymentStatus.jsx';
import { PrepareData } from '../shared/semi/PrepareData.jsx';

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
          <BabyLink to="/upgrade">
            <Button theme="outline" icon={<RiMoneyDollarCircleLine />}>
              Subscription
            </Button>
          </BabyLink>

          <BabyLink to="/security">
            <Button theme="outline" icon={<RiShieldCheckLine />}>
              Security
            </Button>
          </BabyLink>

          <BabyLink to="/settings">
            <Button theme="outline" icon={<RiSettings3Line />}>
              Settings
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

  const data = useMemo(() => {
    if (!account || !settings) {
      return [];
    }
    return [
      { key: 'Email', value: account.email },
      { key: 'User Id', value: <Typography.Text copyable>{account.id}</Typography.Text> },
      { key: 'Created at', value: formatDateTime(account.createdAt) },
      {
        key: 'Payment',
        value: <PaymentStatus />,
      },
      { key: 'Notes count', value: settings?.notesCount || 0 },
      ...(isAdmin
        ? [
            { key: 'Files size', value: getFileSizeString(settings?.filesSize || 0) },
            {
              key: 'Encrypted files size',
              value: getFileSizeString(settings?.encryptedFilesSize || 0),
            },
          ]
        : []),
    ];
  }, [account, isAdmin, settings]);

  if (!account?.id) {
    return null;
  }

  return <Descriptions data={data} style={{ marginBottom: '1rem' }} />;
});
