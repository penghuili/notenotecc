import { Avatar, Flex, Heading, IconButton, Spinner } from '@radix-ui/themes';
import { RiArrowLeftLine } from '@remixicon/react';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import { widthWithoutScrollbar } from './getScrollbarWidth.js';
import { HorizontalCenter } from './HorizontalCenter.jsx';
import { logo, showNewVersion } from './initShared';
import { NewVersionAvailable } from './NewVersionAvailable.jsx';
import { UpgradeButton } from './PaymentStatus.jsx';
import { ScrollToTop } from './ScrollToTop.jsx';
import { goBackEffect } from './store/sharedEffects';
import { TopBanner } from './TopBanner.jsx';

const Wrapper = styled(Flex)`
  width: ${widthWithoutScrollbar}px;
  height: var(--space-8);
  padding: 0.5rem 0;

  position: fixed;
  left: 0;
  top: env(safe-area-inset-top);
  z-index: 2000;

  background-color: white;
`;
const Content = styled(Flex)`
  width: 100%;
  max-width: 600px;
  z-index: 1;
  padding: 0 0.5rem;
`;
const Placeholder = styled.div`
  height: calc(var(--space-8) + var(--space-2));
`;

export function PageHeader({ title, right, isLoading, hasBack }) {
  const iconElement = useMemo(() => {
    if (hasBack) {
      return (
        <IconButton onClick={goBackEffect} variant="ghost">
          <RiArrowLeftLine />
        </IconButton>
      );
    }

    return <Avatar src={logo} />;
  }, [hasBack]);

  return (
    <>
      <Wrapper justify="center" align="center">
        <Content direction="row" justify="between">
          <HorizontalCenter gap="2">
            {iconElement}

            <Heading size="4" as="h1">
              {title}
            </Heading>

            {!!isLoading && <Spinner />}
          </HorizontalCenter>

          <HorizontalCenter gap="1">
            <ScrollToTop />
            <UpgradeButton />
            {right}
          </HorizontalCenter>
        </Content>
      </Wrapper>

      <Placeholder />

      {showNewVersion && <NewVersionAvailable />}

      <TopBanner />
    </>
  );
}
