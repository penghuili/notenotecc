import { DataList, Flex, IconButton, Text } from '@radix-ui/themes';
import { RiCheckboxBlankCircleLine, RiFileCopyLine, RiLockLine } from '@remixicon/react';
import { useAtomValue } from 'jotai';
import React from 'react';

import { Padding } from '../components/Padding';
import { formatDateTime } from '../shared-private/js/date';
import { themeCssColor } from '../shared-private/react/AppWrapper';
import { copyToClipboard } from '../shared-private/react/copyToClipboard';
import { HorizontalCenter } from '../shared-private/react/HorizontalCenter';
import { ItemsWrapper } from '../shared-private/react/ItemsWrapper';
import { LogoutLink } from '../shared-private/react/LogoutLink';
import { PageHeader } from '../shared-private/react/PageHeader';
import { PaymentStatus } from '../shared-private/react/PaymentStatus';
import { RouteLink } from '../shared-private/react/RouteLink';
import { isLoadingAccountAtom, userAtom } from '../shared-private/react/store/sharedAtoms';
import { setToastEffect } from '../shared-private/react/store/sharedEffects';

export function Account() {
  const account = useAtomValue(userAtom);
  const isLoadingAccount = useAtomValue(isLoadingAccountAtom);

  const noalbumSortKey = `album_noalbum_${account.id}`;

  return (
    <Padding>
      <PageHeader title="Account" isLoading={isLoadingAccount} fixed hasBack />

      {!!account?.id && (
        <>
          <ItemsWrapper align="start">
            <DataList.Root>
              {!!account?.username && (
                <DataList.Item>
                  <DataList.Label minWidth="88px">Username</DataList.Label>
                  <DataList.Value>
                    <Text size="3">{account.username}</Text>
                  </DataList.Value>
                </DataList.Item>
              )}
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
                    <IconButton
                      color="gray"
                      variant="ghost"
                      onClick={() => {
                        copyToClipboard(account.id);
                        setToastEffect('Copied!');
                      }}
                    >
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
            </DataList.Root>
          </ItemsWrapper>
        </>
      )}

      <ItemsWrapper align="start">
        <HorizontalCenter gap="1">
          <RiLockLine color={themeCssColor} />
          <RouteLink to="/security">Security</RouteLink>
        </HorizontalCenter>
        <HorizontalCenter gap="1">
          <RiCheckboxBlankCircleLine color={themeCssColor} />
          <RouteLink to={`/albums/${noalbumSortKey}`}>Notes without album</RouteLink>
        </HorizontalCenter>
      </ItemsWrapper>

      <ItemsWrapper align="start">
        <LogoutLink />
      </ItemsWrapper>
    </Padding>
  );
}
