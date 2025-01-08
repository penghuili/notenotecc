import { Button, Typography } from '@douyinfe/semi-ui';
import { RiCheckLine, RiCloseLine } from '@remixicon/react';
import React, { useCallback, useMemo } from 'react';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { isMobileWidth } from '../shared/browser/device.js';
import { PageContent } from '../shared/browser/PageContent.jsx';
import { useExpiresAt, useFreeTrialsUntil, userCat } from '../shared/browser/store/sharedCats.js';
import { formatDate } from '../shared/js/date.js';
import { Flex } from '../shared/semi/Flex.jsx';
import { PageHeader } from '../shared/semi/PageHeader.jsx';
import { PaymentStatus } from '../shared/semi/PaymentStatus.jsx';
import { isFreeTryingCat } from '../store/pay/payCats.js';
import { freeTrialEffect } from '../store/pay/payEffects.js';

export const Upgrade = fastMemo(() => {
  return (
    <PageContent>
      <Header />

      <Prices />
    </PageContent>
  );
});

const Header = fastMemo(() => {
  const isTrying = useCat(isFreeTryingCat);

  return <PageHeader title="Upgrade to Pro" isLoading={isTrying} hasBack />;
});

const Prices = fastMemo(() => {
  const user = useCat(userCat);
  const expiresAt = useExpiresAt();
  const freeTrialUntil = useFreeTrialsUntil();
  const isTrying = useCat(isFreeTryingCat);

  const handleTry = useCallback(() => {
    freeTrialEffect();
  }, []);

  const manageElement = useMemo(() => {
    if (expiresAt && expiresAt >= formatDate(new Date())) {
      return (
        <Flex direction="row" m="1rem 0 0">
          <a href={import.meta.env.VITE_MANAGE_SUBSCRIPTION} target="_blank" rel="noreferrer">
            <Button theme="solid">Manage your subscription</Button>
          </a>
        </Flex>
      );
    }

    return null;
  }, [expiresAt]);

  return (
    <>
      <Typography.Title heading={3}>Your account status:</Typography.Title>

      <PaymentStatus />

      {manageElement}

      <Flex gap="0.5rem" direction={isMobileWidth() ? 'column' : 'row'} m="2rem 0">
        <FeatureItem
          title="Free"
          price={'$0 / month'}
          benifits={[
            { text: 'Unlimited notes', enabled: true },
            { text: 'All notes are encrypted', enabled: true },
            { text: 'Rich text editor', enabled: true },
            { text: 'Markdown editor', enabled: true },
            { text: 'Unlimited images', enabled: false },
            { text: 'Unlimited short videos', enabled: false },
            { text: 'Unlimited free drawings', bold: true, enabled: false },
          ]}
        />

        <FeatureItem
          title="Pro"
          price={'$1.99 / month'}
          benifits={[
            { text: 'Unlimited notes', enabled: true },
            { text: 'All notes are encrypted', enabled: true },
            { text: 'Rich text editor', enabled: true },
            { text: 'Markdown editor', enabled: true },
            { text: 'Unlimited images', bold: true, enabled: true },
            { text: 'Unlimited short videos', bold: true, enabled: true },
            { text: 'Unlimited free drawings', bold: true, enabled: true },
          ]}
          color="accent"
        >
          {(!expiresAt || expiresAt < formatDate(new Date())) && (
            <div style={{ marginBottom: '1rem' }}>
              <a
                href={`${import.meta.env.VITE_MONTHLY_LINK}?prefilled_email=${user?.email}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button theme="solid" type="warning">
                  Upgrade to Pro
                </Button>
              </a>
            </div>
          )}
        </FeatureItem>
      </Flex>

      {!expiresAt && !freeTrialUntil && (
        <Flex direction="row" justify="center" m="2rem 0 0">
          <Button theme="solid" onClick={handleTry} disabled={isTrying}>
            Try Pro 14 days for free
          </Button>
        </Flex>
      )}
    </>
  );
});

const FeatureItem = fastMemo(({ title, price, benifits, color, children }) => {
  return (
    <Flex
      direction="column"
      align="center"
      style={{
        position: 'relative',
        overflow: 'hidden',
        flex: 1,
        border: '1px solid var(--semi-color-border)',
        borderRadius: '6px',
        padding: '1rem',
        ...(color === 'accent' && {
          backgroundColor: 'var(--semi-color-primary)',
          color: 'white',
        }),
      }}
    >
      <Typography.Title
        heading={4}
        style={{
          color: color ? 'white' : undefined,
        }}
      >
        {title}
      </Typography.Title>
      <Typography.Title
        heading={3}
        style={{ margin: '0.5rem 0 1rem', color: color ? 'white' : undefined }}
      >
        {price}
      </Typography.Title>

      {!!benifits?.length && (
        <Flex direction="column">
          {benifits.map(benifit => (
            <Flex key={benifit.text} direction="row" align="start" gap="0.5rem">
              {benifit.enabled ? (
                <RiCheckLine color={'var(--semi-color-success)'} />
              ) : (
                <RiCloseLine />
              )}{' '}
              <Typography.Text
                strong={benifit.bold && benifit.enabled}
                style={{
                  color: color ? 'white' : undefined,
                }}
              >
                {benifit.enabled ? benifit.text : <del>{benifit.text}</del>}
              </Typography.Text>
            </Flex>
          ))}
        </Flex>
      )}
      {children}
    </Flex>
  );
});
