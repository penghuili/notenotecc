import { Button, Text } from '@radix-ui/themes';
import React, { useEffect, useState } from 'react';

import { Banner } from './Banner.jsx';

export function NewVersionAvailable() {
  const [newVersion, setNewVersion] = useState('');
  const [changes, setChanges] = useState('');

  useEffect(() => {
    async function handleFocus() {
      try {
        const response = await fetch(`${location.origin}/version.json`);
        const json = await response.json();
        if (json?.version && json.version > import.meta.env.VITE_VERSION) {
          setNewVersion(json.version);
          setChanges(json.changes);
        }
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [newVersion]);

  if (!newVersion) {
    return null;
  }

  return (
    <Banner
      open
      right={
        <Button
          variant="soft"
          onClick={() => {
            location.reload();
          }}
        >
          Update
        </Button>
      }
    >
      <Text weight="bold" as="p">
        New version available: {newVersion}
      </Text>
      <Text as="p">{changes || 'Tiny changes.'}</Text>
    </Banner>
  );
}
