import { Button, Flex, Link, Text } from '@radix-ui/themes';
import { RiExternalLinkLine, RiSmartphoneLine } from '@remixicon/react';
import React, { useCallback } from 'react';
import fastMemo from 'react-fast-memo';

import { playStoreLink } from '../lib/constants';
import { copyToClipboard } from '../shared/browser/copyToClipboard';
import { isAndroidApp, isInstalledOnHomeScreen, isIOSBrowser } from '../shared/browser/device';
import { setToastEffect } from '../shared/browser/store/sharedEffects';

export const InstallApp = fastMemo(() => {
  const handleCopy = useCallback(async () => {
    await copyToClipboard('https://app.notenote.cc');
    setToastEffect('Link copied!');
  }, []);

  if (isAndroidApp() || isInstalledOnHomeScreen()) {
    return (
      <Flex direction="column" align="start">
        <Button variant="ghost" onClick={handleCopy}>
          <RiExternalLinkLine /> app.notenote.cc
        </Button>
        <Text size="1">Use the web app on your laptop.</Text>
      </Flex>
    );
  }

  if (isIOSBrowser()) {
    return (
      <Flex direction="column" align="start">
        <Button variant="ghost">
          <RiSmartphoneLine /> Add to Home Screen
        </Button>
        <Text size="1">
          Tap the Share icon, then tap "Add to Home Screen", notenote.cc will be exactly like an
          app.
        </Text>
      </Flex>
    );
  }

  return (
    <Link href={playStoreLink} target="_blank" rel="noreferrer">
      <img src="https://notenote.cc/play-store.svg" alt="Play store" height="50" />
    </Link>
  );
});
