import './theme.css';

import React from 'react';

import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { Router } from './Router.jsx';
import { apps } from './shared/js/apps';
import { AppWrapper, hasPageMinHeightCat } from './shared/react/AppWrapper.jsx';
import { initShared } from './shared/react/initShared';
import { registerSW } from './shared/react/registerSW.js';
import { Toast } from './shared/react/Toast.jsx';

initShared({
  logo: '/icons2/t/icon-192.png',
  app: apps.simplestcam.name,
  privacyUrl: 'https://remiind.cc/privacy/',
  termsUrl: 'https://remiind.cc/terms/',
  showNewVersion: true,
});

registerSW();

hasPageMinHeightCat.set(false);

function App() {
  return (
    <ErrorBoundary>
      <AppWrapper>
        <Router />

        <Toast />
      </AppWrapper>
    </ErrorBoundary>
  );
}

export default App;
