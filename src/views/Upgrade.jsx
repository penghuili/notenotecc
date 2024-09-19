import { Box, Button, Flex, Heading, Text } from '@radix-ui/themes';
import { RiCheckLine, RiCloseLine } from '@remixicon/react';
import React, { useCallback, useMemo } from 'react';
import fastMemo from 'react-fast-memo';
import { useCat } from 'usecat';

import { Countdown } from '../components/Countdown/index.jsx';
import { PrepareData } from '../components/PrepareData.jsx';
import { Shine } from '../components/Shine.jsx';
import { formatDate } from '../shared/js/date.js';
import { successCssColor } from '../shared/react/AppWrapper.jsx';
import { isMobileWidth } from '../shared/react/device.js';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { PaymentStatus } from '../shared/react/PaymentStatus.jsx';
import { useExpiresAt, useFreeTrialsUntil } from '../shared/react/store/sharedCats.js';
import { isFreeTryingCat } from '../store/pay/payCats.js';
import { freeTrialEffect } from '../store/pay/payEffects.js';

export const Upgrade = fastMemo(() => {
  return (
    <PrepareData>
      <Header />

      <Prices />
    </PrepareData>
  );
});

const Header = fastMemo(() => {
  const isTrying = useCat(isFreeTryingCat);

  return <PageHeader title="Upgrade to Pro" isLoading={isTrying} hasBack />;
});

const Prices = fastMemo(() => {
  const expiresAt = useExpiresAt();
  const freeTrialUntil = useFreeTrialsUntil();
  const isTrying = useCat(isFreeTryingCat);

  const handleTry = useCallback(() => {
    freeTrialEffect();
  }, []);

  const manageElement = useMemo(() => {
    if (expiresAt && expiresAt >= formatDate(new Date())) {
      return (
        <Flex mt="4">
          <a href={import.meta.env.VITE_MANAGE_SUBSCRIPTION} target="_blank" rel="noreferrer">
            <Button variant="solid">Manage your subscription</Button>
          </a>
        </Flex>
      );
    }

    return null;
  }, [expiresAt]);

  return (
    <>
      <Heading as="h2" size="4">
        Your account status:
      </Heading>

      <PaymentStatus />

      {manageElement}

      <Flex mt="6" mb="6" gap="2" direction={isMobileWidth() ? 'column' : 'row'}>
        <FeatureItem
          title="Free"
          price={'$0 / month'}
          benifits={[
            { text: 'Unlimited notes', enabled: true },
            { text: 'All notes are encrypted', enabled: true },
            { text: 'Rich text editor', enabled: true },
            { text: 'Markdown editor', enabled: true },
            // eslint-disable-next-line sonarjs/no-duplicate-string
            { text: 'Unlimited images', enabled: false },
            // eslint-disable-next-line sonarjs/no-duplicate-string
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
            <Box mt="4">
              <a href={import.meta.env.VITE_MONTHLY_LINK} target="_blank" rel="noreferrer">
                <Button variant="solid" color="yellow">
                  Upgrade to Pro
                </Button>
              </a>
            </Box>
          )}
        </FeatureItem>

        {expiresAt !== 'forever' && (
          <FeatureItem title="Lifetime" price={'Pay $39 once, use forever'} color="gold">
            {(!expiresAt || expiresAt < formatDate(new Date())) && (
              <Flex direction="column" align="center" mt="4">
                <a href={import.meta.env.VITE_LIFETIME_LINK} target="_blank" rel="noreferrer">
                  <Button variant="solid" color="yellow">
                    Get lifetime deal
                  </Button>
                </a>
              </Flex>
            )}

            <Box mt="3">
              <Countdown targetDate="2024-09-30" />
            </Box>
            <Shine />
          </FeatureItem>
        )}
      </Flex>

      {!expiresAt && !freeTrialUntil && (
        <Flex justify="center" mt="6">
          <Button variant="solid" color="green" onClick={handleTry} disabled={isTrying}>
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
        border: '1px solid var(--gray-6)',
        borderRadius: '6px',
        padding: 'var(--space-4)',
        ...(color === 'accent' && {
          backgroundColor: 'var(--accent-9)',
          color: 'var(--accent-contrast)',
        }),
        ...(color === 'gold' && {
          backgroundColor: 'var(--gold-9)',
          color: 'var(--gold-contrast)',
        }),
      }}
    >
      <Heading as="h3" size="3">
        {title}
      </Heading>
      <Text mb="4" mt="2" size="4" weight="bold">
        {price}
      </Text>

      {!!benifits?.length && (
        <Flex direction="column">
          {benifits.map(benifit => (
            <Flex key={benifit.text} align="start" gap="2">
              {benifit.enabled ? (
                <RiCheckLine color={color ? 'var(--accent-contrast)' : successCssColor} />
              ) : (
                <RiCloseLine />
              )}{' '}
              <Text weight={benifit.bold && benifit.enabled ? 'bold' : 'normal'}>
                {benifit.enabled ? benifit.text : <del>{benifit.text}</del>}
              </Text>
            </Flex>
          ))}
        </Flex>
      )}
      {children}
    </Flex>
  );
});
