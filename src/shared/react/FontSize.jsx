import { Box, RadioGroup, Text } from '@radix-ui/themes';
import React, { useCallback } from 'react';
import { useCat } from 'usecat';

import { fontScalingCat } from './AppWrapper.jsx';
import { LocalStorage, sharedLocalStorageKeys } from './LocalStorage.js';

export const FontSize = React.memo(() => {
  const scaling = useCat(fontScalingCat);

  const handleChange = useCallback(value => {
    LocalStorage.set(sharedLocalStorageKeys.fontScaling, value);
    fontScalingCat.set(value);
  }, []);

  return (
    <Box>
      <Text weight="bold">Font size</Text>
      <RadioGroup.Root value={scaling} onValueChange={handleChange} name="fontSize">
        <RadioGroup.Item value={1}>
          <Text style={{ fontSize: 'calc(16px * 1)' }}>notenote.cc</Text>
        </RadioGroup.Item>
        <RadioGroup.Item value={1.1}>
          <Text style={{ fontSize: 'calc(16px * 1.1)' }}>notenote.cc</Text>
        </RadioGroup.Item>
        <RadioGroup.Item value={1.25}>
          <Text style={{ fontSize: 'calc(16px * 1.25)' }}>notenote.cc</Text>
        </RadioGroup.Item>
        <RadioGroup.Item value={1.5}>
          <Text style={{ fontSize: 'calc(16px * 1.5)' }}>notenote.cc</Text>
        </RadioGroup.Item>
      </RadioGroup.Root>
    </Box>
  );
});
