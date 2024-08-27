import { Box, Button, Flex, Heading, Text } from '@radix-ui/themes';
import { RiCheckLine } from '@remixicon/react';
import React, { useCallback, useMemo } from 'react';
import { useCat } from 'usecat';

import { PrepareData } from '../components/PrepareData.jsx';
import { formatDate } from '../shared/js/date.js';
import { successCssColor } from '../shared/react/AppWrapper.jsx';
import { isMobileWidth } from '../shared/react/device.js';
import { PageHeader } from '../shared/react/PageHeader.jsx';
import { PaymentStatus } from '../shared/react/PaymentStatus.jsx';
import { useExpiresAt, useFreeTrialsUntil } from '../shared/react/store/sharedCats.js';
import { isFreeTryingCat } from '../store/pay/payCats.js';
import { freeTrialEffect } from '../store/pay/payEffects.js';

export const Upgrade = React.memo(() => {
  return (
    <PrepareData>
      <Header />

      <Prices />
    </PrepareData>
  );
});

const Header = React.memo(() => {
  const isTrying = useCat(isFreeTryingCat);

  return <PageHeader title="Upgrade to Pro" isLoading={isTrying} hasBack />;
});

const Prices = React.memo(() => {
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
          price={0}
          benifits={[
            { text: 'Unlimited notes' },
            { text: 'All notes are encrypted' },
            { text: 'Rich text editor' },
            { text: 'Markdown editor' },
          ]}
        />

        <FeatureItem
          title="Pro"
          price={1.99}
          benifits={[
            { text: 'Everything in Free' },
            { text: 'Unlimited images', bold: true },
            { text: 'Unlimited short videos', bold: true },
          ]}
          accent
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

const FeatureItem = React.memo(({ title, price, benifits, accent, children }) => {
  return (
    <Flex
      direction="column"
      align="center"
      style={{
        border: '1px solid var(--gray-6)',
        borderRadius: '6px',
        padding: 'var(--space-4)',
        ...(accent && {
          backgroundColor: 'var(--accent-9)',
          color: 'var(--accent-contrast)',
        }),
      }}
    >
      <Heading as="h3" size="3">
        {title}
      </Heading>
      <Text mb="4" mt="2" size="5">
        ${price}/month
      </Text>

      <Flex direction="column">
        {benifits.map(benifit => (
          <Flex key={benifit.text} align="center" gap="2">
            <RiCheckLine color={accent ? 'var(--accent-contrast)' : successCssColor} />{' '}
            <Text weight={benifit.bold ? 'bold' : 'normal'}>{benifit.text}</Text>
          </Flex>
        ))}
      </Flex>
      {children}
    </Flex>
  );
});
