import 'inobounce';

import React from 'react';

import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { FullScreenImage } from './components/FullScreenImage.jsx';
import { Router } from './Router.jsx';
import { disablePullToRefresh } from './shared/browser/bodySccroll.js';
import { saveTWA } from './shared/browser/device.js';
import { initShared } from './shared/browser/initShared';
import { IOSNoBouncing } from './shared/browser/IOSNoBouncing.jsx';
import { registerSW } from './shared/browser/registerSW.js';
import { Scrollbar } from './shared/browser/Scrollbar.jsx';
import { Toast } from './shared/browser/Toast.jsx';
import { apps } from './shared/js/apps';
import { AppWrapper } from './shared/semi/AppWrapper.jsx';

saveTWA();

initShared({
  logo: '/icons2/t/icon-192.png',
  app: apps['notenote.cc'].name,
  privacyUrl: 'https://notenote.cc/privacy/',
  termsUrl: 'https://notenote.cc/terms/',
  showNewVersion: true,
});

registerSW();

disablePullToRefresh();

function App() {
  return (
    <ErrorBoundary>
      <AppWrapper>
        <Router />

        <FullScreenImage />
        <Toast />
        <Scrollbar thumbColor="#5580feab" trackColor="#2b64ff3b" />
        <IOSNoBouncing />
      </AppWrapper>
    </ErrorBoundary>
  );
}

export default App;
