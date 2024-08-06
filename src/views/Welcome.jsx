import { Avatar, Heading, Link } from '@radix-ui/themes';
import React from 'react';

import { HorizontalCenter } from '../shared-private/react/HorizontalCenter.jsx';
import { appName, logo, privacyUrl, termsUrl } from '../shared-private/react/initShared';
import { ItemsWrapper } from '../shared-private/react/ItemsWrapper.jsx';
import { RouteLink } from '../shared-private/react/my-router.jsx';

export function Welcome() {
  return (
    <>
      <ItemsWrapper>
        <HorizontalCenter p="2rem 0 1rem" gap="2">
          <Avatar src={logo} /> <Heading as="h2">{appName}</Heading>
        </HorizontalCenter>
      </ItemsWrapper>

      <ItemsWrapper align="start">
        <RouteLink to="/sign-up">Sign up</RouteLink>
        <RouteLink to="/sign-in">Sign in</RouteLink>
      </ItemsWrapper>

      <ItemsWrapper align="start">
        <Link href={privacyUrl} target="_blank">
          Privacy
        </Link>
        <Link href={termsUrl} target="_blank">
          Terms
        </Link>
        <Link href="https://peng37.com/contact/" target="_blank">
          Contact
        </Link>
      </ItemsWrapper>
    </>
  );
}
