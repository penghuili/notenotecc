import './theme.css';

import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { FullScreenImage } from './components/FullScreenImage.jsx';
import { registerSW } from './registerSW';
import { Router } from './Router.jsx';
import { apps } from './shared-private/js/apps';
import { AppWrapper } from './shared-private/react/AppWrapper.jsx';
import { HooksOutsieWrapper, setHook } from './shared-private/react/hooksOutside';
import { initShared } from './shared-private/react/initShared';
import { initEffect } from './shared-private/react/store/sharedEffects';
import { Toast } from './shared-private/react/Toast.jsx';

initShared({
  logo: '/icons/icon-192.png',
  app: apps.simplestcam.name,
  privacyUrl: 'https://remiind.cc/privacy/',
  termsUrl: 'https://remiind.cc/terms/',
});

setHook('location', useLocation);

registerSW();

function App() {
  useEffect(() => {
    initEffect();
  }, []);

  return (
    <ErrorBoundary>
      <AppWrapper>
        <Router />

        <FullScreenImage />
        <Toast />
      </AppWrapper>
      <HooksOutsieWrapper />
    </ErrorBoundary>
  );
}

export default App;
