import { Avatar, Heading, Text } from '@radix-ui/themes';
import React, { useState } from 'react';

import { FormButton } from './FormButton.jsx';
import { HorizontalCenter } from './HorizontalCenter.jsx';
import { logo } from './initShared';
import { InputField } from './InputField.jsx';
import { ItemsWrapper } from './ItemsWrapper.jsx';
import { LinkButton } from './LinkButton.jsx';
import { LogoutLink } from './LogoutLink.jsx';
import { RouteLink } from './RouteLink.jsx';
import { useCat } from './store/cat.js';
import { isResendingVerificationCodeCat, isVerifyingEmailCat } from './store/sharedCats.js';
import { resendVerificationCodeEffect, verifyEmailEffect } from './store/sharedEffects';

export function VerifyEmail() {
  const isVerifying = useCat(isVerifyingEmailCat);
  const isResending = useCat(isResendingVerificationCodeCat);

  const [code, setCode] = useState('');

  function handleVerify() {
    verifyEmailEffect(code);
  }

  return (
    <>
      <ItemsWrapper>
        <HorizontalCenter p="2rem 0 0" gap="2">
          <Avatar src={logo} /> <Heading as="h2">remiind.cc</Heading>
        </HorizontalCenter>
        <Heading>Verify your email</Heading>
      </ItemsWrapper>

      <ItemsWrapper>
        <Text>
          You should get a verification email shortly, paste the verification code from the email
          below to verify your email.
        </Text>
        <InputField
          label="Verification code"
          value={code}
          onChange={setCode}
          onSubmit={handleVerify}
        />

        <FormButton disabled={!code || isVerifying} onClick={handleVerify}>
          Verify
        </FormButton>
      </ItemsWrapper>

      <ItemsWrapper align="start">
        <LinkButton onClick={resendVerificationCodeEffect} disabled={isResending}>
          Resend code
        </LinkButton>

        <LogoutLink />

        <Text>
          Used the wrong email? <RouteLink to="/security/email">Change email</RouteLink>
        </Text>
      </ItemsWrapper>
    </>
  );
}
