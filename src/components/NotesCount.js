import { Text } from '@radix-ui/themes';
import { useAtomValue } from 'jotai';
import React from 'react';

import { getFileSizeString } from '../shared-private/react/file';
import { settingsAtom } from '../shared-private/react/store/sharedAtoms';

export function NotesCount() {
  const settings = useAtomValue(settingsAtom);

  const count = settings?.notesCount || 0;
  const filesSize = settings?.filesSize || 0;
  return (
    <Text as="p" size="1">
      ({count}, {getFileSizeString(filesSize)})
    </Text>
  );
}
