import './theme.css';
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
import { Toast } from './shared/browser/Toast.jsx';
import { apps } from './shared/js/apps';
import { AppWrapper } from './shared/radix/AppWrapper.jsx';
import { Scrollbar } from './shared/radix/Scrollbar.jsx';

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
        <Scrollbar />
        <IOSNoBouncing />
      </AppWrapper>
    </ErrorBoundary>
  );
}

export default App;
