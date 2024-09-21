import { Flex } from '@radix-ui/themes';
import { Button } from '@radix-ui/themes/dist/cjs/index.js';
import React, { useCallback, useState } from 'react';
import { useCat } from 'usecat';

import { isLoadingSettingsCat, useExpiresAt } from '../shared/browser/store/sharedCats.js';
import { InputField } from '../shared/radix/InputField.jsx';
import { ItemsWrapper } from '../shared/radix/ItemsWrapper.jsx';
import { isVerifyingAppsumoCat } from '../store/pay/payCats.js';
import { verifyAppsumoEffect } from '../store/pay/payEffects.js';

export function AppsumoCode() {
  const expiresAt = useExpiresAt();
  const isLoadingSettings = useCat(isLoadingSettingsCat);
  const isVerifying = useCat(isVerifyingAppsumoCat);

  const [code, setCode] = useState('');

  const handleClick = useCallback(() => {
    verifyAppsumoEffect(code);
  }, [code]);

  if (isLoadingSettings || expiresAt === 'forever') {
    return null;
  }

  return (
    <ItemsWrapper>
      <Flex align="end">
        <InputField label="Code from Appsumo" value={code} onChange={setCode} />

        <Button ml="4" disabled={!code || isVerifying} onClick={handleClick}>
          Activate
        </Button>
      </Flex>
    </ItemsWrapper>
  );
}
