import './theme.css';

import { Flex } from '@radix-ui/themes/dist/cjs';
import React from 'react';

import { AppWrapper } from './components/AppWrapper';
import { Camera } from './components/Camera';
import { ErrorBoundary } from './components/ErrorBoundary';
import { isAndroidPhone, isIOS } from './components/isAndroid';
import { registerSW } from './registerSW';
import { initShared } from './shared-private/react/initShared';
import { Toast } from './shared-private/react/Toast';

initShared({
  logo: '/icons/icon-192.png',
  app: 'SimplestCam',
});

registerSW();

function App() {
  return (
    <ErrorBoundary>
      <AppWrapper>
        {isAndroidPhone() || isIOS() ? (
          <Camera />
        ) : (
          <Flex justify="center" pt="6" px="2">
            Use it on your phone.
          </Flex>
        )}

        <Toast position="bottom-right" />
      </AppWrapper>
    </ErrorBoundary>
  );
}

export default App;
