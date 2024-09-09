import './theme.css';

import React from 'react';

import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { FullScreenImage } from './components/FullScreenImage.jsx';
import { Router } from './Router.jsx';
import { apps } from './shared/js/apps';
import { AppWrapper } from './shared/react/AppWrapper.jsx';
import { initShared } from './shared/react/initShared';
import { registerSW } from './shared/react/registerSW.js';
import { Toast } from './shared/react/Toast.jsx';

initShared({
  logo: '/icons2/t/icon-192.png',
  app: apps['notenote.cc'].name,
  privacyUrl: 'https://notenote.cc/privacy/',
  termsUrl: 'https://notenote.cc/terms/',
  showNewVersion: true,
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
