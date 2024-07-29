import { Flex, Text } from '@radix-ui/themes';
import { useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';

import { errorColor } from './AppWrapper.jsx';
import { FormButton } from './FormButton.jsx';
import { InputField } from './InputField.jsx';
import { ItemsWrapper } from './ItemsWrapper.jsx';
import { PageHeader } from './PageHeader.jsx';
import { PasswordInput } from './PasswordInput.jsx';
import { RouteLink } from './RouteLink.jsx';
import { authErrorAtom, isSigningInAtom } from './store/sharedAtoms';
import { clearAuthErrorEffect, signInEffect } from './store/sharedEffects';

export function SignIn() {
  const errorMessage = useAtomValue(authErrorAtom);
  const isSigningIn = useAtomValue(isSigningInAtom);

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