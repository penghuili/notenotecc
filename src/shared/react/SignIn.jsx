import { Flex, Text } from '@radix-ui/themes';
import React, { useEffect, useState } from 'react';
import { useCat } from 'usecat';

import { errorColor } from './AppWrapper.jsx';
import { FormButton } from './FormButton.jsx';
import { InputField } from './InputField.jsx';
import { ItemsWrapper } from './ItemsWrapper.jsx';
import { RouteLink } from './my-router.jsx';
import { PageHeader } from './PageHeader.jsx';
import { PasswordInput } from './PasswordInput.jsx';
import { authErrorCat, isSigningInCat } from './store/sharedCats.js';
import { clearAuthErrorEffect, signInEffect } from './store/sharedEffects';

export function SignIn() {
  const errorMessage = useCat(authErrorCat);
  const isSigningIn = useCat(isSigningInCat);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    return clearAuthErrorEffect;
  }, []);

  const isDisabled = !email || !password || isSigningIn;

  function handleSubmit() {
    if (isDisabled) {
      return;
    }

    signInEffect(email, password);
  }

  return (
    <>
      <PageHeader title="Sign in" isLoading={isSigningIn} hasBack />

      <ItemsWrapper>
        <InputField
          type="email"
          label="Email"
          placeholder="Your email"
          value={email}
          onChange={setEmail}
        />

        <PasswordInput
          label="Password"
          value={password}
          onChange={setPassword}
          onSubmit={handleSubmit}
        />

        {!!errorMessage && <Text color={errorColor}>{errorMessage}</Text>}

        <FormButton onClick={handleSubmit} disabled={isDisabled} isLoading={isSigningIn}>
          Sign in
        </FormButton>

        <Flex>
          <RouteLink to="/sign-up">No account? Sign up</RouteLink>
        </Flex>

        <Flex>
          <RouteLink to="/reset-password">Forget password? Reset</RouteLink>
        </Flex>
      </ItemsWrapper>
    </>
  );
}