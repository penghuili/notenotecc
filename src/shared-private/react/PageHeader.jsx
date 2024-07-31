import { Avatar, Flex, Heading, IconButton, Spinner } from '@radix-ui/themes';
import { RiArrowLeftLine, RiUserSmileLine } from '@remixicon/react';
import React from 'react';

import { HorizontalCenter } from './HorizontalCenter.jsx';
import { logo } from './initShared';
import { useCat } from './store/cat.js';
import { isLoggedInCat } from './store/sharedCats.js';
import { goBackEffect, navigateEffect } from './store/sharedEffects';

export function PageHeader({ fixed, title, right, isLoading, hasBack, onCustomBack }) {
  const isLoggedIn = useCat(isLoggedInCat);

  const showUserIcon = isLoggedIn && !hasBack;

  function handleBack() {
    if (onCustomBack) {
      onCustomBack();
    } else {
      goBackEffect();
    }
  }

  return (
    <>
      <Flex
        justify="center"
        position={fixed ? 'fixed' : 'static'}
        left="0"
        mb="2"
        style={{
          zIndex: 2000,
          width: Math.min(window.innerWidth, document.documentElement.clientWidth),
        }}
      >
        <Flex
          direction="row"
          justify="between"
          pt="3"
          pb="4"
          style={{
            zIndex: 1,
            backgroundColor: 'white',
            width: '100%',
            maxWidth: '600px',
            paddingLeft: '4px',
            paddingRight: '4px',
          }}
        >
          <HorizontalCenter gap="2">
            {hasBack ? (
              <IconButton onClick={handleBack} variant="ghost">
                <RiArrowLeftLine />
              </IconButton>
            ) : (
              <Avatar src={logo} />
            )}
            <Heading size="4" as="h1">
              {title}
            </Heading>
            {!!isLoading && <Spinner />}
          </HorizontalCenter>
          <HorizontalCenter gap="1">
            {right}
            {showUserIcon && (
              <IconButton onClick={() => navigateEffect('/account')} variant="ghost">
                <RiUserSmileLine />
              </IconButton>
            )}
          </HorizontalCenter>
        </Flex>
      </Flex>
      {fixed && <div style={{ height: '74px' }} />}
    </>
  );
}
