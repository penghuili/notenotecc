import { Avatar, Flex, Heading, IconButton, Spinner } from '@radix-ui/themes';
import { RiAccountCircleLine, RiArrowLeftLine } from '@remixicon/react';
import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useCat } from 'usecat';

import { HorizontalCenter } from './HorizontalCenter.jsx';
import { logo, showNewVersion } from './initShared';
import { NewVersionAvailable } from './NewVersionAvailable.jsx';
import { isLoggedInCat } from './store/sharedCats.js';
import { goBackEffect, navigateEffect } from './store/sharedEffects';

const Wrapper = styled(Flex)`
  width: ${props => (props.fixed ? `${props.width}px` : '100%')};
  height: var(--space-8);

  position: ${props => (props.fixed ? 'fixed' : 'static')};
  padding: 0.5rem 0;
  z-index: ${props => props.zindex};
  left: 0;
  top: env(safe-area-inset-top);

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

export function PageHeader({ fixed, title, right, isLoading, hasBack }) {
  const isLoggedIn = useCat(isLoggedInCat);

  const handleNavigateToAccount = useCallback(() => navigateEffect('/account'), []);

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

  const userElement = useMemo(() => {
    if (!isLoggedIn || hasBack || right) {
      return null;
    }

    return (
      <IconButton onClick={handleNavigateToAccount} variant="ghost">
        <RiAccountCircleLine />
      </IconButton>
    );
  }, [handleNavigateToAccount, hasBack, isLoggedIn, right]);

  return (
    <>
      <Wrapper
        justify="center"
        align="center"
        zindex={2000}
        width={document.documentElement.clientWidth}
        fixed={fixed ? 'fixed' : ''}
      >
        <Content direction="row" justify="between">
          <HorizontalCenter gap="2">
            {iconElement}

            <Heading size="4" as="h1">
              {title}
            </Heading>

            {!!isLoading && <Spinner />}
          </HorizontalCenter>

          <HorizontalCenter gap="1">
            {right}
            {userElement}
          </HorizontalCenter>
        </Content>
      </Wrapper>

      {fixed && <Placeholder />}

      {showNewVersion && <NewVersionAvailable />}
    </>
  );
}
