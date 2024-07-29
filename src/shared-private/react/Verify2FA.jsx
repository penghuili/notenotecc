import { Flex, Text } from '@radix-ui/themes';
import { useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';

import { errorColor } from './AppWrapper.jsx';
import { FormButton } from './FormButton.jsx';
import { InputField } from './InputField.jsx';
import { ItemsWrapper } from './ItemsWrapper.jsx';
import { PageHeader } from './PageHeader.jsx';
import { RouteLink } from './RouteLink.jsx';
import { authErrorAtom, isVerifying2FAAtom } from './store/sharedAtoms';
import { clearAuthErrorEffect, verify2FAEffect } from './store/sharedEffects';

export function Verify2FA() {
  const errorMessage = useAtomValue(authErrorAtom);
  const isVerifying = useAtomValue(isVerifying2FAAtom);

  const [code, setCode] = useState('');

  useEffect(() => {
    return clearAuthErrorEffect;
  }, []);

  const isDisabled = !code || isVerifying;
  function handleSubmit() {
    if (isDisabled) {
      return;
    }

    verify2FAEffect(code);
  }

  return (
    <>
      <PageHeader title="2-factor Authentication" isLoading={isVerifying} hasBack />

      <ItemsWrapper>
        <Text>Enter the code from your authenticator app</Text>

        <InputField
          title="Code"
          value={code}
          autoFocus
          onChange={setCode}
          onSubmit={handleSubmit}
        />
        {!!errorMessage && <Text color={errorColor}>{errorMessage}</Text>}

        <FormButton onClick={handleSubmit} disabled={isDisabled}>
          Verify
        </FormButton>

        <Flex>
          <RouteLink to="/sign-in">Cancel</RouteLink>
        </Flex>
      </ItemsWrapper>
    </>
  );
}
