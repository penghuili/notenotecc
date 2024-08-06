import './theme.css';

import React from 'react';

import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { FullScreenImage } from './components/FullScreenImage.jsx';
import { Router } from './Router.jsx';
import { apps } from './shared-private/js/apps';
import { AppWrapper } from './shared-private/react/AppWrapper.jsx';
import { initShared } from './shared-private/react/initShared';
import { registerSW } from './shared-private/react/registerSW.js';
import { Toast } from './shared-private/react/Toast.jsx';

initShared({
  logo: '/icons/icon-192.png',
  app: apps.simplestcam.name,
  privacyUrl: 'https://remiind.cc/privacy/',
  termsUrl: 'https://remiind.cc/terms/',
});

registerSW();

function App() {
  return (
    <ErrorBoundary>
      <AppWrapper>
        <Router />

        <FullScreenImage />
        <Toast />
      </AppWrapper>
    </ErrorBoundary>
  );
}

export default App;
