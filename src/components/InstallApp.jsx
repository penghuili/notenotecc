import { Button, Flex, Link, Text } from '@radix-ui/themes';
import { RiExternalLinkLine, RiSmartphoneLine } from '@remixicon/react';
import React from 'react';

import {
  isAndroidApp,
  isAndroidBrowser,
  isInstalledOnHomeScreen,
  isIOSBrowser,
} from '../shared/react/device.js';

const playStoreLink = 'https://play.google.com/store/apps/details?id=cc.notenote.app.twa';

export const InstallApp = React.memo(() => {
  if (isAndroidApp() || isInstalledOnHomeScreen()) {
    return (
      <Flex direction="column" align="start">
        <Link href="https://app.notenote.cc" target="_blank" rel="noreferrer">
          <Button variant="ghost">
            <RiExternalLinkLine /> app.notenote.cc
          </Button>
        </Link>
        <Text size="1">Use the web app on your laptop.</Text>
      </Flex>
    );
  }

  if (isAndroidBrowser()) {
    return (
      <Link href={playStoreLink} target="_blank" rel="noreferrer">
        <img src="https://notenote.cc/play-store.svg" alt="Play store" height="50" />
      </Link>
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

  return null;
});
