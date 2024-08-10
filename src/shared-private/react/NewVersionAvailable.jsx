import { Button, Text } from '@radix-ui/themes';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { Banner } from './Banner.jsx';

export function NewVersionAvailable() {
  const [newVersion, setNewVersion] = useState('');
  const [changes, setChanges] = useState('');

  useEffect(() => {
    async function fetchNewVersion() {
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

    window.addEventListener('focus', fetchNewVersion);

    fetchNewVersion();

    return () => window.removeEventListener('focus', fetchNewVersion);
  }, []);

  if (!newVersion) {
    return null;
  }

  return (
    <Wrapper>
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
    </Wrapper>
  );
}

const Wrapper = styled.div`
  margin-bottom: 2rem;
`;
